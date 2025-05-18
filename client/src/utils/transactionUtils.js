/**
 * Utility functions for transaction operations
 */
import { createTransaction } from '../redux/slices/transactionSlice';
import { store } from '../redux/store';
import moment from 'moment';

/**
 * Quick add a new transaction
 * @param {Object} transactionData - Transaction data object
 * @param {number|string} transactionData.amount - Transaction amount (negative for expenses, positive for income)
 * @param {string} transactionData.description - Transaction description
 * @param {string|Object} transactionData.date - Transaction date (string in YYYY-MM-DD format or moment object)
 * @param {string} transactionData.categoryId - Category ID
 * @param {string} [transactionData.merchant] - Merchant name (optional)
 * @param {string} [transactionData.notes] - Additional notes (optional)
 * @returns {Promise} - Promise that resolves when transaction is added
 * 
 * @example
 * // Quick add a transaction
 * import { quickAddTransaction } from '../utils/transactionUtils';
 * 
 * // Add an expense
 * quickAddTransaction({
 *   amount: -25.99,
 *   description: 'Lunch',
 *   date: '2025-05-18',
 *   categoryId: 'food-category-id',
 *   merchant: 'Restaurant Name'
 * })
 *   .then(() => console.log('Transaction added successfully'))
 *   .catch(error => console.error('Failed to add transaction:', error));
 * 
 * // Add income
 * quickAddTransaction({
 *   amount: 1000,
 *   description: 'Salary',
 *   date: moment(),
 *   categoryId: 'income-category-id',
 * });
 */
export const quickAddTransaction = async (transactionData) => {
  // Format the date if it's a moment object
  const formattedData = {
    ...transactionData,
    date: transactionData.date instanceof moment 
      ? transactionData.date.format('YYYY-MM-DD') 
      : transactionData.date
  };
  
  // Use the Redux store directly
  return store.dispatch(createTransaction(formattedData)).unwrap();
};

/**
 * Quick add expense (with negative amount)
 * @param {Object} expenseData - Expense data object
 * @returns {Promise} - Promise that resolves when expense is added
 */
export const quickAddExpense = async (expenseData) => {
  // Make sure amount is negative
  const amount = parseFloat(expenseData.amount);
  return quickAddTransaction({
    ...expenseData,
    amount: amount > 0 ? -amount : amount
  });
};

/**
 * Quick add income (with positive amount)
 * @param {Object} incomeData - Income data object
 * @returns {Promise} - Promise that resolves when income is added
 */
export const quickAddIncome = async (incomeData) => {
  // Make sure amount is positive
  const amount = parseFloat(incomeData.amount);
  return quickAddTransaction({
    ...incomeData,
    amount: amount < 0 ? Math.abs(amount) : amount
  });
};
