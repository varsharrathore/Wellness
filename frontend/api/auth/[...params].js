// api/auth/[...params].js — handles all /api/auth/* routes on Vercel
const connectDB = require('../lib/db');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const jwt = require('jsonwebtoken');
const { withErrorHandler, getAuthUser } = require('../middleware/auth');

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

async function creditWallet(userId, amount, type, description, relatedUser = null) {
  await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
  await WalletTransaction.create({ user: userId, type, amount, description, relatedUser });
}

module.exports = withErrorHandler(async function handler(req, res) {
  await connectDB();
  const action = req.query.params?.[0];

  // POST /api/auth/register
  if (req.method === 'POST' && action === 'register') {
    const { name, identifier, password, referralCode } = req.body;
    if (!name || !identifier || !password)
      return res.status(400).json({ message: 'Name, identifier and password are required' });
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
      await creditWallet(referrer._id, 10, 'referral_reward', `Referral reward: ${user.name} signed up using your code`, user._id);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      message: 'User registered successfully', token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, walletBalance: user.walletBalance, referralCode: user.referralCode }
    });
  }

  // POST /api/auth/login
  if (req.method === 'POST' && action === 'login') {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ message: 'Identifier and password are required' });

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
  if (req.method === 'GET' && action === 'me') {
    const user = await getAuthUser(req);
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role, walletBalance: user.walletBalance, referralCode: user.referralCode }
    });
  }

  // POST /api/auth/create-admin
  if (req.method === 'POST' && action === 'create-admin') {
    const existing = await User.findOne({ email: 'admin@admin.com' });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });
    const admin = new User({ name: 'Admin', email: 'admin@admin.com', mobile: '1111111111', password: 'admin123', role: 'admin' });
    await admin.save();
    return res.json({ message: 'Admin created', email: 'admin@admin.com', password: 'admin123' });
  }

  res.status(404).json({ message: 'Route not found' });
});
