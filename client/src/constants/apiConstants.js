/**
 * API Endpoint Constants
 * 
 * This file centralizes all API endpoint paths used in the application.
 * By keeping these in one place, we can easily update endpoint URLs
 * without having to search through multiple files.
 */

/**
 * Base API path
 */
export const API_BASE = '/api';

/**
 * Authentication endpoints
 */
export const AUTH_API = {
  LOGIN: `${API_BASE}/auth/login`,
  REGISTER: `${API_BASE}/auth/register`,
  LOGOUT: `${API_BASE}/auth/logout`,
  VERIFY: `${API_BASE}/auth/verify`
};

/**
 * User endpoints
 */
export const USER_API = {
  PROFILE: `${API_BASE}/users/profile`,
  PASSWORD: `${API_BASE}/users/password`
};

/**
 * Transaction endpoints
 */
export const TRANSACTION_API = {
  BASE: `${API_BASE}/transactions`,
  BY_ID: (id) => `${API_BASE}/transactions/${id}`,
  UPLOAD: `${API_BASE}/transactions/upload`,
  ANALYTICS: `${API_BASE}/transactions/analytics`,
  BY_CATEGORY: `${API_BASE}/transactions/by-category`,
  BY_DATE_RANGE: `${API_BASE}/transactions/by-date-range`
};

/**
 * Category endpoints
 */
export const CATEGORY_API = {
  BASE: `${API_BASE}/categories`,
  BY_ID: (id) => `${API_BASE}/categories/${id}`,
  USER_CATEGORIES: `${API_BASE}/categories/user`
};

/**
 * Budget endpoints
 */
export const BUDGET_API = {
  BASE: `${API_BASE}/budgets`,
  BY_ID: (id) => `${API_BASE}/budgets/${id}`,
  ACTIVE: `${API_BASE}/budgets/active`
};

/**
 * Goal endpoints
 */
export const GOAL_API = {
  BASE: `${API_BASE}/goals`,
  BY_ID: (id) => `${API_BASE}/goals/${id}`,
  CONTRIBUTIONS: (goalId) => `${API_BASE}/goals/${goalId}/contributions`,
  ADD_CONTRIBUTION: (goalId) => `${API_BASE}/goals/${goalId}/contribute`
};

/**
 * Deprecated: API_ENDPOINTS (use the more specific constants above)
 * Kept for backward compatibility
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    VERIFY: `${API_BASE}/auth/verify`
  },
  USER: {
    PROFILE: `${API_BASE}/users/profile`,
    PASSWORD: `${API_BASE}/users/password`
  },
  TRANSACTIONS: {
    BASE: `${API_BASE}/transactions`,
    UPLOAD: `${API_BASE}/transactions/upload`,
    ANALYTICS: `${API_BASE}/transactions/analytics`
  },
  CATEGORIES: `${API_BASE}/categories`,
  BUDGETS: `${API_BASE}/budgets`,
  GOALS: `${API_BASE}/goals`
};
