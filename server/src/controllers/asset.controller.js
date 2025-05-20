/**
 * Asset Controller
 * 
 * This controller handles operations related to user assets:
 * - Creating and updating assets
 * - Retrieving asset information
 * - Calculating asset valuation and performance metrics
 * - Managing asset lifecycle (acquisition to sale)
 * - Calculating net worth and portfolio statistics
 */
const { Asset, AssetTransaction, sequelize, User } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Create a new asset
 * 
 * Adds a new asset to the user's portfolio with initial valuation
 * and automatically creates the first asset transaction record.
 */
exports.createAsset = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const {
      name,
      assetType,
      initialValue,
      acquisitionDate,
      currency = 'USD',
      quantity,
      symbol,
      location,
      notes,
      isInvestment,
      annualRateOfReturn,
      attributes
    } = req.body;
    
    // Validate required fields
    if (!name || !assetType || !initialValue || !acquisitionDate) {
      return res.status(400).json({
        message: 'Missing required fields: name, assetType, initialValue, and acquisitionDate are required'
      });
    }
    
    // Create the asset
    const asset = await Asset.create({
      userId,
      name,
      assetType,
      initialValue,
      currentValue: initialValue,
      acquisitionDate: new Date(acquisitionDate),
      currency,
      quantity: quantity || null,
      symbol: symbol || null,
      location: location || null,
      notes: notes || null,
      isInvestment: isInvestment || false,
      annualRateOfReturn: annualRateOfReturn || null,
      attributes: attributes || null,
      lastValueUpdateDate: new Date()
    }, { transaction });
    
    // Create initial asset transaction record
    await AssetTransaction.create({
      userId,
      assetId: asset.id,
      date: new Date(acquisitionDate),
      transactionType: 'purchase',
      amount: initialValue,
      quantity: quantity || null,
      pricePerUnit: quantity ? (initialValue / quantity) : null,
      valueAfterTransaction: initialValue,
      currency,
      notes: 'Initial acquisition',
      metadata: {
        isInitialAcquisition: true
      }
    }, { transaction });
    
    // Commit the transaction
    await transaction.commit();
    
    // Return the created asset
    res.status(201).json({
      message: 'Asset created successfully',
      asset
    });
    
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    
    console.error('Error creating asset:', error);
    res.status(500).json({
      message: 'Failed to create asset',
      error: error.message
    });
  }
};

/**
 * Get all assets for the current user
 * 
 * Retrieves a list of all assets owned by the user with optional filtering
 */
exports.getAssets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetType, isActive, isInvestment } = req.query;
    
    // Build where clause based on query parameters
    const whereClause = { userId };
    
    if (assetType) {
      whereClause.assetType = assetType;
    }
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }
    
    if (isInvestment !== undefined) {
      whereClause.isInvestment = isInvestment === 'true';
    }
    
    // Fetch assets
    const assets = await Asset.findAll({
      where: whereClause,
      order: [['acquisitionDate', 'DESC']]
    });
    
    // Calculate summary statistics
    const totalValue = assets.reduce((sum, asset) => sum + parseFloat(asset.currentValue), 0);
    const totalInitialValue = assets.reduce((sum, asset) => sum + parseFloat(asset.initialValue), 0);
    const valueChange = totalValue - totalInitialValue;
    const percentChange = totalInitialValue > 0 
      ? (valueChange / totalInitialValue) * 100 
      : 0;
    
    // Group assets by type
    const assetsByType = assets.reduce((acc, asset) => {
      if (!acc[asset.assetType]) {
        acc[asset.assetType] = [];
      }
      acc[asset.assetType].push(asset);
      return acc;
    }, {});
    
    // Calculate value by asset type
    const valueByType = {};
    Object.keys(assetsByType).forEach(type => {
      valueByType[type] = assetsByType[type].reduce(
        (sum, asset) => sum + parseFloat(asset.currentValue), 0
      );
    });
    
    res.status(200).json({
      assets,
      summary: {
        totalAssets: assets.length,
        totalValue,
        totalInitialValue,
        valueChange,
        percentChange,
        valueByType
      }
    });
    
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({
      message: 'Failed to retrieve assets',
      error: error.message
    });
  }
};

/**
 * Get a single asset by ID
 * 
 * Retrieves detailed information about a specific asset
 * including recent transactions
 */
exports.getAssetById = async (req, res) => {
  try {
    const userId = req.user.id;
    const assetId = req.params.id;
    
    // Fetch the asset
    const asset = await Asset.findOne({
      where: {
        id: assetId,
        userId
      }
    });
    
    if (!asset) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Fetch recent transactions for this asset
    const recentTransactions = await AssetTransaction.findAll({
      where: {
        assetId,
        userId
      },
      order: [['date', 'DESC']],
      limit: 10
    });
    
    // Calculate performance metrics
    const acquisitionDate = moment(asset.acquisitionDate);
    const now = moment();
    const holdingPeriodYears = now.diff(acquisitionDate, 'years', true);
    
    let annualizedReturn = 0;
    if (holdingPeriodYears > 0) {
      // Calculate annualized return using CAGR formula
      annualizedReturn = (Math.pow(
        asset.currentValue / asset.initialValue, 
        1 / holdingPeriodYears
      ) - 1) * 100;
    }
    
    res.status(200).json({
      asset,
      recentTransactions,
      performance: {
        holdingPeriodYears: parseFloat(holdingPeriodYears.toFixed(2)),
        totalReturn: parseFloat(((asset.currentValue - asset.initialValue) / asset.initialValue * 100).toFixed(2)),
        annualizedReturn: parseFloat(annualizedReturn.toFixed(2))
      }
    });
    
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({
      message: 'Failed to retrieve asset',
      error: error.message
    });
  }
};

/**
 * Update an existing asset
 * 
 * Updates asset information and optionally records a valuation change
 */
exports.updateAsset = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const assetId = req.params.id;
    const {
      name,
      currentValue,
      recordValuationChange = false,
      notes,
      location,
      isInvestment,
      annualRateOfReturn,
      attributes,
      isActive,
      soldDate,
      saleValue
    } = req.body;
    
    // Find the asset
    const asset = await Asset.findOne({
      where: {
        id: assetId,
        userId
      }
    });
    
    if (!asset) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Build update object with provided fields only
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (notes !== undefined) updateData.notes = notes;
    if (location !== undefined) updateData.location = location;
    if (isInvestment !== undefined) updateData.isInvestment = isInvestment;
    if (annualRateOfReturn !== undefined) updateData.annualRateOfReturn = annualRateOfReturn;
    if (attributes !== undefined) updateData.attributes = attributes;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (soldDate !== undefined) updateData.soldDate = new Date(soldDate);
    if (saleValue !== undefined) updateData.saleValue = saleValue;
    
    // If current value is being updated
    if (currentValue !== undefined) {
      updateData.currentValue = currentValue;
      updateData.lastValueUpdateDate = new Date();
      
      // Record a valuation transaction if requested
      if (recordValuationChange) {
        const valueDifference = currentValue - asset.currentValue;
        
        await AssetTransaction.create({
          userId,
          assetId,
          date: new Date(),
          transactionType: 'valuation_update',
          amount: valueDifference,
          valueAfterTransaction: currentValue,
          currency: asset.currency,
          notes: req.body.transactionNotes || 'Periodic value update',
        }, { transaction });
      }
    }
    
    // If asset is being marked as sold
    if (isActive === false && soldDate && saleValue) {
      // Check if we need to record a sale transaction
      const shouldRecordSale = !(await AssetTransaction.findOne({
        where: {
          assetId,
          transactionType: 'sale',
          notes: { [Op.like]: '%Final sale%' }
        }
      }));
      
      if (shouldRecordSale) {
        await AssetTransaction.create({
          userId,
          assetId,
          date: new Date(soldDate),
          transactionType: 'sale',
          amount: -parseFloat(asset.currentValue),
          quantity: asset.quantity,
          pricePerUnit: asset.quantity ? (saleValue / asset.quantity) : null,
          valueAfterTransaction: 0,
          currency: asset.currency,
          notes: 'Final sale of asset',
        }, { transaction });
      }
    }
    
    // Update the asset
    await Asset.update(updateData, {
      where: {
        id: assetId,
        userId
      },
      transaction
    });
    
    // Commit the transaction
    await transaction.commit();
    
    // Fetch the updated asset
    const updatedAsset = await Asset.findByPk(assetId);
    
    res.status(200).json({
      message: 'Asset updated successfully',
      asset: updatedAsset
    });
    
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    
    console.error('Error updating asset:', error);
    res.status(500).json({
      message: 'Failed to update asset',
      error: error.message
    });
  }
};

/**
 * Delete an asset
 * 
 * Deletes an asset and all its associated transactions
 */
exports.deleteAsset = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const assetId = req.params.id;
    
    // Check if asset exists
    const asset = await Asset.findOne({
      where: {
        id: assetId,
        userId
      }
    });
    
    if (!asset) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Asset not found' });
    }
    
    // Delete associated transactions
    await AssetTransaction.destroy({
      where: {
        assetId,
        userId
      },
      transaction
    });
    
    // Delete the asset
    await Asset.destroy({
      where: {
        id: assetId,
        userId
      },
      transaction
    });
    
    // Commit the transaction
    await transaction.commit();
    
    res.status(200).json({
      message: 'Asset and associated transactions deleted successfully'
    });
    
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    
    console.error('Error deleting asset:', error);
    res.status(500).json({
      message: 'Failed to delete asset',
      error: error.message
    });
  }
};

/**
 * Calculate user's net worth
 * 
 * Computes the total value of assets minus liabilities
 */
exports.getNetWorth = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all active assets
    const assets = await Asset.findAll({
      where: {
        userId,
        isActive: true
      }
    });
    
    // Calculate total asset value
    const totalAssetValue = assets.reduce(
      (sum, asset) => sum + parseFloat(asset.currentValue), 0
    );
    
    // Group assets by type for breakdown
    const assetsByType = assets.reduce((acc, asset) => {
      if (!acc[asset.assetType]) {
        acc[asset.assetType] = { value: 0, count: 0 };
      }
      acc[asset.assetType].value += parseFloat(asset.currentValue);
      acc[asset.assetType].count += 1;
      return acc;
    }, {});
    
    // Calculate allocation percentages
    const allocation = {};
    if (totalAssetValue > 0) {
      Object.keys(assetsByType).forEach(type => {
        allocation[type] = (assetsByType[type].value / totalAssetValue) * 100;
      });
    }
    
    // Get historical net worth
    const sixMonthsAgo = moment().subtract(6, 'months').toDate();
    
    // Get all asset transactions for the period
    const transactions = await AssetTransaction.findAll({
      where: {
        userId,
        date: { [Op.gte]: sixMonthsAgo }
      },
      order: [['date', 'ASC']],
      include: [{ model: Asset, as: 'asset' }]
    });
    
    // Calculate monthly net worth values
    const monthlyNetWorth = {};
    
    // Initialize with current month
    const currentMonth = moment().format('YYYY-MM');
    monthlyNetWorth[currentMonth] = totalAssetValue;
    
    // Process transactions to calculate historical values
    // This is a simplified approach; in a real application you'd need a more robust algorithm
    transactions.forEach(transaction => {
      const month = moment(transaction.date).format('YYYY-MM');
      if (!monthlyNetWorth[month]) {
        monthlyNetWorth[month] = totalAssetValue;
      }
      
      // Adjust based on transaction type
      if (['purchase', 'contribution'].includes(transaction.transactionType)) {
        monthlyNetWorth[month] -= parseFloat(transaction.amount);
      } else if (['sale', 'withdrawal'].includes(transaction.transactionType)) {
        monthlyNetWorth[month] += parseFloat(transaction.amount);
      }
    });
    
    // Order by month
    const historicalNetWorth = Object.entries(monthlyNetWorth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, value]) => ({ month, value }));
    
    // Return net worth data
    res.status(200).json({
      currentNetWorth: totalAssetValue,
      assetAllocation: allocation,
      assetsSummary: assetsByType,
      historicalNetWorth,
      totalAssets: assets.length
    });
    
  } catch (error) {
    console.error('Error calculating net worth:', error);
    res.status(500).json({
      message: 'Failed to calculate net worth',
      error: error.message
    });
  }
};

/**
 * Get investment portfolio performance
 * 
 * Calculates performance metrics for investment assets
 */
exports.getPortfolioPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all active investment assets
    const investments = await Asset.findAll({
      where: {
        userId,
        isActive: true,
        isInvestment: true
      }
    });
    
    // Calculate portfolio value
    const portfolioValue = investments.reduce(
      (sum, asset) => sum + parseFloat(asset.currentValue), 0
    );
    
    // Calculate portfolio initial investment
    const initialInvestment = investments.reduce(
      (sum, asset) => sum + parseFloat(asset.initialValue), 0
    );
    
    // Calculate total return
    const totalReturn = portfolioValue - initialInvestment;
    const totalReturnPercentage = initialInvestment > 0 
      ? (totalReturn / initialInvestment) * 100 
      : 0;
    
    // Calculate weighted average holding period
    let weightedHoldingPeriod = 0;
    
    if (portfolioValue > 0) {
      weightedHoldingPeriod = investments.reduce((sum, asset) => {
        const holdingYears = moment().diff(moment(asset.acquisitionDate), 'years', true);
        const weight = parseFloat(asset.currentValue) / portfolioValue;
        return sum + (holdingYears * weight);
      }, 0);
    }
    
    // Calculate annualized return (weighted average of individual assets)
    let annualizedReturn = 0;
    
    if (portfolioValue > 0) {
      annualizedReturn = investments.reduce((sum, asset) => {
        const holdingYears = moment().diff(moment(asset.acquisitionDate), 'years', true);
        
        if (holdingYears > 0) {
          // Calculate individual asset CAGR
          const assetCAGR = (Math.pow(
            asset.currentValue / asset.initialValue, 
            1 / holdingYears
          ) - 1) * 100;
          
          // Weight by current value
          const weight = parseFloat(asset.currentValue) / portfolioValue;
          return sum + (assetCAGR * weight);
        }
        return sum;
      }, 0);
    }
    
    // Group investments by type
    const investmentsByType = investments.reduce((acc, asset) => {
      if (!acc[asset.assetType]) {
        acc[asset.assetType] = { value: 0, initialValue: 0, assets: [] };
      }
      acc[asset.assetType].value += parseFloat(asset.currentValue);
      acc[asset.assetType].initialValue += parseFloat(asset.initialValue);
      acc[asset.assetType].assets.push({
        id: asset.id,
        name: asset.name,
        value: parseFloat(asset.currentValue),
        initialValue: parseFloat(asset.initialValue),
        return: (parseFloat(asset.currentValue) - parseFloat(asset.initialValue)),
        returnPercentage: (parseFloat(asset.currentValue) - parseFloat(asset.initialValue)) / parseFloat(asset.initialValue) * 100
      });
      return acc;
    }, {});
    
    // Calculate returns by type
    const returnsByType = {};
    Object.keys(investmentsByType).forEach(type => {
      const typeData = investmentsByType[type];
      returnsByType[type] = {
        value: typeData.value,
        initialValue: typeData.initialValue,
        return: typeData.value - typeData.initialValue,
        returnPercentage: typeData.initialValue > 0 
          ? ((typeData.value - typeData.initialValue) / typeData.initialValue) * 100 
          : 0
      };
    });
    
    // Return portfolio performance data
    res.status(200).json({
      totalInvestments: investments.length,
      portfolioValue,
      initialInvestment,
      totalReturn,
      totalReturnPercentage,
      annualizedReturn,
      averageHoldingPeriod: weightedHoldingPeriod,
      investmentsByType,
      returnsByType
    });
    
  } catch (error) {
    console.error('Error calculating portfolio performance:', error);
    res.status(500).json({
      message: 'Failed to calculate portfolio performance',
      error: error.message
    });
  }
};
