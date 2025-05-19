/**
 * Authentication Middleware
 * 
 * Protects API routes by:
 * 1. Extracting the JWT token from the Authorization header
 * 2. Verifying the token's validity and signature
 * 3. Finding the corresponding user in the database
 * 4. Attaching the user object to the request for use in controllers
 * 
 * If any step fails, returns appropriate error responses with status codes:
 * - 401 for missing/invalid token or user not found
 * - Specific message for expired tokens
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user to request
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};
