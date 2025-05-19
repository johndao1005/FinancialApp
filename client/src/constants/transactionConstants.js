/**
 * Transaction Constants
 * 
 * This file centralizes transaction-related constants used throughout the app.
 * By having these values in one place, we maintain consistency and make it
 * easier to update transaction functionality.
 */

/**
 * Transaction types
 */
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
  INVESTMENT: 'investment'
};

/**
 * Transaction status values
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CLEARED: 'cleared',
  CANCELED: 'canceled'
};

/**
 * Transaction sort options
 */
export const TRANSACTION_SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date (Newest First)' },
  { value: 'date_asc', label: 'Date (Oldest First)' },
  { value: 'amount_desc', label: 'Amount (Highest First)' },
  { value: 'amount_asc', label: 'Amount (Lowest First)' },
  { value: 'merchant_asc', label: 'Merchant (A-Z)' },
  { value: 'merchant_desc', label: 'Merchant (Z-A)' }
];

/**
 * Transaction filter periods
 */
export const TRANSACTION_PERIODS = [
  { value: 'all', label: 'All Time' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: '3 Months' },
  { value: 'last6Months', label: '6 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'lastYear', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' }
];

/**
 * Default transaction pagination settings
 */
export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  DEFAULT_PAGE: 1
};

/**
 * Transaction field validation rules
 */
export const TRANSACTION_VALIDATION = {
  AMOUNT: {
    MIN: 0.01,
    MAX: 1000000000 // 1 billion
  },
  DESCRIPTION: {
    MAX_LENGTH: 255
  },
  MERCHANT: {
    MAX_LENGTH: 100
  }
};
