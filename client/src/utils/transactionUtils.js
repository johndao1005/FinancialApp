/**
 * Transaction Utility Functions
 * 
 * This module provides utility functions for handling transaction operations
 * throughout the application. These helpers simplify common transaction tasks
 * like creating transactions, handling recurring transactions, and formatting
 * transaction data.
 * 
 * Key features:
 * - Simplified transaction creation
 * - Dedicated helpers for expenses and income
 * - Date formatting for transactions
 * - Recurring transaction support
 * - Redux store integration
 */
import { createTransaction } from '../redux/slices/transactionSlice';
import { store } from '../redux/store';
import dayjs from 'dayjs';

/**
 * Creates and dispatches a new transaction with simplified formatting.
 * 
 * This function handles proper formatting of transaction data before
 * dispatching to the Redux store. It automatically converts moment objects
 * to properly formatted date strings and ensures recurring transaction
 * fields are handled correctly.
 *  * @param {Object} transactionData - Transaction data object
 * @param {number|string} transactionData.amount - Transaction amount (negative for expenses, positive for income)
 * @param {string} [transactionData.description] - Transaction description (optional)
 * @param {string|Object} transactionData.date - Transaction date (string in YYYY-MM-DD format or dayjs object)
 * @param {string} [transactionData.categoryId] - Category ID (optional)
 * @param {string} [transactionData.merchant] - Merchant name (optional)
 * @param {string} [transactionData.notes] - Additional notes (optional)
 * @param {boolean} [transactionData.isRecurring] - Whether this is a recurring transaction (optional)
 * @param {string} [transactionData.recurringFrequency] - Frequency of recurring payment (daily, weekly, biweekly, monthly, quarterly, annually) (optional)
 * @param {string|Object} [transactionData.recurringEndDate] - End date for recurring payments (string in YYYY-MM-DD format or dayjs object) (optional)
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
 * // Add recurring payment
 * quickAddTransaction({
 *   amount: -9.99,
 *   description: 'Monthly subscription',
 *   date: moment(),
 *   categoryId: 'entertainment-category-id', *   isRecurring: true,
 *   recurringFrequency: 'monthly', 
 *   recurringEndDate: dayjs().add(1, 'year')
 * });
 */
export const quickAddTransaction = async (transactionData) => {
  // Format the dates if they're dayjs objects
  const formattedData = {
    ...transactionData,
    // Convert dayjs date object to YYYY-MM-DD string format if needed
    date: transactionData.date && typeof transactionData.date.format === 'function'
      ? transactionData.date.format('YYYY-MM-DD') 
      : transactionData.date
  };
  
  // Format recurring end date if it exists
  if (formattedData.isRecurring && formattedData.recurringEndDate) {
    formattedData.recurringEndDate = formattedData.recurringEndDate && typeof formattedData.recurringEndDate.format === 'function'
      ? formattedData.recurringEndDate.format('YYYY-MM-DD')
      : formattedData.recurringEndDate;
  }
  
  // Make sure recurring fields are only included when isRecurring is true
  if (!formattedData.isRecurring) {
    delete formattedData.recurringFrequency;
    delete formattedData.recurringEndDate;
  }
  
  // Dispatch the action to Redux store and return the unwrapped promise
  return store.dispatch(createTransaction(formattedData)).unwrap();
};

/**
 * Specialized helper for quickly adding expense transactions.
 * 
 * Ensures the transaction amount is negative to represent an expense.
 * This is a convenience wrapper around quickAddTransaction that guarantees
 * the amount is properly formatted as an expense.
 * 
 * @param {Object} expenseData - Expense data object
 * @returns {Promise} - Promise that resolves when expense is added
 */
export const quickAddExpense = async (expenseData) => {
  // Make sure amount is negative (expenses are represented by negative values)
  const amount = parseFloat(expenseData.amount);
  return quickAddTransaction({
    ...expenseData,
    amount: amount > 0 ? -amount : amount
  });
};

/**
 * Specialized helper for quickly adding income transactions.
 * 
 * Ensures the transaction amount is positive to represent income.
 * This is a convenience wrapper around quickAddTransaction that guarantees
 * the amount is properly formatted as income.
 * 
 * @param {Object} incomeData - Income data object
 * @returns {Promise} - Promise that resolves when income is added
 */
export const quickAddIncome = async (incomeData) => {
  // Make sure amount is positive (income is represented by positive values)
  const amount = parseFloat(incomeData.amount);
  return quickAddTransaction({
    ...incomeData,
    amount: amount < 0 ? Math.abs(amount) : amount
  });
};
