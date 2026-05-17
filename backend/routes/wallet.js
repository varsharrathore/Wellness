const express = require('express');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/wallet — get wallet balance + all transactions for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select('walletBalance referralCode name');

    // Auto-generate referral code if user doesn't have one
    if (!user.referralCode) {
      const prefixes = ['USR', 'SHOP', 'WEL', 'REF'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      let code, exists = true;
      while (exists) {
        code = prefix + Math.floor(1000 + Math.random() * 9000);
        exists = await User.findOne({ referralCode: code });
      }
      user = await User.findByIdAndUpdate(
        req.user._id,
        { referralCode: code },
        { new: true }
      ).select('walletBalance referralCode name');
    }

    // Get all transactions sorted newest first
    const transactions = await WalletTransaction.find({ user: req.user._id })
      .populate('relatedUser', 'name email')
      .populate('relatedOrder', 'totalAmount createdAt')
      .sort({ createdAt: -1 });

    res.json({
      walletBalance: user.walletBalance,
      referralCode: user.referralCode,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/wallet/referrals — get list of users referred by this user
router.get('/referrals', auth, async (req, res) => {
  try {
    // Find all users who were referred by the current user
    const referredUsers = await User.find({ referredBy: req.user._id })
      .select('name email createdAt walletBalance')
      .sort({ createdAt: -1 });

    // Total earnings from referrals
    const referralEarnings = await WalletTransaction.aggregate([
      { $match: { user: req.user._id, type: 'referral_reward' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      totalReferrals: referredUsers.length,
      totalEarned: referralEarnings[0]?.total || 0,
      referredUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
