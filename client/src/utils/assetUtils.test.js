/**
 * Tests for Asset Utility Functions
 */
import {
  validateAsset,
  calculateAssetPerformance,
  formatCurrency,
  forecastFutureValue,
  calculateStraightLineDepreciation
} from './assetUtils';

describe('Asset Utilities', () => {
  describe('validateAsset', () => {
    it('should validate a complete property asset', () => {
      const assetData = {
        name: 'Primary Residence',
        assetType: 'property',
        initialValue: 500000,
        acquisitionDate: '2020-01-01',
        location: '123 Main St, City, State'
      };
      
      const result = validateAsset(assetData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    it('should validate a complete stock asset', () => {
      const assetData = {
        name: 'Apple Shares',
        assetType: 'stock',
        initialValue: 10000,
        acquisitionDate: '2021-05-15',
        symbol: 'AAPL',
        quantity: 50
      };
      
      const result = validateAsset(assetData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
    
    it('should return errors for missing required fields', () => {
      const assetData = {
        assetType: 'property',
        initialValue: 500000
      };
      
      const result = validateAsset(assetData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('name');
      expect(result.errors).toHaveProperty('acquisitionDate');
    });
    
    it('should validate type-specific fields', () => {
      const assetData = {
        name: 'Apple Shares',
        assetType: 'stock',
        initialValue: 10000,
        acquisitionDate: '2021-05-15',
        // Missing symbol and quantity
      };
      
      const result = validateAsset(assetData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('symbol');
      expect(result.errors).toHaveProperty('quantity');
    });
  });
  
  describe('calculateAssetPerformance', () => {
    it('should calculate performance metrics correctly', () => {
      const asset = {
        initialValue: 100000,
        currentValue: 120000,
        acquisitionDate: new Date(2020, 0, 1).toISOString() // Jan 1, 2020
      };
      
      const oneYearLater = new Date(2021, 0, 1);
      const originalDate = Date;
      
      // Mock the Date constructor to return a fixed date
      global.Date = class extends Date {
        constructor() {
          if (arguments.length === 0) {
            return new originalDate(oneYearLater);
          }
          return new originalDate(...arguments);
        }
      };
      
      const performance = calculateAssetPerformance(asset, []);
      
      // Restore the original Date
      global.Date = originalDate;
      
      expect(performance.totalReturn).toBe(20000);
      expect(performance.totalReturnPercentage).toBe(20);
      expect(Math.round(performance.annualizedReturn)).toBe(20); // Approximately 20% for 1 year
    });
    
    it('should account for contributions and withdrawals', () => {
      const asset = {
        initialValue: 100000,
        currentValue: 130000,
        acquisitionDate: '2020-01-01'
      };
      
      const transactions = [
        { transactionType: 'contribution', amount: 10000 },
        { transactionType: 'withdrawal', amount: 5000 }
      ];
      
      const performance = calculateAssetPerformance(asset, transactions);
      
      // Total Return: 130000 - 100000 = 30000
      expect(performance.totalReturn).toBe(30000);
      
      // Adjusted Total Return: 130000 - 100000 - 10000 + 5000 = 25000
      expect(performance.adjustedTotalReturn).toBe(25000);
      
      expect(performance.contributions).toBe(10000);
      expect(performance.withdrawals).toBe(5000);
    });
  });
  
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(-500.25)).toBe('-$500.25');
    });
    
    it('should use the specified currency', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
    });
  });
  
  describe('forecastFutureValue', () => {
    it('should calculate future value correctly', () => {
      // $10,000 at 5% for 10 years should be approximately $16,289
      const futureValue = forecastFutureValue(10000, 5, 10);
      expect(Math.round(futureValue)).toBe(16289);
      
      // $50,000 at 8% for 20 years should be approximately $233,048
      const futureValue2 = forecastFutureValue(50000, 8, 20);
      expect(Math.round(futureValue2)).toBe(233048);
    });
  });
  
  describe('calculateStraightLineDepreciation', () => {
    it('should calculate depreciation correctly', () => {
      // Asset with initial value $20,000, salvage value $2,000, useful life 10 years
      
      // After 5 years
      const valueAfter5Years = calculateStraightLineDepreciation(20000, 2000, 10, 5);
      expect(valueAfter5Years).toBe(11000); // 20000 - (18000/10)*5
      
      // After 10 years
      const valueAfter10Years = calculateStraightLineDepreciation(20000, 2000, 10, 10);
      expect(valueAfter10Years).toBe(2000); // Equal to salvage value
      
      // After 15 years (beyond useful life)
      const valueAfter15Years = calculateStraightLineDepreciation(20000, 2000, 10, 15);
      expect(valueAfter15Years).toBe(2000); // Still equal to salvage value
    });
  });
});
