/**
 * Budget Constants
 * 
 * This file centralizes budget-related constants used throughout the app.
 * Keeping these values in one place makes it easier to maintain consistency
 * and update budget functionality.
 */

/**
 * Budget periods
 */
export const BUDGET_PERIODS = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
};

/**
 * Budget status values
 */
export const BUDGET_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
  DRAFT: 'draft'
};

/**
 * Budget type categories
 */
export const BUDGET_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
  SAVINGS: 'savings',
  INVESTMENT: 'investment'
};

/**
 * Budget progress thresholds for visual feedback (percentages)
 */
export const BUDGET_PROGRESS = {
  WARNING: 80,
  DANGER: 100,
  SUCCESS: 100
};

/**
 * Budget display options
 */
export const BUDGET_DISPLAY = {
  VIEW_OPTIONS: [
    { value: 'cards', label: 'Cards' },
    { value: 'list', label: 'List' },
    { value: 'table', label: 'Table' }
  ],
  SORT_OPTIONS: [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'amount_asc', label: 'Budget Amount (Low to High)' },
    { value: 'amount_desc', label: 'Budget Amount (High to Low)' },
    { value: 'spent_asc', label: 'Spent Amount (Low to High)' },
    { value: 'spent_desc', label: 'Spent Amount (High to Low)' },
    { value: 'progress_asc', label: 'Progress (Low to High)' },
    { value: 'progress_desc', label: 'Progress (High to Low)' }
  ],
  FILTER_OPTIONS: [
    { value: 'all', label: 'All Budgets' },
    { value: 'active', label: 'Active Budgets' },
    { value: 'completed', label: 'Completed Budgets' },
    { value: 'archived', label: 'Archived Budgets' }
  ]
};

/**
 * Default budget values
 */
export const DEFAULT_BUDGET = {
  NAME: 'New Budget',
  PERIOD: BUDGET_PERIODS.MONTHLY,
  STATUS: BUDGET_STATUS.ACTIVE,
  TYPE: BUDGET_TYPES.EXPENSE,
  AMOUNT: 0
};
