const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// --- Helper: credit wallet and log transaction ---
async function creditWallet(userId, amount, type, description, relatedOrder = null) {
  await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
  await WalletTransaction.create({ user: userId, type, amount, description, relatedOrder });
}

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    let calculatedTotal = 0;

    const orderItems = [];

    // Validate items and calculate total
    for (let item of items) {
      const productId = item.product?._id || item.product;
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${productId}` });
      }
      const qty = Number(item.quantity);
      if (product.stock < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      const effectivePrice = Number(product.finalPrice) || Number(product.price) || 0;
      if (!effectivePrice) {
        return res.status(400).json({ message: `Price not set for product: ${product.name}` });
      }
      calculatedTotal += effectivePrice * qty;

      orderItems.push({
        product: productId,
        quantity: qty,
        price: effectivePrice,
        ...(item.size && { size: item.size }),
        ...(item.variant && { variant: item.variant })
      });

      product.stock -= qty;
      await product.save();
    }

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod'
    });

    await order.save();
    await order.populate('items.product', 'name images');

    // --- 40% cashback on first order (only once per user) ---
    const freshUser = await User.findById(req.user._id);
    if (freshUser && !freshUser.isFirstOrderCompleted) {
      const cashback = Math.round(calculatedTotal * 0.4);
      await creditWallet(
        req.user._id,
        cashback,
        'cashback',
        `40% cashback on your first order #${order._id}`,
        order._id
      );
      await User.findByIdAndUpdate(req.user._id, { isFirstOrderCompleted: true });
    }

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    console.error('Order creation error:', error.stack);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('user', 'name email mobile');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all orders (Admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({ orders, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update order status (Admin only)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, trackingNumber, message } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.trackingUpdates.push({
      status,
      message: message || `Order status updated to ${status}`,
      timestamp: new Date()
    });

    await order.save();
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
