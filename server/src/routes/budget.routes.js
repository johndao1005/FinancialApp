const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all budgets
router.get('/', budgetController.getBudgets);

// Get a single budget
router.get('/:id', budgetController.getBudget);

// Get budget progress
router.get('/:id/progress', budgetController.getBudgetProgress);

// Create a new budget
router.post('/', budgetController.createBudget);

// Update a budget
router.put('/:id', budgetController.updateBudget);

// Delete a budget
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
