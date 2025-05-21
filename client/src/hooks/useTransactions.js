/**
 * useTransactions - Custom hook for optimized transaction operations
 * 
 * Provides:
 * - Cached and memoized transaction selectors
 * - Debounced and throttled transaction actions
 * - Optimistic update helpers
 * - Data formatting utilities
 */
import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTransactions, 
  fetchTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  batchCreateTransactions,
  importTransactions,
  clearTransactionError
} from '../redux/slices/transactionSlice';

// Debounce utility
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Throttle utility
const useThrottle = (callback, limit) => {
  const lastRun = useRef(0);
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastRun.current >= limit) {
      lastRun.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastRun.current = Date.now();
        callback(...args);
      }, limit - (now - lastRun.current));
    }
  }, [callback, limit]);
};

/**
 * Custom hook for optimized transaction operations
 */
export const useTransactions = () => {
  const dispatch = useDispatch();
  
  // Get transaction state
  const transactions = useSelector(state => state.transactions.transactions);
  const transaction = useSelector(state => state.transactions.transaction);
  const loading = useSelector(state => state.transactions.loading);
  const error = useSelector(state => state.transactions.error);
  const pagination = useSelector(state => ({
    totalCount: state.transactions.totalCount,
    totalPages: state.transactions.totalPages,
    currentPage: state.transactions.currentPage
  }));
  const lastUpdated = useSelector(state => state.transactions.lastUpdated);
  
  // Local state for filters
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    category: '',
    type: '',
    search: ''
  });
  
  // Track if any request is pending
  const pendingRequestRef = useRef(false);
  
  // Debounced fetch transactions
  const debouncedFetchTransactions = useDebounce((page, limit) => {
    dispatch(fetchTransactions({ page, limit, filters }));
  }, 500);
  
  // Throttled fetch for frequent updates (e.g., during scrolling)
  const throttledFetchTransactions = useThrottle((page, limit) => {
    dispatch(fetchTransactions({ page, limit, filters }));
  }, 500);
  
  // Memoized selectors
  
  // Get transactions by category
  const getTransactionsByCategory = useCallback((category) => {
    return transactions.filter(t => t.category === category);
  }, [transactions]);
  
  // Get transactions by date range
  const getTransactionsByDateRange = useCallback((startDate, endDate) => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [transactions]);
  
  // Get transaction totals by category
  const getTotalsByCategory = useMemo(() => {
    const totals = {};
    
    transactions.forEach(t => {
      if (!totals[t.category]) {
        totals[t.category] = 0;
      }
      totals[t.category] += parseFloat(t.amount);
    });
    
    return totals;
  }, [transactions]);
  
  // Get transaction totals by type (income/expense)
  const getTotalsByType = useMemo(() => {
    const totals = {
      income: 0,
      expense: 0
    };
    
    transactions.forEach(t => {
      if (t.type === 'income') {
        totals.income += parseFloat(t.amount);
      } else if (t.type === 'expense') {
        totals.expense += parseFloat(t.amount);
      }
    });
    
    return totals;
  }, [transactions]);
  
  // Actions with optimistic updates
  
  // Handle fetch transactions
  const handleFetchTransactions = useCallback((page = 1, limit = 20) => {
    debouncedFetchTransactions(page, limit);
  }, [debouncedFetchTransactions]);
  
  // Handle fetch transaction by ID
  const handleFetchTransaction = useCallback((id) => {
    dispatch(fetchTransaction(id));
  }, [dispatch]);
  
  // Handle create transaction
  const handleCreateTransaction = useCallback(async (transactionData) => {
    try {
      pendingRequestRef.current = true;
      const resultAction = await dispatch(createTransaction(transactionData));
      pendingRequestRef.current = false;
      
      if (createTransaction.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else {
        return { 
          success: false, 
          error: resultAction.payload || 'Failed to create transaction' 
        };
      }
    } catch (error) {
      pendingRequestRef.current = false;
      return { success: false, error: error.message };
    }
  }, [dispatch]);
  
  // Handle optimistic update transaction
  const handleUpdateTransaction = useCallback(async (id, transactionData, optimistic = true) => {
    try {
      pendingRequestRef.current = true;
      const resultAction = await dispatch(updateTransaction({ 
        id, 
        transactionData,
        optimistic
      }));
      pendingRequestRef.current = false;
      
      if (updateTransaction.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else {
        return { 
          success: false, 
          error: resultAction.payload?.error || 'Failed to update transaction' 
        };
      }
    } catch (error) {
      pendingRequestRef.current = false;
      return { success: false, error: error.message };
    }
  }, [dispatch]);
  
  // Handle optimistic delete transaction
  const handleDeleteTransaction = useCallback(async (id) => {
    try {
      pendingRequestRef.current = true;
      const resultAction = await dispatch(deleteTransaction(id));
      pendingRequestRef.current = false;
      
      if (deleteTransaction.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else {
        return { 
          success: false, 
          error: resultAction.payload?.error || 'Failed to delete transaction' 
        };
      }
    } catch (error) {
      pendingRequestRef.current = false;
      return { success: false, error: error.message };
    }
  }, [dispatch]);
  
  // Handle batch create transactions
  const handleBatchCreateTransactions = useCallback(async (transactionsData) => {
    try {
      pendingRequestRef.current = true;
      const resultAction = await dispatch(batchCreateTransactions(transactionsData));
      pendingRequestRef.current = false;
      
      if (batchCreateTransactions.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else {
        return { 
          success: false, 
          error: resultAction.payload || 'Failed to create batch transactions' 
        };
      }
    } catch (error) {
      pendingRequestRef.current = false;
      return { success: false, error: error.message };
    }
  }, [dispatch]);
  
  // Handle import transactions
  const handleImportTransactions = useCallback(async (formData) => {
    try {
      pendingRequestRef.current = true;
      const resultAction = await dispatch(importTransactions(formData));
      pendingRequestRef.current = false;
      
      if (importTransactions.fulfilled.match(resultAction)) {
        return { success: true, data: resultAction.payload };
      } else {
        return { 
          success: false, 
          error: resultAction.payload || 'Failed to import transactions' 
        };
      }
    } catch (error) {
      pendingRequestRef.current = false;
      return { success: false, error: error.message };
    }
  }, [dispatch]);
  
  // Clear error
  const handleClearError = useCallback(() => {
    dispatch(clearTransactionError());
  }, [dispatch]);
  
  // Update filters
  const handleUpdateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);
  
  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      startDate: null,
      endDate: null,
      category: '',
      type: '',
      search: ''
    });
  }, []);
  
  // Side effect to fetch transactions when filters change
  useEffect(() => {
    handleFetchTransactions(1, 20);
  }, [filters, handleFetchTransactions]);
  
  // Check if loading and clear if needed (safety mechanism)
  useEffect(() => {
    let timeoutId;
    
    if (loading && !pendingRequestRef.current) {
      timeoutId = setTimeout(() => {
        if (loading && !pendingRequestRef.current) {
          // If still loading after 10 seconds but no request is pending
          // something is stuck, so clear the error and reset loading
          handleClearError();
        }
      }, 10000);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, handleClearError]);
  
  return {
    // State
    transactions,
    transaction,
    loading,
    error,
    pagination,
    filters,
    lastUpdated,
    
    // Actions
    fetchTransactions: handleFetchTransactions,
    throttledFetchTransactions,
    fetchTransaction: handleFetchTransaction,
    createTransaction: handleCreateTransaction,
    updateTransaction: handleUpdateTransaction,
    deleteTransaction: handleDeleteTransaction,
    batchCreateTransactions: handleBatchCreateTransactions,
    importTransactions: handleImportTransactions,
    clearError: handleClearError,
    
    // Filter handlers
    updateFilters: handleUpdateFilters,
    clearFilters: handleClearFilters,
    
    // Memoized selectors
    getTransactionsByCategory,
    getTransactionsByDateRange,
    getTotalsByCategory,
    getTotalsByType
  };
};

export default useTransactions;
