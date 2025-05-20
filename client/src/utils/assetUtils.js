/**
 * Asset Utility Functions
 * 
 * Helper functions for asset management:
 * - Validation of asset data
 * - Calculation of asset performance metrics
 * - Asset value depreciation/appreciation formulas
 */

/**
 * Validate asset data before submission
 * @param {Object} assetData - The asset data to validate
 * @returns {Object} Object with isValid flag and any error messages
 */
export const validateAsset = (assetData) => {
  const errors = {};
  
  // Required fields
  if (!assetData.name || assetData.name.trim() === '') {
    errors.name = 'Asset name is required';
  }
  
  if (!assetData.assetType) {
    errors.assetType = 'Asset type is required';
  }
  
  if (!assetData.initialValue || isNaN(parseFloat(assetData.initialValue)) || parseFloat(assetData.initialValue) <= 0) {
    errors.initialValue = 'Initial value must be a positive number';
  }
  
  if (!assetData.acquisitionDate) {
    errors.acquisitionDate = 'Acquisition date is required';
  }
  
  // Type-specific validations
  switch (assetData.assetType) {
    case 'property':
      if (!assetData.location || assetData.location.trim() === '') {
        errors.location = 'Property location is required';
      }
      break;
      
    case 'stock':
      if (!assetData.symbol || assetData.symbol.trim() === '') {
        errors.symbol = 'Stock symbol is required';
      }
      if (!assetData.quantity || isNaN(parseFloat(assetData.quantity)) || parseFloat(assetData.quantity) <= 0) {
        errors.quantity = 'Quantity must be a positive number';
      }
      break;
      
    case 'crypto':
      if (!assetData.symbol || assetData.symbol.trim() === '') {
        errors.symbol = 'Cryptocurrency symbol is required';
      }
      if (!assetData.quantity || isNaN(parseFloat(assetData.quantity)) || parseFloat(assetData.quantity) <= 0) {
        errors.quantity = 'Quantity must be a positive number';
      }
      break;
      
    case 'term_deposit':
      if (!assetData.annualRateOfReturn || isNaN(parseFloat(assetData.annualRateOfReturn))) {
        errors.annualRateOfReturn = 'Annual rate of return is required';
      }
      break;
      
    default:
      break;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Calculate asset performance metrics
 * @param {Object} asset - The asset to calculate performance for
 * @param {Array} transactions - The asset's transactions
 * @returns {Object} Performance metrics
 */
export const calculateAssetPerformance = (asset, transactions) => {
  const initialValue = parseFloat(asset.initialValue);
  const currentValue = parseFloat(asset.currentValue);
  const acquisitionDate = new Date(asset.acquisitionDate);
  const today = new Date();
  
  // Calculate total return
  const totalReturn = currentValue - initialValue;
  const totalReturnPercentage = initialValue > 0 ? (totalReturn / initialValue) * 100 : 0;
  
  // Calculate holding period in years
  const holdingPeriodInDays = (today - acquisitionDate) / (1000 * 60 * 60 * 24);
  const holdingPeriodInYears = holdingPeriodInDays / 365;
  
  // Calculate annualized return (CAGR)
  const annualizedReturn = holdingPeriodInYears > 0 
    ? (Math.pow((currentValue / initialValue), (1 / holdingPeriodInYears)) - 1) * 100
    : 0;
  
  // Calculate contribution and withdrawals
  const contributions = transactions
    ? transactions
        .filter(t => t.transactionType === 'contribution' || t.transactionType === 'purchase')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    : 0;
    
  const withdrawals = transactions
    ? transactions
        .filter(t => t.transactionType === 'withdrawal' || t.transactionType === 'sale')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)
    : 0;
  
  // Adjusted total return (accounting for cash flows)
  const adjustedTotalReturn = currentValue - initialValue - contributions + withdrawals;
  
  return {
    totalReturn,
    totalReturnPercentage,
    annualizedReturn,
    holdingPeriodInYears,
    contributions,
    withdrawals,
    adjustedTotalReturn
  };
};

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Generate forecasted future value based on current value and projected growth
 * @param {number} currentValue - The current asset value
 * @param {number} annualReturnRate - Annual rate of return (in percent)
 * @param {number} years - Number of years to project
 * @returns {number} Forecasted future value
 */
export const forecastFutureValue = (currentValue, annualReturnRate, years) => {
  const rate = annualReturnRate / 100;
  return currentValue * Math.pow(1 + rate, years);
};

/**
 * Calculate depreciation for depreciating assets
 * @param {number} initialValue - The initial asset value
 * @param {number} salvageValue - The estimated salvage value
 * @param {number} usefulLifeYears - Useful life in years
 * @param {number} yearsHeld - Years the asset has been held
 * @returns {number} Current depreciated value
 */
export const calculateStraightLineDepreciation = (initialValue, salvageValue, usefulLifeYears, yearsHeld) => {
  const annualDepreciation = (initialValue - salvageValue) / usefulLifeYears;
  const totalDepreciation = Math.min(yearsHeld, usefulLifeYears) * annualDepreciation;
  return Math.max(initialValue - totalDepreciation, salvageValue);
};

/**
 * Calculate double-declining balance depreciation
 * @param {number} initialValue - The initial asset value
 * @param {number} salvageValue - The estimated salvage value
 * @param {number} usefulLifeYears - Useful life in years
 * @param {number} yearsHeld - Years the asset has been held
 * @returns {number} Current depreciated value using double-declining balance method
 */
export const calculateDoubleDecliningSalvage = (initialValue, salvageValue, usefulLifeYears, yearsHeld) => {
  const straightLineRate = 1 / usefulLifeYears;
  const doubleRate = straightLineRate * 2;
  
  let remainingValue = initialValue;
  const maxYears = Math.min(yearsHeld, usefulLifeYears);
  
  for (let year = 1; year <= maxYears; year++) {
    // Switch to straight-line method if it yields higher depreciation
    const remainingYears = usefulLifeYears - year + 1;
    const straightLineDepreciation = (remainingValue - salvageValue) / remainingYears;
    const ddBalanceDepreciation = remainingValue * doubleRate;
    
    // Use the lower depreciation amount to avoid going below salvage value
    const annualDepreciation = Math.min(
      straightLineDepreciation, 
      ddBalanceDepreciation,
      remainingValue - salvageValue
    );
    
    remainingValue -= annualDepreciation;
  }
  
  return Math.max(remainingValue, salvageValue);
};

/**
 * Calculate appreciation for appreciating assets
 * @param {number} initialValue - The initial asset value
 * @param {number} annualAppreciationRate - Annual appreciation rate (in percent)
 * @param {number} yearsHeld - Years the asset has been held
 * @param {boolean} compounded - Whether appreciation is compounded annually
 * @returns {number} Current appreciated value
 */
export const calculateAppreciation = (initialValue, annualAppreciationRate, yearsHeld, compounded = true) => {
  const rate = annualAppreciationRate / 100;
  
  if (compounded) {
    // Compound growth (e.g., investments, property in hot markets)
    return initialValue * Math.pow(1 + rate, yearsHeld);
  } else {
    // Simple, linear growth (e.g., some collectibles, stable markets)
    return initialValue * (1 + (rate * yearsHeld));
  }
};

/**
 * Generate a valuation projection for an asset over time
 * @param {Object} asset - The asset to project valuation for
 * @param {number} years - Number of years to project (default: 10)
 * @param {number} intervalMonths - Interval in months between projections (default: 12)
 * @returns {Array} Array of projected values with dates
 */
export const generateValuationProjection = (asset, years = 10, intervalMonths = 12) => {
  const { 
    assetType, 
    initialValue, 
    currentValue, 
    acquisitionDate, 
    annualRateOfReturn,
    attributes 
  } = asset;
  
  const projectionPoints = [];
  const startDate = new Date(acquisitionDate);
  const currentDate = new Date();
  
  // Add the initial value at acquisition date
  projectionPoints.push({
    date: new Date(startDate),
    value: parseFloat(initialValue),
    isHistorical: true
  });
  
  // Add historical values from transactions if available
  if (asset.transactions && asset.transactions.length > 0) {
    asset.transactions
      .filter(t => t.transactionType === 'valuation_update')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach(t => {
        projectionPoints.push({
          date: new Date(t.date),
          value: parseFloat(t.valueAfterTransaction),
          isHistorical: true,
          notes: t.notes
        });
      });
  }
  
  // Add current value if it's different from the latest transaction
  const latestValuation = projectionPoints[projectionPoints.length - 1];
  if (!latestValuation || latestValuation.date < currentDate) {
    projectionPoints.push({
      date: new Date(currentDate),
      value: parseFloat(currentValue),
      isHistorical: true,
      isCurrent: true
    });
  }
  
  // Add future projections
  const rate = annualRateOfReturn ? parseFloat(annualRateOfReturn) : 0;
  const depreciationRate = attributes?.depreciationRate ? parseFloat(attributes.depreciationRate) : 0;
  const salvageValue = attributes?.salvageValue ? parseFloat(attributes.salvageValue) : 0;
  const usefulLifeYears = attributes?.usefulLifeYears ? parseFloat(attributes.usefulLifeYears) : 20;
  const depreciationMethod = attributes?.depreciationMethod || 'straight-line';
  
  const intervalYears = intervalMonths / 12;
  const numberOfIntervals = Math.ceil(years / intervalYears);
  
  // Base future projections on current value
  let lastValue = parseFloat(currentValue);
  let lastDate = new Date(currentDate);
  
  for (let i = 1; i <= numberOfIntervals; i++) {
    const projectionDate = new Date(lastDate);
    projectionDate.setMonth(projectionDate.getMonth() + intervalMonths);
    
    let projectedValue;
    const yearsSinceStart = (projectionDate - startDate) / (1000 * 60 * 60 * 24 * 365);
    
    // Different calculation methods based on asset type
    switch (assetType) {
      case 'property':
        // Properties typically appreciate, but can have different patterns based on market
        projectedValue = calculateAppreciation(lastValue, rate || 3, intervalYears);
        break;
        
      case 'stock':
      case 'crypto':
        // Investments can have volatile returns - compounded growth
        projectedValue = calculateAppreciation(lastValue, rate || 7, intervalYears);
        break;
        
      case 'term_deposit':
        // Fixed interest typically
        projectedValue = calculateAppreciation(lastValue, rate || 2, intervalYears, false);
        break;
        
      default:
        // For depreciating assets
        if (depreciationRate > 0) {
          if (depreciationMethod === 'double-declining') {
            projectedValue = calculateDoubleDecliningSalvage(
              initialValue, 
              salvageValue, 
              usefulLifeYears,
              yearsSinceStart
            );
          } else {
            // Default to straight-line
            projectedValue = calculateStraightLineDepreciation(
              initialValue, 
              salvageValue, 
              usefulLifeYears, 
              yearsSinceStart
            );
          }
        } else if (rate > 0) {
          // For appreciating assets
          projectedValue = calculateAppreciation(lastValue, rate, intervalYears);
        } else {
          // No change by default
          projectedValue = lastValue;
        }
    }
    
    projectionPoints.push({
      date: projectionDate,
      value: projectedValue,
      isHistorical: false,
      isProjection: true
    });
    
    lastValue = projectedValue;
    lastDate = projectionDate;
  }
  
  return projectionPoints;
};

export default {
  validateAsset,
  calculateAssetPerformance,
  formatCurrency,
  forecastFutureValue,
  calculateStraightLineDepreciation,
  calculateDoubleDecliningSalvage,
  calculateAppreciation,
  generateValuationProjection
};
