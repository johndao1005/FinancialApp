const { body, validationResult } = require('express-validator');

// Validation for user registration
exports.validateRegistration = [
  body('firstName')
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 30 }).withMessage('First name must be between 2 and 30 characters'),
  
  body('lastName')
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 30 }).withMessage('Last name must be between 2 and 30 characters'),
  
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/\d/).withMessage('Password must contain a number'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation for user login
exports.validateLogin = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
