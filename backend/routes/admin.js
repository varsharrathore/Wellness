const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Settings = require('../models/Settings');
const WalletTransaction = require('../models/WalletTransaction');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Dashboard analytics
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });

    const revenue = await Order.aggregate([
      { $match: { status: { $in: ['delivered', 'shipped'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const outOfStock = await Product.countDocuments({ stock: 0 });

    // Total wallet credits issued
    const totalWalletIssued = await WalletTransaction.aggregate([
      { $match: { amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Total referrals made
    const totalReferrals = await User.countDocuments({ referredBy: { $ne: null } });

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      revenue: revenue[0]?.total || 0,
      outOfStock,
      totalWalletIssued: totalWalletIssued[0]?.total || 0,
      totalReferrals
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users (with wallet balance)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ role: 'user' });

    res.json({ users, totalPages: Math.ceil(total / limit), currentPage: page, total });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle user status
router.put('/users/:id/toggle-status', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET all wallet transactions (admin view)
router.get('/wallet-transactions', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = type ? { type } : {};

    const transactions = await WalletTransaction.find(query)
      .populate('user', 'name email mobile')
      .populate('relatedUser', 'name email')
      .populate('relatedOrder', 'totalAmount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WalletTransaction.countDocuments(query);

    // Summary stats
    const stats = await WalletTransaction.aggregate([
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({ transactions, total, totalPages: Math.ceil(total / limit), currentPage: page, stats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET all referrals (admin view)
router.get('/referrals', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Users who were referred by someone
    const referrals = await User.find({ referredBy: { $ne: null } })
      .populate('referredBy', 'name email referralCode')
      .select('name email createdAt referredBy referralCode walletBalance')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({ referredBy: { $ne: null } });

    res.json({ referrals, total, totalPages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const settings = await Settings.find();
    const settingsObj = {};
    settings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json({ data: settingsObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get public settings (no auth required)
router.get('/settings/public', async (req, res) => {
  try {
    const publicSettings = await Settings.find({ key: { $in: ['announcementMessage', 'siteName'] } });
    const settingsObj = {};
    publicSettings.forEach(s => { settingsObj[s.key] = s.value; });
    res.json({ data: settingsObj });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update settings
router.put('/settings', adminAuth, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true });
    }
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
