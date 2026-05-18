// ONE single serverless function handles ALL API routes
// This keeps us within Vercel Hobby plan's 12 function limit
// Routes: /api/auth/*, /api/products/*, /api/orders/*, /api/categories/*, /api/wallet/*, /api/admin/*

const connectDB = require('../lib/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ─── Models ───────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

// User Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  walletBalance: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isFirstOrderCompleted: { type: Boolean, default: false }
}, { timestamps: true });
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function(p) { return bcrypt.compare(p, this.password); };
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subtitle: String,
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  finalPrice: Number,
  category: { type: String, required: true },
  section: { type: String, default: 'trending' },
  sizes: [String], variants: [String],
  stock: { type: Number, default: 0 },
  images: [String], videos: [String],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });
productSchema.pre('save', function(next) {
  this.finalPrice = this.price - (this.price * this.discount / 100);
  next();
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Order Model
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    size: String, variant: String
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['pending','processing','shipped','delivered','cancelled'], default: 'pending' },
  shippingAddress: { name: String, phone: String, address: String, city: String, pincode: String },
  paymentMethod: { type: String, default: 'cod' },
  trackingNumber: String,
  trackingUpdates: [{ status: String, message: String, timestamp: { type: Date, default: Date.now } }]
}, { timestamps: true });
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Category Model
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  icon: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// Settings Model
const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed,
  description: String
}, { timestamps: true });
const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// WalletTransaction Model
const walletTxSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['referral_bonus','referral_reward','cashback','debit'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });
const WalletTransaction = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTxSchema);

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getAuthUser(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw { status: 401, message: 'No token provided' };
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) throw { status: 401, message: 'Invalid token' };
  return user;
}

async function requireAdmin(req) {
  const user = await getAuthUser(req);
  if (user.role !== 'admin') throw { status: 403, message: 'Admin access required' };
  return user;
}

async function creditWallet(userId, amount, type, description, relatedUser = null, relatedOrder = null) {
  await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
  await WalletTransaction.create({ user: userId, type, amount, description, relatedUser, relatedOrder });
}

async function generateReferralCode() {
  const prefixes = ['USR', 'SHOP', 'WEL', 'REF'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let code, exists = true;
  while (exists) {
    code = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    exists = await User.findOne({ referralCode: code });
  }
  return code;
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();

    // Parse slug: /api/[...slug] → slug array
    // e.g. /api/auth/login → ['auth', 'login']
    // e.g. /api/products/123/reviews → ['products', '123', 'reviews']
    const slug = req.query.slug || [];
    const [resource, id, sub, subId] = slug;
    const method = req.method;

    // ── HEALTH ──────────────────────────────────────────────────────────────
    if (resource === 'health') {
      return res.json({ status: 'OK', message: 'Wellness Store API is running' });
    }

    // ── AUTH ─────────────────────────────────────────────────────────────────
    if (resource === 'auth') {

      // POST /api/auth/register
      if (method === 'POST' && id === 'register') {
        const { name, identifier, password, referralCode } = req.body;
        if (!name || !identifier || !password)
          return res.status(400).json({ message: 'Name, identifier and password required' });
        if (password.length < 6)
          return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const existing = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
        if (existing) return res.status(400).json({ message: 'User already exists' });

        const isEmail = identifier.includes('@');
        const userData = {
          name, password,
          [isEmail ? 'email' : 'mobile']: identifier,
          [isEmail ? 'mobile' : 'email']: isEmail ? `mobile_${Date.now()}` : `email_${Date.now()}@temp.com`,
          referralCode: await generateReferralCode(),
        };

        let referrer = null;
        if (referralCode?.trim()) {
          referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
          if (!referrer) return res.status(400).json({ message: 'Invalid referral code' });
          userData.referredBy = referrer._id;
        }

        const user = new User(userData);
        await user.save();

        if (referrer && referrer._id.toString() !== user._id.toString()) {
          await creditWallet(user._id, 30, 'referral_bonus', `Welcome bonus for using referral code ${referralCode}`, referrer._id);
          await creditWallet(referrer._id, 10, 'referral_reward', `${user.name} signed up using your referral code`, user._id);
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
          message: 'User registered successfully', token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role, walletBalance: user.walletBalance, referralCode: user.referralCode }
        });
      }

      // POST /api/auth/login
      if (method === 'POST' && id === 'login') {
        const { identifier, password } = req.body;
        if (!identifier || !password)
          return res.status(400).json({ message: 'Identifier and password required' });
        const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }], isActive: true });
        if (!user || !(await user.comparePassword(password)))
          return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.json({
          message: 'Login successful', token,
          user: { id: user._id, name: user.name, email: user.email, role: user.role, walletBalance: user.walletBalance, referralCode: user.referralCode }
        });
      }

      // GET /api/auth/me
      if (method === 'GET' && id === 'me') {
        const user = await getAuthUser(req);
        return res.json({ user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, walletBalance: user.walletBalance, referralCode: user.referralCode } });
      }

      // POST /api/auth/create-admin
      if (method === 'POST' && id === 'create-admin') {
        const existing = await User.findOne({ email: 'admin@admin.com' });
        if (existing) return res.status(400).json({ message: 'Admin already exists' });
        const admin = new User({ name: 'Admin', email: 'admin@admin.com', mobile: '1111111111', password: 'admin123', role: 'admin' });
        await admin.save();
        return res.json({ message: 'Admin created', email: 'admin@admin.com', password: 'admin123' });
      }
    }

    // ── PRODUCTS ─────────────────────────────────────────────────────────────
    if (resource === 'products') {

      // GET /api/products
      if (method === 'GET' && !id) {
        const { category, section, search, rating, page = 1, limit = 12 } = req.query;
        const query = { status: 'active' };
        if (category) query.category = category;
        if (section) query.section = section;
        if (rating) query.averageRating = { $gte: parseFloat(rating) };
        if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
        const products = await Product.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await Product.countDocuments(query);
        return res.json({ products, totalPages: Math.ceil(total / limit), currentPage: page, total });
      }

      // GET /api/products/:id
      if (method === 'GET' && id && !sub) {
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        return res.json(product);
      }

      // POST /api/products (admin)
      if (method === 'POST' && !id) {
        await requireAdmin(req);
        const data = { ...req.body };
        if (data.sizes && typeof data.sizes === 'string') data.sizes = JSON.parse(data.sizes);
        if (data.variants && typeof data.variants === 'string') data.variants = JSON.parse(data.variants);
        data.finalPrice = parseFloat(data.price) - (parseFloat(data.price) * parseFloat(data.discount || 0) / 100);
        const product = await Product.create(data);
        return res.status(201).json({ message: 'Product created', product });
      }

      // PUT /api/products/:id (admin)
      if (method === 'PUT' && id && !sub) {
        await requireAdmin(req);
        const data = { ...req.body };
        if (data.sizes && typeof data.sizes === 'string') data.sizes = JSON.parse(data.sizes);
        if (data.variants && typeof data.variants === 'string') data.variants = JSON.parse(data.variants);
        if (data.price) data.finalPrice = parseFloat(data.price) - (parseFloat(data.price) * parseFloat(data.discount || 0) / 100);
        const product = await Product.findByIdAndUpdate(id, data, { new: true });
        return res.json({ message: 'Product updated', product });
      }

      // DELETE /api/products/:id (admin)
      if (method === 'DELETE' && id && !sub) {
        await requireAdmin(req);
        await Product.findByIdAndDelete(id);
        return res.json({ message: 'Product deleted' });
      }

      // POST /api/products/:id/reviews
      if (method === 'POST' && id && sub === 'reviews') {
        const user = await getAuthUser(req);
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        const already = product.reviews.find(r => r.user.toString() === user._id.toString());
        if (already) return res.status(400).json({ message: 'Already reviewed' });
        const { rating, comment } = req.body;
        product.reviews.push({ user: user._id, rating, comment });
        product.averageRating = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
        await product.save();
        return res.json({ message: 'Review added' });
      }

      // DELETE /api/products/:id/reviews/:reviewId (admin)
      if (method === 'DELETE' && id && sub === 'reviews' && subId) {
        await requireAdmin(req);
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        product.reviews = product.reviews.filter(r => r._id.toString() !== subId);
        product.averageRating = product.reviews.length ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : 0;
        await product.save();
        return res.json({ message: 'Review deleted' });
      }
    }

    // ── ORDERS ───────────────────────────────────────────────────────────────
    if (resource === 'orders') {

      // POST /api/orders
      if (method === 'POST' && !id) {
        const user = await getAuthUser(req);
        const { items, shippingAddress, paymentMethod } = req.body;
        let total = 0;
        for (const item of items) {
          const product = await Product.findById(item.product);
          if (!product || product.stock < item.quantity)
            return res.status(400).json({ message: `Insufficient stock for ${product?.name || 'product'}` });
          total += product.finalPrice * item.quantity;
          product.stock -= item.quantity;
          await product.save();
        }
        const order = await Order.create({ user: user._id, items, totalAmount: total, shippingAddress, paymentMethod: paymentMethod || 'cod' });
        await order.populate('items.product', 'name images');

        // 40% cashback on first order only
        const freshUser = await User.findById(user._id);
        if (!freshUser.isFirstOrderCompleted) {
          const cashback = Math.round(total * 0.4);
          await creditWallet(user._id, cashback, 'cashback', `40% cashback on your first order #${order._id}`, null, order._id);
          await User.findByIdAndUpdate(user._id, { isFirstOrderCompleted: true });
        }
        return res.status(201).json({ message: 'Order created successfully', order });
      }

      // GET /api/orders/my-orders
      if (method === 'GET' && id === 'my-orders') {
        const user = await getAuthUser(req);
        const orders = await Order.find({ user: user._id }).populate('items.product', 'name images').sort({ createdAt: -1 });
        return res.json(orders);
      }

      // GET /api/orders (admin)
      if (method === 'GET' && !id) {
        await requireAdmin(req);
        const { status, page = 1, limit = 10 } = req.query;
        const query = status ? { status } : {};
        const orders = await Order.find(query).populate('items.product', 'name images').populate('user', 'name email mobile').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await Order.countDocuments(query);
        return res.json({ orders, totalPages: Math.ceil(total / limit), currentPage: page, total });
      }

      // GET /api/orders/:id
      if (method === 'GET' && id && !sub) {
        const user = await getAuthUser(req);
        const order = await Order.findById(id).populate('items.product', 'name images').populate('user', 'name email mobile');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin')
          return res.status(403).json({ message: 'Access denied' });
        return res.json(order);
      }

      // PUT /api/orders/:id/status (admin)
      if (method === 'PUT' && id && sub === 'status') {
        await requireAdmin(req);
        const { status, trackingNumber, message } = req.body;
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        order.status = status;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        order.trackingUpdates.push({ status, message: message || `Order status updated to ${status}`, timestamp: new Date() });
        await order.save();
        return res.json({ message: 'Order status updated', order });
      }
    }

    // ── CATEGORIES ───────────────────────────────────────────────────────────
    if (resource === 'categories') {

      // GET /api/categories
      if (method === 'GET' && !id) {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        return res.json({ data: categories });
      }

      // POST /api/categories (admin)
      if (method === 'POST' && !id) {
        await requireAdmin(req);
        const category = await Category.create(req.body);
        return res.status(201).json({ message: 'Category created', category });
      }

      // PUT /api/categories/:id (admin)
      if (method === 'PUT' && id) {
        await requireAdmin(req);
        const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
        return res.json({ message: 'Category updated', category });
      }

      // DELETE /api/categories/:id (admin)
      if (method === 'DELETE' && id) {
        await requireAdmin(req);
        await Category.findByIdAndDelete(id);
        return res.json({ message: 'Category deleted' });
      }
    }

    // ── WALLET ───────────────────────────────────────────────────────────────
    if (resource === 'wallet') {

      // GET /api/wallet
      if (method === 'GET' && !id) {
        const user = await getAuthUser(req);
        const freshUser = await User.findById(user._id).select('walletBalance referralCode name');
        const transactions = await WalletTransaction.find({ user: user._id }).populate('relatedUser', 'name email').populate('relatedOrder', 'totalAmount createdAt').sort({ createdAt: -1 });
        return res.json({ walletBalance: freshUser.walletBalance, referralCode: freshUser.referralCode, transactions });
      }

      // GET /api/wallet/referrals
      if (method === 'GET' && id === 'referrals') {
        const user = await getAuthUser(req);
        const referredUsers = await User.find({ referredBy: user._id }).select('name email createdAt').sort({ createdAt: -1 });
        const earnings = await WalletTransaction.aggregate([{ $match: { user: user._id, type: 'referral_reward' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
        return res.json({ totalReferrals: referredUsers.length, totalEarned: earnings[0]?.total || 0, referredUsers });
      }
    }

    // ── ADMIN ────────────────────────────────────────────────────────────────
    if (resource === 'admin') {

      // GET /api/admin/dashboard
      if (method === 'GET' && id === 'dashboard') {
        await requireAdmin(req);
        const [totalUsers, totalProducts, totalOrders, pendingOrders, outOfStock, revenue, walletIssued, totalReferrals] = await Promise.all([
          User.countDocuments({ role: 'user' }),
          Product.countDocuments(),
          Order.countDocuments(),
          Order.countDocuments({ status: 'pending' }),
          Product.countDocuments({ stock: 0 }),
          Order.aggregate([{ $match: { status: { $in: ['delivered', 'shipped'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
          WalletTransaction.aggregate([{ $match: { amount: { $gt: 0 } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
          User.countDocuments({ referredBy: { $ne: null } }),
        ]);
        return res.json({ totalUsers, totalProducts, totalOrders, pendingOrders, outOfStock, revenue: revenue[0]?.total || 0, totalWalletIssued: walletIssued[0]?.total || 0, totalReferrals });
      }

      // GET /api/admin/users
      if (method === 'GET' && id === 'users' && !sub) {
        await requireAdmin(req);
        const { page = 1, limit = 10 } = req.query;
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await User.countDocuments({ role: 'user' });
        return res.json({ users, totalPages: Math.ceil(total / limit), currentPage: page, total });
      }

      // PUT /api/admin/users/:id/toggle-status
      if (method === 'PUT' && id === 'users' && sub && subId === 'toggle-status') {
        await requireAdmin(req);
        const user = await User.findById(sub);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isActive = !user.isActive;
        await user.save();
        return res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: { id: user._id, name: user.name, isActive: user.isActive } });
      }

      // GET /api/admin/wallet-transactions
      if (method === 'GET' && id === 'wallet-transactions') {
        await requireAdmin(req);
        const { page = 1, limit = 20, type } = req.query;
        const query = type ? { type } : {};
        const transactions = await WalletTransaction.find(query).populate('user', 'name email mobile').populate('relatedUser', 'name email').populate('relatedOrder', 'totalAmount').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await WalletTransaction.countDocuments(query);
        const stats = await WalletTransaction.aggregate([{ $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }]);
        return res.json({ transactions, total, totalPages: Math.ceil(total / limit), currentPage: page, stats });
      }

      // GET /api/admin/referrals
      if (method === 'GET' && id === 'referrals') {
        await requireAdmin(req);
        const { page = 1, limit = 20 } = req.query;
        const referrals = await User.find({ referredBy: { $ne: null } }).populate('referredBy', 'name email referralCode').select('name email createdAt referredBy referralCode walletBalance').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
        const total = await User.countDocuments({ referredBy: { $ne: null } });
        return res.json({ referrals, total, totalPages: Math.ceil(total / limit), currentPage: page });
      }

      // GET /api/admin/settings
      if (method === 'GET' && id === 'settings' && !sub) {
        await requireAdmin(req);
        const settings = await Settings.find();
        const obj = {};
        settings.forEach(s => { obj[s.key] = s.value; });
        return res.json({ data: obj });
      }

      // GET /api/admin/settings/public (no auth)
      if (method === 'GET' && id === 'settings' && sub === 'public') {
        const settings = await Settings.find({ key: { $in: ['announcementMessage', 'siteName'] } });
        const obj = {};
        settings.forEach(s => { obj[s.key] = s.value; });
        return res.json({ data: obj });
      }

      // PUT /api/admin/settings
      if (method === 'PUT' && id === 'settings') {
        await requireAdmin(req);
        for (const [key, value] of Object.entries(req.body)) {
          await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
        }
        return res.json({ message: 'Settings updated' });
      }
    }

    return res.status(404).json({ message: 'Route not found' });

  } catch (err) {
    console.error('API Error:', err);
    return res.status(err.status || 500).json({ message: err.message || 'Server error' });
  }
};
