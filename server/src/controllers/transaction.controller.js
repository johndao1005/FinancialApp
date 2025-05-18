const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// Configure multer for file uploads
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

// Get all transactions for the authenticated user
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
    const transaction = await Transaction.create({
      ...req.body,
      userId
    });
    
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
