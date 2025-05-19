/**
 * Goals Constants
 * 
 * This file centralizes financial goals-related constants used throughout the app.
 * By keeping these values in one place, we maintain consistency and make it
 * easier to update goals functionality.
 */

/**
 * Goal types
 */
export const GOAL_TYPES = {
  SAVINGS: 'savings',
  DEBT_PAYMENT: 'debt_payment',
  PURCHASE: 'purchase',
  EMERGENCY_FUND: 'emergency_fund',
  INVESTMENT: 'investment',
  RETIREMENT: 'retirement',
  EDUCATION: 'education',
  TRAVEL: 'travel',
  HOME: 'home',
  OTHER: 'other'
};

/**
 * Goal time frames
 */
export const GOAL_TIME_FRAMES = {
  SHORT_TERM: 'short_term', // Less than 1 year
  MEDIUM_TERM: 'medium_term', // 1-5 years
  LONG_TERM: 'long_term' // More than 5 years
};

/**
 * Goal status values
 */
export const GOAL_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned'
};

/**
 * Goal contribution frequencies
 */
export const CONTRIBUTION_FREQUENCIES = {
  WEEKLY: 'weekly',
  BI_WEEKLY: 'bi_weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUALLY: 'annually',
  AD_HOC: 'ad_hoc'
};

/**
 * Goal progress thresholds for visual feedback (percentages)
 */
export const GOAL_PROGRESS = {
  INITIAL: 33,
  HALFWAY: 50,
  GETTING_CLOSE: 75,
  ALMOST_THERE: 90,
  COMPLETE: 100
};

/**
 * Goal display options
 */
export const GOAL_DISPLAY = {
  VIEW_OPTIONS: [
    { value: 'cards', label: 'Cards' },
    { value: 'list', label: 'List' },
    { value: 'table', label: 'Table' }
  ],
  SORT_OPTIONS: [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'target_date_asc', label: 'Target Date (Soonest First)' },
    { value: 'target_date_desc', label: 'Target Date (Latest First)' },
    { value: 'amount_asc', label: 'Target Amount (Low to High)' },
    { value: 'amount_desc', label: 'Target Amount (High to Low)' },
    { value: 'progress_asc', label: 'Progress (Low to High)' },
    { value: 'progress_desc', label: 'Progress (High to Low)' }
  ],
  FILTER_OPTIONS: [
    { value: 'all', label: 'All Goals' },
    { value: 'active', label: 'Active Goals' },
    { value: 'completed', label: 'Completed Goals' },
    { value: 'paused', label: 'Paused Goals' }
  ]
};

/**
 * Default goal values
 */
export const DEFAULT_GOAL = {
  NAME: 'New Financial Goal',
  TYPE: GOAL_TYPES.SAVINGS,
  STATUS: GOAL_STATUS.ACTIVE,
  TIME_FRAME: GOAL_TIME_FRAMES.MEDIUM_TERM,
  CONTRIBUTION_FREQUENCY: CONTRIBUTION_FREQUENCIES.MONTHLY,
  TARGET_AMOUNT: 1000,
  CURRENT_AMOUNT: 0
};
