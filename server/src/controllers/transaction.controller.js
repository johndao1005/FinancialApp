/**
 * Transaction Controller
 * 
 * This controller handles all transaction-related API operations:
 * - Fetching transactions with filtering and pagination
 * - Creating, updating, and deleting transactions
 * - Importing transactions from CSV files
 * - Managing recurring transactions
 */
const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 * Configure file upload for transaction import
 * 
 * Sets up multer storage for CSV file uploads:
 * - Creates upload directory if it doesn't exist
 * - Sets unique filename with timestamp
 * - Limits file size to 10MB
 * - Restricts to CSV files only
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  }
}).single('file');

/**
 * Get all transactions for the authenticated user
 * 
 * Fetches transactions with pagination and optional filtering:
 * - Date range filtering (startDate to endDate)
 * - Category filtering
 * - Includes category information
 * - Sorts by date descending (newest first)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Add filtering
    const where = { userId };
    if (req.query.startDate && req.query.endDate) {
      where.date = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    }
    
    if (req.query.category) {
      where.categoryId = req.query.category;
    }
    
    const transactions = await Transaction.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [['date', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      transactions: transactions.rows,
      totalCount: transactions.count,
      totalPages: Math.ceil(transactions.count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single transaction
exports.getTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const transaction = await Transaction.findOne({
      where: { id: req.params.id, userId },
      include: [{ model: Category, as: 'category' }]
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (error) {
    console.error('Error getting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    let transactionData = { ...req.body, userId };
    
    // If category is provided as a string name, look up the categoryId
    if (req.body.category && typeof req.body.category === 'string') {
      let categoryName = req.body.category;
      
      // Handle common category name variations
      const categoryMapping = {
        'Food & Dining': 'Dining',
        'Food and Dining': 'Dining'
      };
      
      if (categoryMapping[categoryName]) {
        categoryName = categoryMapping[categoryName];
      }
      
      // First try to find a user-specific category with this name
      let category = await Category.findOne({
        where: {
          name: categoryName,
          userId
        }
      });
      
      // If not found, look for a default category with this name
      if (!category) {
        category = await Category.findOne({
          where: {
            name: categoryName,
            isDefault: true
          }
        });
      }
      
      // If a category was found, use its ID
      if (category) {
        console.log(`Found category: ${category.name} (${category.id})`);
        transactionData.categoryId = category.id;
      } else {
        console.log(`Category not found: ${categoryName}, using Uncategorized instead`);
        // If no matching category is found, try to find the Uncategorized category
        const uncategorized = await Category.findOne({
          where: {
            name: 'Uncategorized',
            isDefault: true
          }
        });
        
        if (uncategorized) {
          transactionData.categoryId = uncategorized.id;
        }
      }
      
      // Remove the original category name from the data since we're using categoryId
      delete transactionData.category;
    }
    
    const transaction = await Transaction.create(transactionData);
    
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const [updated] = await Transaction.update(req.body, {
      where: { id: req.params.id, userId }
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const transaction = await Transaction.findOne({
      where: { id: req.params.id },
      include: [{ model: Category, as: 'category' }]
    });
    
    res.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const deleted = await Transaction.destroy({
      where: { id: req.params.id, userId }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Import transactions from CSV
exports.importTransactions = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }
    
    try {
      const userId = req.user.id;
      const filePath = req.file.path;
      
      // Call Python script for processing CSV
      const pythonScript = path.join(__dirname, '../python/process_csv.py');
      const result = spawnSync('python', [pythonScript, filePath, userId]);
      
      if (result.error) {
        throw new Error('Failed to process CSV file');
      }
      
      const output = result.stdout.toString().trim();
      const processedData = JSON.parse(output);
      
      // Save transactions to database
      const transactions = await Transaction.bulkCreate(
        processedData.map(item => ({
          ...item,
          userId
        }))
      );
      
      // Delete the temporary file
      fs.unlinkSync(filePath);
      
      res.json({
        message: `Successfully imported ${transactions.length} transactions`,
        transactions
      });
    } catch (error) {
      console.error('Error importing transactions:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};
