const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all transactions for a user
router.get('/', transactionController.getTransactions);

// Get a single transaction
router.get('/:id', transactionController.getTransaction);

// Create a new transaction
router.post('/', transactionController.createTransaction);

// Update a transaction
router.put('/:id', transactionController.updateTransaction);

// Delete a transaction
router.delete('/:id', transactionController.deleteTransaction);

// Upload a CSV file for bulk import
router.post('/import', transactionController.importTransactions);

module.exports = router;
