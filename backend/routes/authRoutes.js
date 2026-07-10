const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to generate a JWT token including role
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
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

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
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
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.redirect('http://localhost:5173/Login?verified=false&error=invalid_token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.redirect('http://localhost:5173/Dashboard?verified=true');
  } catch (error) {
    console.error('❌ Email Verification Error:', error);
    res.redirect('http://localhost:5173/Login?verified=false&error=server_error');
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

module.exports = router;
