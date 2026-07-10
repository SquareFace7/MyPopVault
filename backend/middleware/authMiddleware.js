const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided. Please include an Authorization header with a Bearer token.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database, excluding password field
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User associated with this token no longer exists.'
      });
    }

    // Attach user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error('🔑 Auth Middleware Error:', error);
    
    let message = 'Token is invalid or has expired.';
    if (error.name === 'TokenExpiredError') {
      message = 'Session expired. Please log in again.';
    }

    return res.status(401).json({
      error: 'Unauthorized',
      message
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied. You do not have permission to access this resource.'
      });
    }

    next();
  };
};

const requireVerification = (req, res, next) => {
  if (req.user && req.user.isVerified === false) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Please verify your email address to perform this action.'
    });
  }
  next();
};

authMiddleware.authorizeRoles = authorizeRoles;
authMiddleware.requireVerification = requireVerification;

module.exports = authMiddleware;
