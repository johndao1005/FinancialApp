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
 * @param {string} [transactionData.description] - Transaction description (optional)
 * @param {string|Object} transactionData.date - Transaction date (string in YYYY-MM-DD format or moment object)
 * @param {string} [transactionData.categoryId] - Category ID (optional)
 * @param {string} [transactionData.merchant] - Merchant name (optional)
 * @param {string} [transactionData.notes] - Additional notes (optional)
 * @param {boolean} [transactionData.isRecurring] - Whether this is a recurring transaction (optional)
 * @param {string} [transactionData.recurringFrequency] - Frequency of recurring payment (daily, weekly, biweekly, monthly, quarterly, annually) (optional)
 * @param {string|Object} [transactionData.recurringEndDate] - End date for recurring payments (string in YYYY-MM-DD format or moment object) (optional)
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
 *   categoryId: 'entertainment-category-id',
 *   isRecurring: true,
 *   recurringFrequency: 'monthly', 
 *   recurringEndDate: moment().add(1, 'year')
 * });
 */
export const quickAddTransaction = async (transactionData) => {
  // Format the dates if they're moment objects
  const formattedData = {
    ...transactionData,
    date: transactionData.date instanceof moment 
      ? transactionData.date.format('YYYY-MM-DD') 
      : transactionData.date
  };
  
  // Format recurring end date if it exists
  if (formattedData.isRecurring && formattedData.recurringEndDate) {
    formattedData.recurringEndDate = formattedData.recurringEndDate instanceof moment
      ? formattedData.recurringEndDate.format('YYYY-MM-DD')
      : formattedData.recurringEndDate;
  }
  
  // Make sure recurring fields are only included when isRecurring is true
  if (!formattedData.isRecurring) {
    delete formattedData.recurringFrequency;
    delete formattedData.recurringEndDate;
  }
  
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
