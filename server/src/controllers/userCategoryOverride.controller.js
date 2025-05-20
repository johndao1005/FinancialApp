/**
 * UserCategoryOverride Controller
 * 
 * This controller provides functions for managing user category overrides:
 * - Creating new override rules
 * - Applying rules to transactions
 * - Managing and updating existing rules
 * 
 * Category overrides allow the system to learn from user corrections and
 * improve future transaction categorization.
 */
const { UserCategoryOverride, Transaction, Category } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new category override rule
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createCategoryOverride = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId, pattern, matchField, matchType, amount, matchPriority } = req.body;
    
    // Validate required fields
    if (!categoryId || !pattern || !matchField || !matchType) {
      return res.status(400).json({ 
        message: 'Missing required fields: categoryId, pattern, matchField, and matchType are required' 
      });
    }
    
    // Check if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Create the override rule
    const override = await UserCategoryOverride.create({
      userId,
      categoryId,
      pattern,
      matchField,
      matchType,
      amount: amount || null,
      matchPriority: matchPriority || 'high',
      isActive: true,
      useCount: 0
    });
    
    res.status(201).json(override);
  } catch (error) {
    console.error('Error creating category override:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all category overrides for a user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCategoryOverrides = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const overrides = await UserCategoryOverride.findAll({
      where: { userId },
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(overrides);
  } catch (error) {
    console.error('Error getting category overrides:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a category override
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateCategoryOverride = async (req, res) => {
  try {
    const userId = req.user.id;
    const overrideId = req.params.id;
    
    const [updated] = await UserCategoryOverride.update(req.body, {
      where: { id: overrideId, userId }
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'Category override not found' });
    }
    
    const override = await UserCategoryOverride.findOne({
      where: { id: overrideId },
      include: [{ model: Category, as: 'category' }]
    });
    
    res.json(override);
  } catch (error) {
    console.error('Error updating category override:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a category override
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteCategoryOverride = async (req, res) => {
  try {
    const userId = req.user.id;
    const overrideId = req.params.id;
    
    const deleted = await UserCategoryOverride.destroy({
      where: { id: overrideId, userId }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Category override not found' });
    }
    
    res.json({ message: 'Category override deleted' });
  } catch (error) {
    console.error('Error deleting category override:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Apply category overrides to unassigned or specific transactions
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.applyCategoryOverrides = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionIds = req.body.transactionIds; // Optional: specific transactions to update
    const skipExistingCategories = req.body.skipExistingCategories !== false; // Default true
    
    // Get all active overrides for this user
    const overrides = await UserCategoryOverride.findAll({
      where: { 
        userId,
        isActive: true
      },
      include: [{ model: Category, as: 'category' }],
      order: [
        ['matchPriority', 'ASC'], // high, medium, low
        ['useCount', 'DESC'],     // most used first
        ['updatedAt', 'DESC']     // most recently updated first
      ]
    });
    
    if (overrides.length === 0) {
      return res.json({ 
        message: 'No active category rules found',
        updatedCount: 0
      });
    }
    
    // Set up query for transactions to update
    const where = { userId };
    
    // If specific transactions are specified, use those
    if (transactionIds && transactionIds.length > 0) {
      where.id = {
        [Op.in]: transactionIds
      };
    } else if (skipExistingCategories) {
      // Skip transactions that already have a user-set category
      where[Op.or] = [
        { categoryId: null },
        { categoryId: { [Op.in]: [1, 2] } } // Default Uncategorized IDs
      ];
    }
    
    // Get transactions that need categorization
    const transactions = await Transaction.findAll({
      where
    });
    
    let updatedCount = 0;
    let skippedCount = 0;
    const updatedTransactions = [];
    
    // For each transaction, try to apply matching rules
    for (const transaction of transactions) {
      let matched = false;
      
      // Skip already categorized transactions if requested
      if (skipExistingCategories && 
          transaction.categoryId && 
          ![1, 2].includes(transaction.categoryId)) {
        skippedCount++;
        continue;
      }
      
      // Try each override rule in priority order
      for (const override of overrides) {
        // Handle special case: if no match field data exists
        if (!transaction[override.matchField] && 
            override.matchField !== 'amount' &&
            override.matchField !== 'date') {
          continue;
        }
        
        let isMatch = false;
        
        // Check for a match based on the rule type
        switch (override.matchField) {
          case 'amount':
            // For amount matching, compare with a small tolerance for rounding
            const transAmount = Math.abs(parseFloat(transaction.amount));
            const ruleAmount = parseFloat(override.amount);
            isMatch = Math.abs(transAmount - ruleAmount) < 0.01;
            break;
            
          case 'date':
            // Special case: Match by month, quarter, or day of week
            if (override.matchType === 'month') {
              const transMonth = new Date(transaction.date).getMonth();
              const ruleMonth = parseInt(override.pattern, 10) - 1; // Months are 0-based in JS
              isMatch = transMonth === ruleMonth;
            } else if (override.matchType === 'dayOfWeek') {
              const transDayOfWeek = new Date(transaction.date).getDay();
              const ruleDayOfWeek = parseInt(override.pattern, 10);
              isMatch = transDayOfWeek === ruleDayOfWeek;
            } else if (override.matchType === 'quarter') {
              const transMonth = new Date(transaction.date).getMonth();
              const transQuarter = Math.floor(transMonth / 3) + 1;
              const ruleQuarter = parseInt(override.pattern, 10);
              isMatch = transQuarter === ruleQuarter;
            }
            break;
            
          default:
            // Handle text-based matches
            if (override.matchType === 'exact') {
              // Case insensitive exact match
              isMatch = transaction[override.matchField].toLowerCase() === 
                        override.pattern.toLowerCase();
            } else if (override.matchType === 'startsWith') {
              // Case insensitive starts with match
              isMatch = transaction[override.matchField].toLowerCase()
                        .startsWith(override.pattern.toLowerCase());
            } else if (override.matchType === 'endsWith') {
              // Case insensitive ends with match
              isMatch = transaction[override.matchField].toLowerCase()
                        .endsWith(override.pattern.toLowerCase());
            } else if (override.matchType === 'regex') {
              // Regular expression match - handle carefully with try/catch
              try {
                const regex = new RegExp(override.pattern, 'i');
                isMatch = regex.test(transaction[override.matchField]);
              } catch (regexError) {
                console.warn('Invalid regex pattern:', override.pattern);
                continue;
              }
            } else {
              // Default: case insensitive contains match
              isMatch = transaction[override.matchField].toLowerCase()
                        .includes(override.pattern.toLowerCase());
            }
        }
        
        // Special case: combined criteria matching
        if (isMatch && override.amount && override.matchField !== 'amount') {
          // Additional amount check for multi-criteria rules
          const transAmount = Math.abs(parseFloat(transaction.amount));
          const ruleAmount = parseFloat(override.amount);
          isMatch = Math.abs(transAmount - ruleAmount) < 0.01;
        }
        
        if (isMatch) {
          // Update the transaction category
          await transaction.update({ 
            categoryId: override.categoryId 
          });
          
          // Update the override usage statistics
          await override.update({ 
            useCount: override.useCount + 1,
            lastApplied: new Date()
          });
          
          updatedTransactions.push({
            id: transaction.id,
            description: transaction.description,
            oldCategoryId: transaction.categoryId,
            newCategoryId: override.categoryId,
            rule: {
              id: override.id,
              pattern: override.pattern,
              matchField: override.matchField,
              matchType: override.matchType
            }
          });
          
          matched = true;
          updatedCount++;
          break; // Stop after first match found
        }
      }
    }
    
    res.json({
      message: `Applied category rules to ${updatedCount} transactions (${skippedCount} skipped with existing categories)`,
      updatedCount,
      skippedCount,
      updatedTransactions: updatedTransactions.slice(0, 10) // Return first 10 examples
    });
  } catch (error) {
    console.error('Error applying category overrides:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create category rules from transaction patterns
 * Analyzes transaction data to suggest new category rules
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createRulesFromPatterns = async (req, res) => {
  try {
    const userId = req.user.id;
    const { minOccurrences = 3, findMerchants = true, findAmounts = true } = req.body;
    
    // Get all transactions with valid categories (not uncategorized)
    const transactions = await Transaction.findAll({
      where: {
        userId,
        categoryId: {
          [Op.notIn]: [1, 2], // Skip uncategorized
          [Op.not]: null
        }
      },
      include: [{ model: Category, as: 'category' }]
    });
    
    // Get existing rules to avoid duplicates
    const existingRules = await UserCategoryOverride.findAll({
      where: { userId }
    });
    
    // Group transactions by category
    const categorizedGroups = {};
    transactions.forEach(transaction => {
      const categoryId = transaction.categoryId;
      if (!categorizedGroups[categoryId]) {
        categorizedGroups[categoryId] = [];
      }
      categorizedGroups[categoryId].push(transaction);
    });
    
    const suggestedRules = [];
    const createdRules = [];
    
    // Process each category group
    for (const [categoryId, transactionGroup] of Object.entries(categorizedGroups)) {
      // Find recurring merchants
      if (findMerchants) {
        const merchantCounts = {};
        transactionGroup.forEach(transaction => {
          if (transaction.merchant) {
            const merchant = transaction.merchant.trim().toLowerCase();
            merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
          }
        });
        
        // Extract merchants that appear frequently
        for (const [merchant, count] of Object.entries(merchantCounts)) {
          if (count >= minOccurrences && merchant.length > 3) {
            // Check for duplicate rules
            const existingMerchantRule = existingRules.find(rule => 
              rule.categoryId == categoryId && 
              rule.matchField === 'merchant' &&
              rule.pattern.toLowerCase() === merchant.toLowerCase()
            );
            
            if (!existingMerchantRule) {
              const rule = {
                userId,
                categoryId,
                pattern: merchant,
                matchField: 'merchant',
                matchType: 'contains',
                matchPriority: 'medium',
                isActive: true,
                useCount: 0,
                occurrences: count
              };
              
              suggestedRules.push(rule);
              
              // Create the rule
              const createdRule = await UserCategoryOverride.create(rule);
              createdRules.push({
                id: createdRule.id,
                pattern: merchant,
                matchField: 'merchant',
                categoryId,
                occurrences: count
              });
            }
          }
        }
      }
      
      // Find recurring exact amounts
      if (findAmounts) {
        const amountCounts = {};
        transactionGroup.forEach(transaction => {
          const amount = Math.abs(parseFloat(transaction.amount)).toFixed(2);
          amountCounts[amount] = (amountCounts[amount] || 0) + 1;
        });
        
        // Extract amounts that appear frequently
        for (const [amount, count] of Object.entries(amountCounts)) {
          if (count >= minOccurrences && parseFloat(amount) > 0) {
            // Don't create amount rules for very common small amounts
            if (parseFloat(amount) < 10 && count < minOccurrences * 2) {
              continue;
            }
            
            // Check for duplicate rules
            const existingAmountRule = existingRules.find(rule => 
              rule.categoryId == categoryId && 
              rule.matchField === 'amount' &&
              Math.abs(parseFloat(rule.amount) - parseFloat(amount)) < 0.01
            );
            
            if (!existingAmountRule) {
              const rule = {
                userId,
                categoryId,
                pattern: amount.toString(),
                amount,
                matchField: 'amount',
                matchType: 'exact',
                matchPriority: 'low', // Lower priority than merchant matches
                isActive: true,
                useCount: 0,
                occurrences: count
              };
              
              suggestedRules.push(rule);
              
              // Create the rule
              const createdRule = await UserCategoryOverride.create(rule);
              createdRules.push({
                id: createdRule.id,
                amount,
                matchField: 'amount',
                categoryId,
                occurrences: count
              });
            }
          }
        }
      }
    }
    
    res.status(201).json({
      message: `Created ${createdRules.length} new category rules based on transaction patterns`,
      createdRules
    });
  } catch (error) {
    console.error('Error creating rules from patterns:', error);
    res.status(500).json({ message: 'Server error' });
  }
};