const { Goal, Category, GoalContribution, Transaction } = require('../models');
const { Op } = require('sequelize');

// Get all goals for the authenticated user
exports.getGoals = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const goals = await Goal.findAll({
      where: { userId },
      include: [
        { model: Category, as: 'category' },
        { model: GoalContribution, as: 'contributions' }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate progress for each goal
    const goalsWithProgress = goals.map(goal => {
      const goalObj = goal.toJSON();
      
      // Calculate percentage complete
      const percentComplete = Math.min(
        (parseFloat(goalObj.currentAmount) / parseFloat(goalObj.targetAmount)) * 100, 
        100
      );
      
      // Calculate remaining amount
      const remainingAmount = Math.max(
        parseFloat(goalObj.targetAmount) - parseFloat(goalObj.currentAmount),
        0
      );
      
      // Calculate time progress if target date exists
      let timeProgress = null;
      let daysRemaining = null;
      
      if (goalObj.targetDate) {
        const startDate = new Date(goalObj.startDate);
        const targetDate = new Date(goalObj.targetDate);
        const currentDate = new Date();
        
        const totalDays = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24));
        const elapsedDays = Math.round((currentDate - startDate) / (1000 * 60 * 60 * 24));
        
        timeProgress = Math.min((elapsedDays / totalDays) * 100, 100);
        daysRemaining = Math.max(totalDays - elapsedDays, 0);
      }
      
      return {
        ...goalObj,
        percentComplete,
        remainingAmount,
        timeProgress,
        daysRemaining
      };
    });
    
    res.json(goalsWithProgress);
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single goal
exports.getGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    
    const goal = await Goal.findOne({
      where: {
        id: goalId,
        userId
      },
      include: [
        { model: Category, as: 'category' },
        { 
          model: GoalContribution, 
          as: 'contributions',
          include: [{ model: Transaction, as: 'transaction' }],
          order: [['date', 'DESC']]
        }
      ]
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Calculate progress
    const goalObj = goal.toJSON();
    
    // Calculate percentage complete
    const percentComplete = Math.min(
      (parseFloat(goalObj.currentAmount) / parseFloat(goalObj.targetAmount)) * 100, 
      100
    );
    
    // Calculate remaining amount
    const remainingAmount = Math.max(
      parseFloat(goalObj.targetAmount) - parseFloat(goalObj.currentAmount),
      0
    );
    
    // Calculate time progress if target date exists
    let timeProgress = null;
    let daysRemaining = null;
    
    if (goalObj.targetDate) {
      const startDate = new Date(goalObj.startDate);
      const targetDate = new Date(goalObj.targetDate);
      const currentDate = new Date();
      
      const totalDays = Math.round((targetDate - startDate) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.round((currentDate - startDate) / (1000 * 60 * 60 * 24));
      
      timeProgress = Math.min((elapsedDays / totalDays) * 100, 100);
      daysRemaining = Math.max(totalDays - elapsedDays, 0);
    }
    
    // Calculate monthly contribution needed to reach target
    let requiredMonthlyContribution = null;
    
    if (goalObj.targetDate && remainingAmount > 0) {
      const currentDate = new Date();
      const targetDate = new Date(goalObj.targetDate);
      const monthsRemaining = Math.max(
        (targetDate.getFullYear() - currentDate.getFullYear()) * 12 +
        (targetDate.getMonth() - currentDate.getMonth()),
        1
      );
      
      requiredMonthlyContribution = (remainingAmount / monthsRemaining).toFixed(2);
    }
    
    res.json({
      ...goalObj,
      percentComplete,
      remainingAmount,
      timeProgress,
      daysRemaining,
      requiredMonthlyContribution
    });
  } catch (error) {
    console.error('Error getting goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      name, 
      description, 
      targetAmount, 
      currentAmount, 
      targetDate, 
      type, 
      categoryId, 
      priority,
      color,
      icon,
      notes
    } = req.body;
    
    // Validate required fields
    if (!name || !targetAmount || !type) {
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
    
    // Create the goal
    const goal = await Goal.create({
      name,
      description,
      targetAmount,
      currentAmount: currentAmount || 0,
      targetDate,
      type,
      userId,
      categoryId,
      priority: priority || 'medium',
      color,
      icon,
      notes
    });
    
    // If currentAmount is provided and greater than 0, create initial contribution
    if (currentAmount && parseFloat(currentAmount) > 0) {
      await GoalContribution.create({
        amount: currentAmount,
        date: new Date(),
        userId,
        goalId: goal.id,
        description: 'Initial contribution'
      });
    }
    
    // Return the newly created goal with its category
    const newGoal = await Goal.findOne({
      where: { id: goal.id },
      include: [
        { model: Category, as: 'category' },
        { model: GoalContribution, as: 'contributions' }
      ]
    });
    
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a goal
exports.updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { 
      name, 
      description, 
      targetAmount, 
      currentAmount, 
      targetDate, 
      type, 
      status,
      categoryId, 
      priority,
      color,
      icon,
      notes
    } = req.body;
    
    // Find the goal
    const goal = await Goal.findOne({
      where: {
        id: goalId,
        userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // If categoryId is provided, check if it exists
    if (categoryId && categoryId !== goal.categoryId) {
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
    
    // Check if current amount has changed
    const oldCurrentAmount = parseFloat(goal.currentAmount);
    const newCurrentAmount = currentAmount !== undefined ? parseFloat(currentAmount) : oldCurrentAmount;
    
    // Update the goal
    await goal.update({
      name: name || goal.name,
      description: description !== undefined ? description : goal.description,
      targetAmount: targetAmount || goal.targetAmount,
      currentAmount: newCurrentAmount,
      targetDate: targetDate !== undefined ? targetDate : goal.targetDate,
      type: type || goal.type,
      status: status || goal.status,
      categoryId: categoryId !== undefined ? categoryId : goal.categoryId,
      priority: priority || goal.priority,
      color: color !== undefined ? color : goal.color,
      icon: icon !== undefined ? icon : goal.icon,
      notes: notes !== undefined ? notes : goal.notes
    });
    
    // If currentAmount has changed, create a contribution record for the difference
    if (newCurrentAmount !== oldCurrentAmount) {
      const contributionAmount = newCurrentAmount - oldCurrentAmount;
      
      if (contributionAmount !== 0) {
        await GoalContribution.create({
          amount: Math.abs(contributionAmount),
          date: new Date(),
          userId,
          goalId: goal.id,
          description: contributionAmount > 0 ? 'Manual contribution' : 'Adjustment'
        });
      }
    }
    
    // Return the updated goal with its category and contributions
    const updatedGoal = await Goal.findOne({
      where: { id: goalId },
      include: [
        { model: Category, as: 'category' },
        { 
          model: GoalContribution, 
          as: 'contributions',
          order: [['date', 'DESC']]
        }
      ]
    });
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    
    // Find the goal
    const goal = await Goal.findOne({
      where: {
        id: goalId,
        userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Delete goal contributions first (cascade delete doesn't always work)
    await GoalContribution.destroy({
      where: { goalId }
    });
    
    // Delete the goal
    await goal.destroy();
    
    res.json({ message: 'Goal deleted successfully', id: goalId });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a contribution to a goal
exports.addContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const { amount, date, description, transactionId } = req.body;
    
    // Validate input
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Please provide a valid contribution amount' });
    }
    
    // Find the goal
    const goal = await Goal.findOne({
      where: {
        id: goalId,
        userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // If transactionId is provided, check if it exists and belongs to the user
    if (transactionId) {
      const transaction = await Transaction.findOne({
        where: {
          id: transactionId,
          userId
        }
      });
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
    }
    
    // Create the contribution
    const contribution = await GoalContribution.create({
      amount,
      date: date || new Date(),
      userId,
      goalId,
      description,
      transactionId
    });
    
    // Update the goal's current amount
    const newCurrentAmount = parseFloat(goal.currentAmount) + parseFloat(amount);
    await goal.update({ 
      currentAmount: newCurrentAmount,
      status: newCurrentAmount >= parseFloat(goal.targetAmount) ? 'completed' : goal.status
    });
    
    // Get the updated contribution with related transaction
    const newContribution = await GoalContribution.findOne({
      where: { id: contribution.id },
      include: [{ model: Transaction, as: 'transaction' }]
    });
    
    res.status(201).json(newContribution);
  } catch (error) {
    console.error('Error adding contribution:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a contribution
exports.deleteContribution = async (req, res) => {
  try {
    const userId = req.user.id;
    const goalId = req.params.id;
    const contributionId = req.params.contributionId;
    
    // Find the goal
    const goal = await Goal.findOne({
      where: {
        id: goalId,
        userId
      }
    });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Find the contribution
    const contribution = await GoalContribution.findOne({
      where: {
        id: contributionId,
        goalId,
        userId
      }
    });
    
    if (!contribution) {
      return res.status(404).json({ message: 'Contribution not found' });
    }
    
    // Update the goal's current amount
    const newCurrentAmount = Math.max(
      parseFloat(goal.currentAmount) - parseFloat(contribution.amount),
      0
    );
    await goal.update({ 
      currentAmount: newCurrentAmount,
      status: newCurrentAmount < parseFloat(goal.targetAmount) && goal.status === 'completed' ? 'in_progress' : goal.status
    });
    
    // Delete the contribution
    await contribution.destroy();
    
    res.json({ message: 'Contribution deleted successfully', id: contributionId });
  } catch (error) {
    console.error('Error deleting contribution:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
