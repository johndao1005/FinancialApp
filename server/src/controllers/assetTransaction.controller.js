/**
 * Asset Transaction Controller
 * 
 * This controller handles operations related to asset transactions:
 * - Recording value updates
 * - Managing contributions and withdrawals
 * - Tracking dividends and interest
 * - Handling partial sales and acquisitions
 */
const { Asset, AssetTransaction } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Create a new asset transaction
 * 
 * Records a new transaction for a specific asset and updates the asset's current value
 */
exports.createAssetTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      assetId,
      date,
      transactionType,
      amount,
      quantity,
      pricePerUnit,
      notes,
      documentReference,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!assetId || !date || !transactionType || amount === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: assetId, date, transactionType, and amount are required'
      });
    }
    
    // Find the asset
    const asset = await Asset.findOne({
      where: {
        id: assetId,
        userId
      }
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Check if the asset is active (only allow certain transaction types for inactive assets)
    if (!asset.isActive && !['interest', 'dividend'].includes(transactionType)) {
      return res.status(400).json({
        message: 'Cannot add transactions to inactive/sold assets except for interest or dividends'
      });
    }
    
    // Calculate new asset value based on transaction type
    let newValue = parseFloat(asset.currentValue);
    
    switch (transactionType) {
      case 'purchase':
      case 'contribution':
        newValue += parseFloat(amount);
        break;
      case 'sale':
      case 'withdrawal':
      case 'fee':
        newValue += parseFloat(amount); // Amount should be negative for these types
        break;
      case 'valuation_update':
        newValue = parseFloat(amount); // For valuation updates, amount is the new total value
        break;
      case 'dividend':
      case 'interest':
        // These don't change the asset value directly
        break;
      case 'split':
        // For stock splits, update quantity but not value
        if (asset.quantity && quantity) {
          // Update asset quantity for stock splits
          await Asset.update(
            { quantity },
            { where: { id: assetId, userId } }
          );
        }
        break;
    }
    
    // Ensure value doesn't go below zero
    newValue = Math.max(0, newValue);
    
    // Create the transaction
    const transaction = await AssetTransaction.create({
      userId,
      assetId,
      date: new Date(date),
      transactionType,
      amount: parseFloat(amount),
      quantity: quantity || null,
      pricePerUnit: pricePerUnit || null,
      valueAfterTransaction: newValue,
      currency: asset.currency,
      notes: notes || null,
      documentReference: documentReference || null,
      metadata: metadata || null
    });
    
    // Update asset current value except for dividend/interest transactions
    if (!['dividend', 'interest'].includes(transactionType)) {
      await Asset.update(
        {
          currentValue: newValue,
          lastValueUpdateDate: new Date()
        },
        { 
          where: { 
            id: assetId, 
            userId 
          } 
        }
      );
    }
    
    // If this is a quantity-based asset, update the quantity for purchases/sales
    if (['purchase', 'sale'].includes(transactionType) && quantity && asset.quantity !== null) {
      let newQuantity;
      
      if (transactionType === 'purchase') {
        newQuantity = parseFloat(asset.quantity) + parseFloat(quantity);
      } else {
        newQuantity = parseFloat(asset.quantity) - parseFloat(quantity);
      }
      
      // Ensure quantity doesn't go below zero
      newQuantity = Math.max(0, newQuantity);
      
      await Asset.update(
        { quantity: newQuantity },
        { where: { id: assetId, userId } }
      );
    }
    
    // If this is a full sale and reduces value to 0, mark asset as inactive
    if (transactionType === 'sale' && newValue === 0) {
      await Asset.update(
        {
          isActive: false,
          soldDate: new Date(date),
          saleValue: Math.abs(parseFloat(amount))
        },
        { where: { id: assetId, userId } }
      );
    }
    
    // Fetch updated asset
    const updatedAsset = await Asset.findByPk(assetId);
    
    res.status(201).json({
      message: 'Asset transaction recorded successfully',
      transaction,
      updatedAsset
    });
    
  } catch (error) {
    console.error('Error creating asset transaction:', error);
    res.status(500).json({
      message: 'Failed to record asset transaction',
      error: error.message
    });
  }
};

/**
 * Get transactions for an asset
 * 
 * Retrieves all transactions for a specific asset with optional filtering by date and type
 */
exports.getAssetTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;
    const { startDate, endDate, transactionType } = req.query;
    
    // Check if asset exists and belongs to user
    const asset = await Asset.findOne({
      where: {
        id: assetId,
        userId
      }
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Build where clause
    const whereClause = {
      assetId,
      userId
    };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.date = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.date = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (transactionType) {
      whereClause.transactionType = transactionType;
    }
    
    // Get transactions
    const transactions = await AssetTransaction.findAll({
      where: whereClause,
      order: [['date', 'DESC']]
    });
    
    // Calculate summary statistics
    const transactionsByType = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.transactionType]) {
        acc[transaction.transactionType] = [];
      }
      acc[transaction.transactionType].push(transaction);
      return acc;
    }, {});
    
    // Calculate totals by transaction type
    const totalsByType = {};
    Object.keys(transactionsByType).forEach(type => {
      totalsByType[type] = transactionsByType[type].reduce(
        (sum, transaction) => sum + parseFloat(transaction.amount), 0
      );
    });
    
    // Return transactions and summary
    res.status(200).json({
      asset: {
        id: asset.id,
        name: asset.name,
        assetType: asset.assetType,
        currentValue: asset.currentValue
      },
      transactions,
      summary: {
        totalTransactions: transactions.length,
        totalsByType
      }
    });
    
  } catch (error) {
    console.error('Error fetching asset transactions:', error);
    res.status(500).json({
      message: 'Failed to retrieve asset transactions',
      error: error.message
    });
  }
};

/**
 * Update an asset transaction
 * 
 * Modifies an existing transaction and updates related asset info if needed
 */
exports.updateAssetTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      date,
      amount,
      quantity,
      pricePerUnit,
      notes,
      documentReference,
      metadata
    } = req.body;
    
    // Find the transaction
    const transaction = await AssetTransaction.findOne({
      where: {
        id,
        userId
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Get the asset
    const asset = await Asset.findByPk(transaction.assetId);
    
    if (!asset) {
      return res.status(404).json({ message: 'Associated asset not found' });
    }
    
    // Build update object with provided fields only
    const updateData = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (notes !== undefined) updateData.notes = notes;
    if (documentReference !== undefined) updateData.documentReference = documentReference;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (pricePerUnit !== undefined) updateData.pricePerUnit = pricePerUnit;
    
    // Handle amount changes and recalculate asset value if needed
    if (amount !== undefined && amount !== transaction.amount) {
      updateData.amount = parseFloat(amount);
      
      // For transactions that affect asset value, recalculate the value
      if (!['dividend', 'interest'].includes(transaction.transactionType)) {
        // Calculate value change
        const valueDifference = parseFloat(amount) - parseFloat(transaction.amount);
        
        // Update value after transaction
        updateData.valueAfterTransaction = parseFloat(transaction.valueAfterTransaction) + valueDifference;
        
        // Asset value needs to be updated only if this is the latest transaction
        const latestTransaction = await AssetTransaction.findOne({
          where: {
            assetId: transaction.assetId,
            userId
          },
          order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });
        
        if (latestTransaction && latestTransaction.id === transaction.id) {
          // Update asset's current value
          await Asset.update(
            {
              currentValue: updateData.valueAfterTransaction,
              lastValueUpdateDate: new Date()
            },
            { where: { id: transaction.assetId, userId } }
          );
        }
      }
    }
    
    // Update the transaction
    await AssetTransaction.update(updateData, {
      where: {
        id,
        userId
      }
    });
    
    // Fetch updated transaction and asset
    const updatedTransaction = await AssetTransaction.findByPk(id);
    const updatedAsset = await Asset.findByPk(transaction.assetId);
    
    res.status(200).json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
      asset: updatedAsset
    });
    
  } catch (error) {
    console.error('Error updating asset transaction:', error);
    res.status(500).json({
      message: 'Failed to update transaction',
      error: error.message
    });
  }
};

/**
 * Delete an asset transaction
 * 
 * Removes a transaction and updates the asset's value if necessary
 */
exports.deleteAssetTransaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Find the transaction
    const transaction = await AssetTransaction.findOne({
      where: {
        id,
        userId
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Get the asset
    const asset = await Asset.findByPk(transaction.assetId);
    
    if (!asset) {
      return res.status(404).json({ message: 'Associated asset not found' });
    }
    
    // Check if this is the initial acquisition transaction
    if (transaction.metadata && transaction.metadata.isInitialAcquisition) {
      return res.status(400).json({
        message: 'Cannot delete the initial acquisition transaction. Delete the entire asset instead.'
      });
    }
    
    // For transactions that affect asset value, recalculate the value
    if (!['dividend', 'interest'].includes(transaction.transactionType)) {
      // Determine if this is the latest transaction
      const latestTransaction = await AssetTransaction.findOne({
        where: {
          assetId: transaction.assetId,
          userId,
          id: { [Op.ne]: transaction.id }
        },
        order: [['date', 'DESC'], ['createdAt', 'DESC']]
      });
      
      if (latestTransaction) {
        // If there are other transactions, set value to the most recent one's value
        await Asset.update(
          {
            currentValue: latestTransaction.valueAfterTransaction,
            lastValueUpdateDate: new Date()
          },
          { where: { id: transaction.assetId, userId } }
        );
      }
      
      // Update quantity if applicable (for purchase/sale transactions)
      if (['purchase', 'sale'].includes(transaction.transactionType) && 
          transaction.quantity && asset.quantity !== null) {
        let newQuantity;
        
        if (transaction.transactionType === 'purchase') {
          newQuantity = parseFloat(asset.quantity) - parseFloat(transaction.quantity);
        } else {
          newQuantity = parseFloat(asset.quantity) + parseFloat(transaction.quantity);
        }
        
        await Asset.update(
          { quantity: Math.max(0, newQuantity) },
          { where: { id: transaction.assetId, userId } }
        );
      }
    }
    
    // Delete the transaction
    await AssetTransaction.destroy({
      where: {
        id,
        userId
      }
    });
    
    // Fetch updated asset
    const updatedAsset = await Asset.findByPk(transaction.assetId);
    
    res.status(200).json({
      message: 'Transaction deleted successfully',
      asset: updatedAsset
    });
    
  } catch (error) {
    console.error('Error deleting asset transaction:', error);
    res.status(500).json({
      message: 'Failed to delete transaction',
      error: error.message
    });
  }
};

/**
 * Get asset transaction history
 * 
 * Retrieves a timeline of value changes for an asset
 */
exports.getAssetHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;
    const { period = 'all' } = req.query;
    
    // Check if asset exists and belongs to user
    const asset = await Asset.findOne({
      where: {
        id: assetId,
        userId
      }
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Determine date range based on period
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case '1m':
        startDate = moment().subtract(1, 'month').toDate();
        break;
      case '3m':
        startDate = moment().subtract(3, 'months').toDate();
        break;
      case '6m':
        startDate = moment().subtract(6, 'months').toDate();
        break;
      case '1y':
        startDate = moment().subtract(1, 'year').toDate();
        break;
      case '5y':
        startDate = moment().subtract(5, 'years').toDate();
        break;
      case 'ytd':
        startDate = moment().startOf('year').toDate();
        break;
      case 'all':
      default:
        startDate = asset.acquisitionDate;
        break;
    }
    
    // Get all transactions for the asset in the date range
    const transactions = await AssetTransaction.findAll({
      where: {
        assetId,
        userId,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });
    
    // Prepare value history (including initial value)
    const valueHistory = [{
      date: asset.acquisitionDate,
      value: asset.initialValue,
      transaction: null
    }];
    
    // Add transaction points
    transactions.forEach(transaction => {
      // Only include transactions that change the value
      if (!['dividend', 'interest'].includes(transaction.transactionType)) {
        valueHistory.push({
          date: transaction.date,
          value: transaction.valueAfterTransaction,
          transactionType: transaction.transactionType,
          amount: transaction.amount
        });
      }
    });
    
    // Add performance metrics
    const initialValue = parseFloat(asset.initialValue);
    const currentValue = parseFloat(asset.currentValue);
    const absoluteReturn = currentValue - initialValue;
    const percentReturn = initialValue > 0 ? (absoluteReturn / initialValue) * 100 : 0;
    
    const holdingPeriodYears = moment().diff(moment(asset.acquisitionDate), 'years', true);
    
    let annualizedReturn = 0;
    if (holdingPeriodYears > 0) {
      annualizedReturn = (Math.pow(currentValue / initialValue, 1 / holdingPeriodYears) - 1) * 100;
    }
    
    res.status(200).json({
      asset: {
        id: asset.id,
        name: asset.name,
        assetType: asset.assetType,
        initialValue,
        currentValue,
        acquisitionDate: asset.acquisitionDate,
        lastValueUpdateDate: asset.lastValueUpdateDate
      },
      valueHistory,
      performance: {
        absoluteReturn,
        percentReturn,
        annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
        holdingPeriodYears: parseFloat(holdingPeriodYears.toFixed(2))
      }
    });
    
  } catch (error) {
    console.error('Error fetching asset history:', error);
    res.status(500).json({
      message: 'Failed to retrieve asset history',
      error: error.message
    });
  }
};
