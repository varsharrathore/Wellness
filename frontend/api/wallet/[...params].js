// api/wallet/[...params].js
const connectDB = require('../lib/db');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { getAuthUser, withErrorHandler } = require('../middleware/auth');

module.exports = withErrorHandler(async function handler(req, res) {
  await connectDB();
  const params = req.query.params || [];
  const [sub] = params;

  // GET /api/wallet — balance + transactions
  if (req.method === 'GET' && !sub) {
    const user = await getAuthUser(req);
    const freshUser = await User.findById(user._id).select('walletBalance referralCode name');
    const transactions = await WalletTransaction.find({ user: user._id })
      .populate('relatedUser', 'name email')
      .populate('relatedOrder', 'totalAmount createdAt')
      .sort({ createdAt: -1 });
    return res.json({ walletBalance: freshUser.walletBalance, referralCode: freshUser.referralCode, transactions });
  }

  // GET /api/wallet/referrals
  if (req.method === 'GET' && sub === 'referrals') {
    const user = await getAuthUser(req);
    const referredUsers = await User.find({ referredBy: user._id }).select('name email createdAt').sort({ createdAt: -1 });
    const earnings = await WalletTransaction.aggregate([
      { $match: { user: user._id, type: 'referral_reward' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return res.json({ totalReferrals: referredUsers.length, totalEarned: earnings[0]?.total || 0, referredUsers });
  }

  res.status(404).json({ message: 'Route not found' });
});
