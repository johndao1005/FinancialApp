/**
 * Validates asset creation data
 * 
 * Ensures that new asset creation requests contain all required fields
 * with proper formats and constraints.
 * 
 * @middleware
 * @validates name - Required, string
 * @validates assetType - Required, one of the valid types
 * @validates initialValue - Required, positive number
 * @validates acquisitionDate - Required, valid date
 */
const { body } = require('express-validator');

exports.validateAsset = [
  // Asset name validation
  body('name')
    .notEmpty().withMessage('Asset name is required')
    .isString().withMessage('Asset name must be a string'),
  
  // Asset type validation
  body('assetType')
    .notEmpty().withMessage('Asset type is required')
    .isIn(['property', 'stock', 'crypto', 'term_deposit', 'other']).withMessage('Invalid asset type'),
  
  // Initial value validation
  body('initialValue')
    .notEmpty().withMessage('Initial value is required')
    .isFloat({ min: 0 }).withMessage('Initial value must be a positive number'),
  
  // Acquisition date validation
  body('acquisitionDate')
    .notEmpty().withMessage('Acquisition date is required')
    .isDate().withMessage('Acquisition date must be a valid date'),
  
  // Conditional validation based on asset type
  body()
    .custom((body, { req }) => {
      const { assetType } = req.body;
      
      switch (assetType) {
        case 'property':
          if (!body.location) {
            throw new Error('Location is required for property assets');
          }
          break;
          
        case 'stock':
        case 'crypto':
          if (!body.symbol) {
            throw new Error(`Symbol is required for ${assetType} assets`);
          }
          if (!body.quantity || isNaN(parseFloat(body.quantity)) || parseFloat(body.quantity) <= 0) {
            throw new Error(`Quantity must be a positive number for ${assetType} assets`);
          }
          break;
          
        case 'term_deposit':
          if (!body.annualRateOfReturn || isNaN(parseFloat(body.annualRateOfReturn))) {
            throw new Error('Annual rate of return is required for term deposits');
          }
          break;
      }
      
      return true;
    }),
  
  // Error handler middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

/**
 * Validates asset transaction data
 * 
 * Ensures that asset transaction requests contain all required fields
 * with proper formats and constraints.
 * 
 * @middleware
 * @validates assetId - Required, string
 * @validates date - Required, valid date
 * @validates transactionType - Required, one of the valid types
 * @validates amount - Required, number
 */
exports.validateAssetTransaction = [
  // Asset ID validation
  body('assetId')
    .notEmpty().withMessage('Asset ID is required')
    .isUUID().withMessage('Invalid asset ID format'),
  
  // Transaction date validation
  body('date')
    .notEmpty().withMessage('Transaction date is required')
    .isDate().withMessage('Transaction date must be a valid date'),
  
  // Transaction type validation
  body('transactionType')
    .notEmpty().withMessage('Transaction type is required')
    .isIn([
      'valuation_update',
      'contribution',
      'withdrawal',
      'purchase',
      'sale',
      'dividend',
      'interest',
      'fee',
      'other'
    ]).withMessage('Invalid transaction type'),
  
  // Amount validation
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat().withMessage('Amount must be a number'),
  
  // Error handler middleware
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
