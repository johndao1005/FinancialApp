/**
 * Theme Colors and UI Constants
 * 
 * This file centralizes colors and theme-related constants used across
 * the application to maintain visual consistency.
 */

/**
 * Primary color palette
 */
export const PRIMARY_COLORS = {
  MAIN: '#1677ff',
  LIGHT: '#4096ff',
  DARK: '#0958d9',
  CONTRAST: '#ffffff'
};

/**
 * Status color palette
 */
export const STATUS_COLORS = {
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#f5222d',
  INFO: '#1677ff'
};

/**
 * Transaction type colors
 */
export const TRANSACTION_COLORS = {
  INCOME: '#52c41a',
  EXPENSE: '#f5222d',
  TRANSFER: '#1677ff',
  INVESTMENT: '#722ed1'
};

/**
 * Chart color palette
 * Colors chosen for good contrast and visual distinction in charts and graphs
 */
export const CHART_COLORS = [
  '#1677ff', // Blue
  '#52c41a', // Green
  '#f5222d', // Red
  '#faad14', // Yellow
  '#722ed1', // Purple
  '#eb2f96', // Pink
  '#13c2c2', // Cyan
  '#fa8c16', // Orange
  '#a0d911', // Lime
  '#eb2f96', // Magenta
];

/**
 * UI element sizes (in pixels)
 */
export const UI_SIZES = {
  BORDER_RADIUS: 6,
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 16,
  SPACING_LG: 24,
  SPACING_XL: 32,
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 200,
  SIDEBAR_COLLAPSED_WIDTH: 80
};

/**
 * Media query breakpoints
 */
export const BREAKPOINTS = {
  XS: 480,
  SM: 576,
  MD: 768,
  LG: 992,
  XL: 1200,
  XXL: 1600
};
