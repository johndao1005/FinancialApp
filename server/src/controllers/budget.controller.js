/**
 * Budget Controller
 * 
 * Handles all budget-related operations including creation, retrieval,
 * updating, and deletion of budget records. This controller also provides
 * endpoints for budget progress tracking and analysis.
 * 
 * Key features:
 * - CRUD operations for budget management
 * - Budget progress calculations
 * - Category-specific budgeting
 * - Budget performance statistics 
 * - Period-based budget summaries
 */
const { Budget, Category, Transaction } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all budgets for the authenticated user
 * 
 * @route GET /api/budgets
 * @access Private - Requires authentication
 * @returns {Array} List of user's budget objects with category information
 */
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const budgets = await Budget.findAll({
      where: { userId },
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(budgets);
  } catch (error) {
    console.error('Error getting budgets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single budget by ID
 * 
 * @route GET /api/budgets/:id
 * @access Private - Requires authentication
 * @param {string} req.params.id - Budget ID
 * @returns {Object} Budget details with category information
 */
exports.getBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId
      },
      include: [{ model: Category, as: 'category' }]
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error) {
    console.error('Error getting budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new budget
 * 
 * @route POST /api/budgets
 * @access Private - Requires authentication
 * @param {Object} req.body - Budget details
 * @param {string} req.body.name - Budget name
 * @param {number} req.body.amount - Budget amount
 * @param {string} req.body.period - Budget period (daily, weekly, monthly, yearly, custom)
 * @param {Date} req.body.startDate - Budget start date
 * @param {Date} [req.body.endDate] - Budget end date (optional)
 * @param {string} [req.body.categoryId] - Category ID (optional)
 * @param {string} [req.body.notes] - Additional notes (optional)
 * @returns {Object} Newly created budget
 */
exports.createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, amount, period, startDate, endDate, categoryId, notes } = req.body;
    
    // Validate input
    if (!name || !amount || !period || !startDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // If categoryId is provided, check if it exists and belongs to user or is a default category
    if (categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          [Op.or]: [
            { isDefault: true },  // Default categories available to all users
            { userId }            // User's own categories
          ]
        }
      });
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }
    
    // Create the budget with validated data
    const budget = await Budget.create({
      name,
      amount,
      period,
      startDate,
      endDate,
      categoryId,
      notes,
      userId
    });
    
    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update an existing budget
 * 
 * @route PUT /api/budgets/:id
 * @access Private - Requires authentication
 * @param {string} req.params.id - Budget ID to update
 * @param {Object} req.body - Updated budget details
 * @returns {Object} Updated budget object
 */
exports.updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, amount, period, startDate, endDate, categoryId, isActive, notes } = req.body;
    
    // Find the budget
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId
      }
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    // If categoryId is provided, check if it exists
    if (categoryId && categoryId !== budget.categoryId) {
      const category = await Category.findOne({
        where: {
          id: categoryId,
          [Op.or]: [
            { isDefault: true },
            { userId }
          ]
        }
      });
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
    }
    
    // Update the budget
    budget.name = name || budget.name;
    budget.amount = amount || budget.amount;
    budget.period = period || budget.period;
    budget.startDate = startDate || budget.startDate;
    budget.endDate = endDate === null ? null : endDate || budget.endDate;
    budget.categoryId = categoryId === null ? null : categoryId || budget.categoryId;
    budget.isActive = isActive !== undefined ? isActive : budget.isActive;
    budget.notes = notes === null ? null : notes || budget.notes;
    
    await budget.save();
    
    res.json(budget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the budget
    const budget = await Budget.findOne({
      where: {
        id: req.params.id,
        userId
      }
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    // Delete the budget
    await budget.destroy();
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get budget progress
exports.getBudgetProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    
    // Find the budget
    const budget = await Budget.findOne({
      where: {
        id: budgetId,
        userId
      },
      include: [{ model: Category, as: 'category' }]
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    // Determine date range for transactions
    const startDate = new Date(budget.startDate);
    const endDate = budget.endDate ? new Date(budget.endDate) : new Date();
    
    // Build transaction query
    const transactionQuery = {
      where: {
        userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    };
    
    // If category-specific budget, filter by category
    if (budget.categoryId) {
      transactionQuery.where.categoryId = budget.categoryId;
    }
    
    // Get total spending
    const transactions = await Transaction.findAll(transactionQuery);
    
    // Calculate total spending (only count expenses, not income)
    const totalSpent = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    
    // Calculate progress percentage
    const budgetAmount = parseFloat(budget.amount);
    const percentUsed = Math.min((totalSpent / budgetAmount) * 100, 100);
    const remaining = Math.max(budgetAmount - totalSpent, 0);
    
    res.json({
      budget,
      totalSpent,
      percentUsed,
      remaining,
      transactions
    });
  } catch (error) {
    console.error('Error getting budget progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
