/**
 * Income Prediction Controller
 * 
 * This controller handles income trend analysis and prediction functionality:
 * - Analyzing historical income patterns
 * - Generating predictions for future income
 * - Managing income sources and categories
 * - Providing income trend statistics
 */
const { Transaction, IncomePrediction, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Generate income predictions based on historical transaction data
 * 
 * This function analyzes past income transactions and generates predictions
 * for future months based on patterns in the data.
 */
exports.generateIncomePredictions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { months = 3, sources = [] } = req.body;
    
    // Get historical income data (at least 3 months of data)
    const startDate = moment().subtract(6, 'months').startOf('month').toDate();
    const endDate = moment().endOf('month').toDate();
    
    // Query to get income transactions grouped by month and source
    const incomeData = await Transaction.findAll({
      attributes: [
        [sequelize.fn('strftime', '%Y-%m', sequelize.col('date')), 'month'],
        [sequelize.fn('sum', sequelize.col('amount')), 'totalAmount'],
        'merchant',
        [sequelize.fn('count', sequelize.col('id')), 'count']
      ],
      where: {
        userId,
        isExpense: false,
        date: {
          [Op.between]: [startDate, endDate]
        },
        ...(sources.length > 0 && { merchant: { [Op.in]: sources } })
      },
      group: [
        sequelize.fn('strftime', '%Y-%m', sequelize.col('date')),
        'merchant'
      ],
      order: [
        [sequelize.fn('strftime', '%Y-%m', sequelize.col('date')), 'ASC']
      ],
      raw: true
    });

    // Process and organize income by source and month
    const incomeBySource = {};
    
    incomeData.forEach(item => {
      const source = item.merchant || 'Unknown';
      if (!incomeBySource[source]) {
        incomeBySource[source] = [];
      }
      
      incomeBySource[source].push({
        month: item.month,
        amount: parseFloat(item.totalAmount),
        count: parseInt(item.count)
      });
    });

    // Generate predictions for each income source
    const predictions = [];
    
    for (const source in incomeBySource) {
      const sourceData = incomeBySource[source];
      
      // Only predict if we have enough data points
      if (sourceData.length >= 2) {
        // Calculate average monthly income for this source
        const totalAmount = sourceData.reduce((sum, data) => sum + data.amount, 0);
        const averageAmount = totalAmount / sourceData.length;
        
        // Calculate trend (simple linear regression)
        let trend = 0;
        if (sourceData.length > 2) {
          const xValues = sourceData.map((_, i) => i);
          const yValues = sourceData.map(data => data.amount);
          const xMean = xValues.reduce((sum, x) => sum + x, 0) / xValues.length;
          const yMean = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
          
          const numerator = xValues.reduce((sum, x, i) => sum + (x - xMean) * (yValues[i] - yMean), 0);
          const denominator = xValues.reduce((sum, x) => sum + Math.pow(x - xMean, 2), 0);
          
          trend = denominator !== 0 ? numerator / denominator : 0;
        }
        
        // Detect seasonality (simple approach)
        const isMonthly = sourceData.length >= 3 && 
          Math.abs(sourceData[0].amount - sourceData[sourceData.length - 1].amount) / averageAmount < 0.1;
        
        // Calculate consistency score (0-100%)
        const amounts = sourceData.map(data => data.amount);
        const stdDev = calculateStandardDeviation(amounts);
        const consistencyScore = Math.min(100, Math.max(0, 100 - (stdDev / averageAmount * 100)));
        
        // Generate predictions for future months
        for (let i = 1; i <= months; i++) {
          const predictionDate = moment().add(i, 'months').startOf('month');
          
          // Predicted amount based on average + trend
          const predictedAmount = averageAmount + (trend * (sourceData.length + i - 1));
          
          // Create prediction object
          const prediction = {
            userId,
            incomeSource: source,
            predictedAmount: Number(predictedAmount.toFixed(2)),
            confidenceScore: Math.round(consistencyScore),
            predictionForDate: predictionDate.toDate(),
            predictionMethod: trend !== 0 ? 'linearRegression' : 'average',
            historicalDataPoints: sourceData.length,
            notes: isMonthly ? 'Regular monthly income detected' : 'Variable income source'
          };
          
          predictions.push(prediction);
        }
      }
    }
    
    // Save predictions to database
    if (predictions.length > 0) {
      // Delete existing predictions for these months
      const futureDates = predictions.map(p => p.predictionForDate);
      await IncomePrediction.destroy({
        where: {
          userId,
          predictionForDate: {
            [Op.in]: futureDates
          },
          incomeSource: {
            [Op.in]: Object.keys(incomeBySource)
          }
        }
      });
      
      // Create new predictions
      await IncomePrediction.bulkCreate(predictions);
    }
    
    // Return predictions and source data
    res.status(200).json({
      predictions,
      historicalData: incomeBySource,
      summary: {
        predictedMonths: months,
        totalSources: Object.keys(incomeBySource).length,
        totalPredictions: predictions.length,
        averageConfidence: predictions.length > 0 
          ? Math.round(predictions.reduce((sum, p) => sum + p.confidenceScore, 0) / predictions.length) 
          : 0
      }
    });
    
  } catch (error) {
    console.error('Error generating income predictions:', error);
    res.status(500).json({ message: 'Failed to generate income predictions', error: error.message });
  }
};

/**
 * Get income predictions for the user
 * 
 * Retrieves existing income predictions, with options for filtering by date range and source
 */
exports.getIncomePredictions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, source } = req.query;
    
    // Build where clause
    const whereClause = { userId };
    
    if (startDate && endDate) {
      whereClause.predictionForDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.predictionForDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.predictionForDate = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    if (source) {
      whereClause.incomeSource = source;
    }
    
    // Get predictions
    const predictions = await IncomePrediction.findAll({
      where: whereClause,
      order: [
        ['predictionForDate', 'ASC'],
        ['incomeSource', 'ASC']
      ]
    });
    
    // Group by month for easier client-side processing
    const predictionsByMonth = {};
    
    predictions.forEach(prediction => {
      const month = moment(prediction.predictionForDate).format('YYYY-MM');
      if (!predictionsByMonth[month]) {
        predictionsByMonth[month] = [];
      }
      predictionsByMonth[month].push(prediction);
    });
    
    res.status(200).json({
      predictions,
      predictionsByMonth,
      totalPredictions: predictions.length
    });
    
  } catch (error) {
    console.error('Error fetching income predictions:', error);
    res.status(500).json({ message: 'Failed to fetch income predictions', error: error.message });
  }
};

/**
 * Get income trend analysis
 * 
 * Analyzes historical income data to identify trends, patterns and statistics
 */
exports.getIncomeTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { months = 12 } = req.query;
    
    // Get income transactions for the specified period
    const startDate = moment().subtract(months, 'months').startOf('month').toDate();
    const endDate = moment().endOf('month').toDate();
    
    const incomeTransactions = await Transaction.findAll({
      where: {
        userId,
        isExpense: false,
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC']]
    });
    
    // Organize by month
    const incomeByMonth = {};
    const sourcesByMonth = {};
    
    incomeTransactions.forEach(transaction => {
      const month = moment(transaction.date).format('YYYY-MM');
      
      // Add to monthly totals
      if (!incomeByMonth[month]) {
        incomeByMonth[month] = 0;
        sourcesByMonth[month] = {};
      }
      
      incomeByMonth[month] += parseFloat(transaction.amount);
      
      // Track by source
      const source = transaction.merchant || 'Unknown';
      if (!sourcesByMonth[month][source]) {
        sourcesByMonth[month][source] = 0;
      }
      sourcesByMonth[month][source] += parseFloat(transaction.amount);
    });
    
    // Convert to arrays for easier charting
    const monthlyTotals = Object.keys(incomeByMonth).map(month => ({
      month,
      total: Number(incomeByMonth[month].toFixed(2))
    }));
    
    // Identify top income sources
    const allSources = {};
    
    Object.values(sourcesByMonth).forEach(sources => {
      Object.entries(sources).forEach(([source, amount]) => {
        if (!allSources[source]) {
          allSources[source] = 0;
        }
        allSources[source] += amount;
      });
    });
    
    const topSources = Object.entries(allSources)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, amount]) => ({
        source,
        total: Number(amount.toFixed(2)),
        percentage: Number((amount / Object.values(allSources).reduce((sum, val) => sum + val, 0) * 100).toFixed(1))
      }));
    
    // Calculate growth rates
    let growthRate = 0;
    let monthsWithIncome = 0;
    
    if (monthlyTotals.length >= 2) {
      const monthlyAmounts = monthlyTotals.map(m => m.total);
      monthsWithIncome = monthlyAmounts.filter(a => a > 0).length;
      
      if (monthsWithIncome >= 2) {
        // Calculate average monthly growth rate
        let totalGrowthRate = 0;
        let countedMonths = 0;
        
        for (let i = 1; i < monthlyAmounts.length; i++) {
          if (monthlyAmounts[i-1] > 0 && monthlyAmounts[i] > 0) {
            totalGrowthRate += (monthlyAmounts[i] - monthlyAmounts[i-1]) / monthlyAmounts[i-1];
            countedMonths++;
          }
        }
        
        if (countedMonths > 0) {
          growthRate = Number((totalGrowthRate / countedMonths * 100).toFixed(1));
        }
      }
    }
    
    // Calculate stability score (consistency of income)
    let stabilityScore = 0;
    
    if (monthlyTotals.length >= 3) {
      const nonZeroAmounts = monthlyTotals.filter(m => m.total > 0).map(m => m.total);
      
      if (nonZeroAmounts.length >= 3) {
        const avg = nonZeroAmounts.reduce((sum, val) => sum + val, 0) / nonZeroAmounts.length;
        const stdDev = calculateStandardDeviation(nonZeroAmounts);
        
        // Higher score means more stable income
        stabilityScore = Math.min(100, Math.max(0, 100 - (stdDev / avg * 100)));
        stabilityScore = Number(stabilityScore.toFixed(0));
      }
    }
    
    res.status(200).json({
      monthlyIncome: monthlyTotals,
      sourceBreakdown: sourcesByMonth,
      topSources,
      stats: {
        averageMonthlyIncome: monthlyTotals.length > 0 
          ? Number((monthlyTotals.reduce((sum, month) => sum + month.total, 0) / monthlyTotals.length).toFixed(2))
          : 0,
        monthsAnalyzed: monthlyTotals.length,
        monthsWithIncome,
        growthRate,
        stabilityScore,
        incomeFrequency: calculateIncomeFrequency(incomeTransactions),
        diversificationScore: calculateDiversificationScore(topSources)
      }
    });
    
  } catch (error) {
    console.error('Error analyzing income trends:', error);
    res.status(500).json({ message: 'Failed to analyze income trends', error: error.message });
  }
};

/**
 * Update income prediction with actual data
 * 
 * After a month passes, update the prediction with actual income data for accuracy tracking
 */
exports.updatePredictionActuals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { predictionId } = req.params;
    const { actualAmount } = req.body;
    
    // Find the prediction
    const prediction = await IncomePrediction.findOne({
      where: {
        id: predictionId,
        userId
      }
    });
    
    if (!prediction) {
      return res.status(404).json({ message: 'Income prediction not found' });
    }
    
    // Calculate accuracy
    const predictedAmount = parseFloat(prediction.predictedAmount);
    const actual = parseFloat(actualAmount);
    
    // Accuracy based on percentage difference
    let accuracyPercentage = 0;
    if (predictedAmount > 0 && actual > 0) {
      const difference = Math.abs(predictedAmount - actual);
      accuracyPercentage = 100 - (difference / Math.max(predictedAmount, actual) * 100);
    }
    
    // Update prediction
    await prediction.update({
      actualAmount: actual,
      actualRecordedDate: new Date(),
      accuracyPercentage: Number(accuracyPercentage.toFixed(2))
    });
    
    res.status(200).json({
      message: 'Prediction updated with actual data',
      prediction,
      accuracyPercentage: Number(accuracyPercentage.toFixed(2))
    });
    
  } catch (error) {
    console.error('Error updating prediction actual:', error);
    res.status(500).json({ message: 'Failed to update prediction', error: error.message });
  }
};

/**
 * Get income sources for the user
 * 
 * Returns all unique sources of income based on transaction data
 */
exports.getIncomeSources = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Query unique merchants from income transactions
    const sources = await Transaction.findAll({
      attributes: [
        'merchant',
        [sequelize.fn('count', sequelize.col('id')), 'count'],
        [sequelize.fn('sum', sequelize.col('amount')), 'total']
      ],
      where: {
        userId,
        isExpense: false,
        merchant: {
          [Op.not]: null
        }
      },
      group: ['merchant'],
      order: [[sequelize.fn('sum', sequelize.col('amount')), 'DESC']],
      raw: true
    });
    
    const formattedSources = sources.map(source => ({
      name: source.merchant,
      transactionCount: parseInt(source.count),
      totalAmount: parseFloat(source.total)
    }));
    
    res.status(200).json({
      sources: formattedSources,
      totalSources: formattedSources.length
    });
    
  } catch (error) {
    console.error('Error fetching income sources:', error);
    res.status(500).json({ message: 'Failed to fetch income sources', error: error.message });
  }
};

// Helper function to calculate standard deviation
function calculateStandardDeviation(values) {
  if (values.length <= 1) return 0;
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  
  return Math.sqrt(avgSquareDiff);
}

// Helper function to analyze income frequency
function calculateIncomeFrequency(transactions) {
  if (transactions.length < 2) return 'insufficient-data';
  
  // Group by dates
  const dateSet = new Set();
  const dayOfMonthCounts = {};
  
  transactions.forEach(transaction => {
    const date = moment(transaction.date);
    dateSet.add(date.format('YYYY-MM-DD'));
    
    const dayOfMonth = date.date(); // 1-31
    dayOfMonthCounts[dayOfMonth] = (dayOfMonthCounts[dayOfMonth] || 0) + 1;
  });
  
  // Check if income comes on specific days of month
  const dayEntries = Object.entries(dayOfMonthCounts).sort((a, b) => b[1] - a[1]);
  const totalTransactions = transactions.length;
  
  // If more than 50% of transactions happen on the same day of month
  if (dayEntries.length > 0 && dayEntries[0][1] / totalTransactions >= 0.5) {
    return `monthly-day-${dayEntries[0][0]}`;
  }
  
  // Check for bi-weekly pattern
  const daysBetweenTransactions = [];
  const sortedDates = [...dateSet].sort();
  
  for (let i = 1; i < sortedDates.length; i++) {
    const dayDiff = moment(sortedDates[i]).diff(moment(sortedDates[i-1]), 'days');
    daysBetweenTransactions.push(dayDiff);
  }
  
  // Check for consistent interval
  const biweeklyCount = daysBetweenTransactions.filter(days => days >= 12 && days <= 16).length;
  const weeklyCount = daysBetweenTransactions.filter(days => days >= 5 && days <= 9).length;
  
  if (biweeklyCount / daysBetweenTransactions.length >= 0.5) {
    return 'biweekly';
  }
  
  if (weeklyCount / daysBetweenTransactions.length >= 0.5) {
    return 'weekly';
  }
  
  // Check for monthly pattern by analyzing months
  const monthSet = new Set(transactions.map(t => moment(t.date).format('YYYY-MM')));
  
  if (monthSet.size > 0 && transactions.length / monthSet.size >= 0.8) {
    return 'monthly';
  }
  
  return 'irregular';
}

// Helper function to calculate income diversification score
function calculateDiversificationScore(topSources) {
  if (topSources.length === 0) return 0;
  
  // Calculate diversification score (0-100)
  // Higher score means more diversified income sources
  
  // If only one source, score is 0
  if (topSources.length === 1) return 0;
  
  // Calculate Herfindahl-Hirschman Index (HHI)
  // Sum of squared percentages, then normalize to 0-100
  const totalPercentage = topSources.reduce((sum, source) => sum + source.percentage, 0);
  const normalizedSources = topSources.map(source => ({
    ...source,
    percentage: source.percentage / totalPercentage * 100
  }));
  
  const hhi = normalizedSources.reduce((sum, source) => sum + Math.pow(source.percentage, 2), 0);
  
  // Convert HHI to diversification score (inverted and scaled)
  // HHI of 10,000 means complete concentration (one source)
  // HHI of 0 means perfect diversification
  const score = Math.max(0, 100 - (hhi / 100));
  
  return Number(score.toFixed(0));
}
