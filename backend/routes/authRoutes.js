const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to generate a JWT token including role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Helper function to validate strict password requirements
const validatePasswordPolicy = (pwd) => {
  if (!pwd || typeof pwd !== 'string') {
    return 'Password is required.';
  }
  const errors = [];
  if (pwd.length < 8) errors.push('at least 8 characters');
  if (!/[A-Z]/.test(pwd)) errors.push('at least one uppercase letter (A-Z)');
  if (!/[a-z]/.test(pwd)) errors.push('at least one lowercase letter (a-z)');
  if (!/\d/.test(pwd)) errors.push('at least one number (0-9)');
  if (!/[^A-Za-z0-9]/.test(pwd)) errors.push('at least one special character (e.g. !@#$%^&*)');

  if (errors.length > 0) {
    return `Password must contain ${errors.join(', ')}.`;
  }
  return null;
};

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if username contains reserved words
    const reservedWords = ['admin', 'administrator', 'root', 'system', 'manager', 'support', 'mod', 'moderator', 'eliad', 'mypopvault'];
    const usernameLower = username.toLowerCase();
    const isReserved = reservedWords.some(word => usernameLower.includes(word));
    if (isReserved) {
      return res.status(400).json({
        error: 'Reserved word error',
        message: 'Username contains reserved or restricted words.'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(409).json({
        error: 'Duplicate field error',
        message: 'That email is already in use.'
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        error: 'Duplicate field error',
        message: 'That username is already in use.'
      });
    }

    const pwdPolicyError = validatePasswordPolicy(password);
    if (pwdPolicyError) {
      return res.status(400).json({
        error: 'Weak password error',
        message: pwdPolicyError
      });
    }

    // Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create and save user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken
    });

    const savedUser = await newUser.save();

    console.log(`✉️ [register debug] savedUser.email: "${savedUser.email}", savedUser.username: "${savedUser.username}", verificationToken: "${verificationToken}"`);

    // Send and await verification email
    try {
      await sendVerificationEmail(savedUser.email, savedUser.username, verificationToken);
    } catch (err) {
      console.error('❌ Failed to send verification email during registration:', err);
      // Rollback user creation
      await User.deleteOne({ _id: savedUser._id });
      return res.status(500).json({
        error: 'Email error',
        message: `Failed to send verification email: ${err.message || 'SMTP server error'}`
      });
    }
    
    // Generate JWT token including role
    const token = generateToken(savedUser._id, savedUser.role);

    // Exclude password from the returned user object
    res.status(201).json({
      token,
      user: {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
        isVip: savedUser.isVip,
        isVerified: savedUser.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Registration Error:', error);
    
    // Handle duplicate key error (code 11000) for unique fields (email, username)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        error: 'Duplicate field error',
        message: `That ${field} is already in use.`
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        error: 'Validation error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

// POST /api/auth/login - Verify credentials and login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare entered password with hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token including role
    const token = generateToken(user._id, user.role);

    // Return token and user info, strictly excluding password
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVip: user.isVip,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

// GET /api/auth/verify/:token - Verify user email
router.get('/verify/:token', async (req, res) => {
  const frontendUrl = process.env.CLIENT_URL || process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:8080';
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.redirect(`${frontendUrl}/Login?verified=false&error=invalid_token`);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect(`${frontendUrl}/Dashboard?verified=true`);
  } catch (error) {
    console.error('❌ Email Verification Error:', error);
    res.redirect(`${frontendUrl}/Login?verified=false&error=server_error`);
  }
});

// GET /api/auth/me - Get current user profile (including isVerified)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVip: user.isVip,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Fetch Profile Error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// POST /api/auth/resend - Resend verification email
router.post('/resend', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate token if not present
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    await sendVerificationEmail(user.email, user.username, user.verificationToken);

    res.json({ message: 'Verification email resent successfully!' });
  } catch (error) {
    console.error('❌ Resend Verification Error:', error);
    res.status(500).json({ error: 'Failed to resend verification email', message: error.message });
  }
});

// POST /api/auth/forgot-password - Generate reset token and send email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Return a friendly message for security to prevent user enumeration
      return res.status(200).json({ message: 'If that email exists, a reset link has been sent!' });
    }

    // Generate a temporary JWT token valid for 15m
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, user.username, resetToken);

    res.status(200).json({ message: 'Password reset link sent successfully!' });
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    res.status(500).json({ error: 'Failed to process password reset request', message: error.message });
  }
});

// POST /api/auth/reset-password - Verify token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const pwdPolicyError = validatePasswordPolicy(newPassword);
    if (pwdPolicyError) {
      return res.status(400).json({
        error: 'Weak password error',
        message: pwdPolicyError
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired password reset token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully!' });
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    res.status(500).json({ error: 'Failed to reset password', message: error.message });
  }
});

module.exports = router;

