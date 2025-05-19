/**
 * Constants index file
 * 
 * This file exports all constants from different constants files to make importing easier.
 * Instead of importing from multiple constants files, components can import from this
 * single entry point.
 * 
 * Example:
 * import { ROUTES, API_ENDPOINTS, PRIMARY_COLORS } from '../constants';
 * 
 * Available Constants Files:
 * - navConstants.js: Navigation routes, paths, and menu items
 * - appConstants.js: App-wide settings, supported currencies, languages
 * - apiConstants.js: API endpoint paths for backend communication
 * - themeConstants.js: UI design constants like colors, sizes, breakpoints
 * - transactionConstants.js: Transaction types, status values, sorting options
 * - budgetConstants.js: Budget periods, types, status values
 * - goalConstants.js: Financial goal types, status values, time frames
 */

// Export all constants
export * from './navConstants';
export * from './appConstants';
export * from './apiConstants';
export * from './themeConstants';
export * from './transactionConstants';
export * from './budgetConstants';
export * from './goalConstants';
