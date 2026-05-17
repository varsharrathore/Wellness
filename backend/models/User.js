const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: true },

  // --- Wallet & Referral fields ---
  walletBalance: { type: Number, default: 0 },           // Current wallet balance in ₹
  referralCode: { type: String, unique: true, sparse: true }, // e.g. USR8291
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // who referred this user
  isFirstOrderCompleted: { type: Boolean, default: false } // tracks if 40% cashback was given
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
