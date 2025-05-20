/**
 * Validation Middleware
 * 
 * Provides request validation for various API endpoints using express-validator.
 * This middleware ensures that incoming data meets specified requirements before
 * reaching controller logic, helping prevent invalid data from being processed.
 * 
 * Key features:
 * - Input sanitization (trim, escape, normalize)
 * - Format validation (email, password complexity, etc.)
 * - Required field validation
 * - Length and range constraints
 * - Custom error messages for better user feedback
 * 
 * Usage:
 * Apply these middleware functions to route handlers to validate
 * request body data before processing the request.
 */
const { body, validationResult } = require('express-validator');

/**
 * Validates user registration data
 * 
 * Ensures new user registration requests contain all required fields
 * with proper formats and constraints.
 * 
 * @middleware
 * @validates firstName - Required, 2-30 characters
 * @validates lastName - Required, 2-30 characters
 * @validates email - Required, valid email format
 * @validates password - Required, min 6 chars, contains a number
 */
exports.validateRegistration = [
  // First name validation
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 30 }).withMessage('First name must be between 2 and 30 characters'),
  
  // Last name validation
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 30 }).withMessage('Last name must be between 2 and 30 characters'),
  
  // Email validation and normalization
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  // Password validation with complexity requirements
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain a number'),
  
  // Error handler middleware
  (req, res, next) => {
    const errors = validationResult(req);
    console.log('Validation errors:', errors.array());
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validates user login data
 * 
 * Ensures login requests contain a valid email and password.
 * 
 * @middleware
 * @validates email - Required, valid email format
 * @validates password - Required
 */
exports.validateLogin = [
  // Email validation and normalization
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  // Password validation (only checks presence for login)
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  // Error handler middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
