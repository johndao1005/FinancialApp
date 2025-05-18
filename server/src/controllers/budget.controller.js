const { Budget, Category, Transaction } = require('../models');
const { Op } = require('sequelize');

// Get all budgets for the authenticated user
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

// Get a single budget
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

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, amount, period, startDate, endDate, categoryId, notes } = req.body;
    
    // Validate input
    if (!name || !amount || !period || !startDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // If categoryId is provided, check if it exists
    if (categoryId) {
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
    
    // Create the budget
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

// Update a budget
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
