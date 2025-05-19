/**
 * App Constants
 * 
 * This file contains application-wide constants like default settings,
 * configuration values, and other shared data.
 */

/**
 * Default application settings
 */
export const DEFAULT_SETTINGS = {
  CURRENCY: 'USD',
  LANGUAGE: 'en',
  THEME: 'light',
  DATE_FORMAT: 'YYYY-MM-DD'
};

/**
 * Supported currencies in the application
 */
export const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'JPY', label: 'JPY (¥)', symbol: '¥' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { value: 'NZD', label: 'NZD (NZ$)', symbol: 'NZ$' }
];

/**
 * Supported languages in the application
 */
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' }
];

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify'
  },
  USER: {
    PROFILE: '/api/users/profile',
    PASSWORD: '/api/users/password'
  },
  TRANSACTIONS: {
    BASE: '/api/transactions',
    UPLOAD: '/api/transactions/upload',
    ANALYTICS: '/api/transactions/analytics'
  },
  CATEGORIES: '/api/categories',
  BUDGETS: '/api/budgets',
  GOALS: '/api/goals'
};

/**
 * Theme settings
 */
export const THEME = {
  PRIMARY_COLOR: '#1677ff',
  BORDER_RADIUS: 6
};
