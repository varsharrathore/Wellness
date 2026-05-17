const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// --- Helper: generate unique referral code like USR8291 or SHOP4521 ---
async function generateReferralCode() {
  const prefixes = ['USR', 'SHOP', 'WEL', 'REF'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  let code;
  let exists = true;
  // Keep generating until we get a unique code
  while (exists) {
    const num = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    code = `${prefix}${num}`;
    exists = await User.findOne({ referralCode: code });
  }
  return code;
}

// --- Helper: credit wallet and log transaction ---
async function creditWallet(userId, amount, type, description, relatedUser = null, relatedOrder = null) {
  await User.findByIdAndUpdate(userId, { $inc: { walletBalance: amount } });
  await WalletTransaction.create({
    user: userId,
    type,
    amount,
    description,
    relatedUser,
    relatedOrder
  });
}

// Register
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('identifier').notEmpty().withMessage('Email or mobile number is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, identifier, password, referralCode } = req.body;

    // Check if identifier is email or mobile
    const isEmail = identifier.includes('@');
    const userData = {
      name,
      password,
      [isEmail ? 'email' : 'mobile']: identifier,
      [isEmail ? 'mobile' : 'email']: isEmail ? `mobile_${Date.now()}` : `email_${Date.now()}@temp.com`
    };

    // Check duplicate account
    const existingUser = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate referral code if provided
    let referrer = null;
    if (referralCode && referralCode.trim() !== '') {
      referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // Generate unique referral code for new user
    userData.referralCode = await generateReferralCode();

    // Link referrer if valid
    if (referrer) {
      userData.referredBy = referrer._id;
    }

    const user = new User(userData);
    await user.save();

    // --- Prevent self-referral (extra safety check) ---
    if (referrer && referrer._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: 'Self-referral is not allowed' });
    }

    // Credit ₹30 bonus to new user for using a referral code
    if (referrer) {
      await creditWallet(
        user._id,
        30,
        'referral_bonus',
        `Welcome bonus! You joined using referral code ${referralCode.toUpperCase()}`,
        referrer._id
      );

      // Credit ₹10 reward to the referrer
      await creditWallet(
        referrer._id,
        10,
        'referral_reward',
        `Referral reward: ${user.name} signed up using your referral code`,
        user._id
      );
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', [
  body('identifier').notEmpty().withMessage('Email or mobile is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }],
      isActive: true
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current user (includes wallet balance and referral code)
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      mobile: req.user.mobile,
      role: req.user.role,
      walletBalance: req.user.walletBalance,
      referralCode: req.user.referralCode,
      isFirstOrderCompleted: req.user.isFirstOrderCompleted
    }
  });
});

// Create admin (temporary endpoint)
router.post('/create-admin', async (req, res) => {
  try {
    const adminData = {
      name: 'Admin',
      email: 'admin@admin.com',
      mobile: '1111111111',
      password: 'admin123',
      role: 'admin'
    };

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = new User(adminData);
    await admin.save();

    res.json({ message: 'Admin created', email: adminData.email, password: adminData.password });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
});

module.exports = router;
