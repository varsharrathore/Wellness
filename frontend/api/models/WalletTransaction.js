const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['referral_bonus', 'referral_reward', 'cashback', 'debit'],
    required: true
  },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null }
}, { timestamps: true });

module.exports = mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
