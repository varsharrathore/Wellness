const mongoose = require('mongoose');

/**
 * WalletTransaction stores every credit/debit event for a user's wallet.
 * Types:
 *   referral_bonus   — ₹30 given to new user who signed up with a referral code
 *   referral_reward  — ₹10 given to the referrer for each successful signup
 *   cashback         — 40% cashback on first order
 *   debit            — future: wallet used to pay for order
 */
const walletTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['referral_bonus', 'referral_reward', 'cashback', 'debit'],
    required: true
  },
  amount: { type: Number, required: true },       // positive = credit, negative = debit
  description: { type: String, required: true },  // human-readable description
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },  // referrer or referred user
  relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null } // for cashback
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
