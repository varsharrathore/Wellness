// api/orders/[...params].js — handles all /api/orders/* routes
const connectDB = require('../lib/db');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { getAuthUser, requireAdmin, withErrorHandler } = require('../middleware/auth');

async function creditWallet(userId, amount, type, description, relatedOrder = null) {
  await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
  await WalletTransaction.create({ user: userId, type, amount, description, relatedOrder });
}

module.exports = withErrorHandler(async function handler(req, res) {
  await connectDB();
  const params = req.query.params || [];
  const [id, sub] = params;

  // POST /api/orders — create order
  if (req.method === 'POST' && !id) {
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
      await creditWallet(user._id, cashback, 'cashback', `40% cashback on your first order #${order._id}`, order._id);
      await User.findByIdAndUpdate(user._id, { isFirstOrderCompleted: true });
    }

    return res.status(201).json({ message: 'Order created successfully', order });
  }

  // GET /api/orders/my-orders
  if (req.method === 'GET' && id === 'my-orders') {
    const user = await getAuthUser(req);
    const orders = await Order.find({ user: user._id }).populate('items.product', 'name images').sort({ createdAt: -1 });
    return res.json(orders);
  }

  // GET /api/orders — all orders (admin)
  if (req.method === 'GET' && !id) {
    await requireAdmin(req);
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Order.countDocuments(query);
    return res.json({ orders, totalPages: Math.ceil(total / limit), currentPage: page, total });
  }

  // GET /api/orders/:id
  if (req.method === 'GET' && id && !sub) {
    const user = await getAuthUser(req);
    const order = await Order.findById(id).populate('items.product', 'name images').populate('user', 'name email mobile');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user._id.toString() !== user._id.toString() && user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });
    return res.json(order);
  }

  // PUT /api/orders/:id/status — update status (admin)
  if (req.method === 'PUT' && id && sub === 'status') {
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

  res.status(404).json({ message: 'Route not found' });
});
