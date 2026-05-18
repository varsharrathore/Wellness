// api/admin/[...params].js
const connectDB = require('../lib/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const WalletTransaction = require('../models/WalletTransaction');
const { requireAdmin, withErrorHandler } = require('../middleware/auth');

module.exports = withErrorHandler(async function handler(req, res) {
  await connectDB();
  const params = req.query.params || [];
  const [section, id, action] = params;

  // GET /api/admin/dashboard
  if (req.method === 'GET' && section === 'dashboard') {
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
  if (req.method === 'GET' && section === 'users' && !id) {
    await requireAdmin(req);
    const { page = 1, limit = 10 } = req.query;
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await User.countDocuments({ role: 'user' });
    return res.json({ users, totalPages: Math.ceil(total / limit), currentPage: page, total });
  }

  // PUT /api/admin/users/:id/toggle-status
  if (req.method === 'PUT' && section === 'users' && id && action === 'toggle-status') {
    await requireAdmin(req);
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    return res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user: { id: user._id, name: user.name, isActive: user.isActive } });
  }

  // GET /api/admin/wallet-transactions
  if (req.method === 'GET' && section === 'wallet-transactions') {
    await requireAdmin(req);
    const { page = 1, limit = 20, type } = req.query;
    const query = type ? { type } : {};
    const transactions = await WalletTransaction.find(query)
      .populate('user', 'name email mobile')
      .populate('relatedUser', 'name email')
      .populate('relatedOrder', 'totalAmount')
      .sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await WalletTransaction.countDocuments(query);
    const stats = await WalletTransaction.aggregate([{ $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }]);
    return res.json({ transactions, total, totalPages: Math.ceil(total / limit), currentPage: page, stats });
  }

  // GET /api/admin/referrals
  if (req.method === 'GET' && section === 'referrals') {
    await requireAdmin(req);
    const { page = 1, limit = 20 } = req.query;
    const referrals = await User.find({ referredBy: { $ne: null } })
      .populate('referredBy', 'name email referralCode')
      .select('name email createdAt referredBy referralCode walletBalance')
      .sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await User.countDocuments({ referredBy: { $ne: null } });
    return res.json({ referrals, total, totalPages: Math.ceil(total / limit), currentPage: page });
  }

  // GET /api/admin/settings
  if (req.method === 'GET' && section === 'settings') {
    await requireAdmin(req);
    const settings = await Settings.find();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    return res.json({ data: obj });
  }

  // GET /api/admin/settings/public — no auth
  if (req.method === 'GET' && section === 'settings' && id === 'public') {
    const settings = await Settings.find({ key: { $in: ['announcementMessage', 'siteName'] } });
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    return res.json({ data: obj });
  }

  // PUT /api/admin/settings
  if (req.method === 'PUT' && section === 'settings') {
    await requireAdmin(req);
    for (const [key, value] of Object.entries(req.body)) {
      await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
    }
    return res.json({ message: 'Settings updated' });
  }

  res.status(404).json({ message: 'Route not found' });
});
