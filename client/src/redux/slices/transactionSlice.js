/**
 * Transaction Slice
 * 
 * Redux Toolkit slice for managing transaction state and operations.
 * Provides async thunks for:
 * - Fetching transactions with filtering and pagination
 * - Getting individual transaction details 
 * - Creating new transactions (one-time and recurring)
 * - Updating existing transactions
 * - Deleting transactions
 * - Importing transactions from CSV files
 * - Batch operations for improved performance
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios, { clearCache } from '../../utils/axios';

// Debounce settings for API calls
const DEBOUNCE_DELAY = 500; // ms
let fetchDebounceTimeout = null;
let activeRequests = {}; // Track active API requests

// Initial state
const initialState = {
  transactions: [],     // List of transactions
  transaction: null,    // Single transaction for viewing/editing
  loading: false,       // Loading state for async operations
  error: null,          // Error messages if any
  totalCount: 0,        // Total count of all transactions for pagination
  totalPages: 0,        // Total number of pages
  currentPage: 1,       // Current active page
  lastUpdated: null,    // Timestamp of last update for cache invalidation
  optimisticUpdates: [] // Track ongoing optimistic updates
};

/**
 * Create a cancellable request identifier
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Request parameters
 * @returns {string} Request identifier
 */
const createRequestId = (endpoint, params = {}) => {
  return `${endpoint}_${JSON.stringify(params)}`;
};

/**
 * Cancel any ongoing request with the same identifier
 * @param {string} requestId - Request identifier to cancel
 */
const cancelPreviousRequest = (requestId) => {
  if (activeRequests[requestId]) {
    activeRequests[requestId].abort();
    delete activeRequests[requestId];
  }
};

/**
 * Fetch transactions with filters
 * 
 * Async thunk to retrieve transactions with:
 * - Pagination support (page, limit)
 * - Date range filtering
 * - Category filtering
 * - Debouncing for frequent calls
 * - Request cancellation for redundant calls
 * 
 * @param {Object} params - Parameters for fetching transactions
 * @param {number} params.page - Page number (defaults to 1)
 * @param {number} params.limit - Results per page (defaults to 20)
 * @param {Object} params.filters - Filter criteria
 * @returns {Object} Transaction list, pagination info
 */
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue, signal }) => {
    try {
      // Clear previous debounce timer if it exists
      if (fetchDebounceTimeout) {
        clearTimeout(fetchDebounceTimeout);
      }
      
      // Create request identifier for this specific request
      const requestId = createRequestId('/api/transactions', { page, limit, filters });
      
      // Cancel any ongoing request with the same parameters
      cancelPreviousRequest(requestId);
      
      // Create abort controller for this request
      const controller = new AbortController();
      activeRequests[requestId] = controller;
      
      // Create a new promise that will resolve after the debounce delay
      return new Promise((resolve, reject) => {
        fetchDebounceTimeout = setTimeout(async () => {
          try {
            // Check if the request was cancelled
            if (signal.aborted) {
              return reject('Request was cancelled');
            }
            
            let url = `/api/transactions?page=${page}&limit=${limit}`;
            
            // Add filters to URL if provided
            if (filters.startDate && filters.endDate) {
              url += `&startDate=${filters.startDate}&endDate=${filters.endDate}`;
            }
            if (filters.category) {
              url += `&category=${filters.category}`;
            }
            if (filters.type) {
              url += `&type=${filters.type}`;
            }
            if (filters.search) {
              url += `&search=${encodeURIComponent(filters.search)}`;
            }
            
            // Enable caching for this request
            const response = await axios.get(url, { 
              cache: true,
              signal: controller.signal
            });
            
            // Remove from active requests
            delete activeRequests[requestId];
            
            resolve(response.data);
          } catch (error) {
            // Don't reject if this was a cancellation
            if (error.name === 'AbortError' || error.name === 'CanceledError') {
              return reject({ cancelled: true });
            }
            
            reject(rejectWithValue(
              error.response?.data?.message || 'Failed to fetch transactions'
            ));
          }
        }, DEBOUNCE_DELAY);
      });
    } catch (error) {
      // Skip error handling for cancelled requests
      if (error.cancelled) {
        return rejectWithValue({ cancelled: true });
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transactions'
      );
    }
  }
);

/**
 * Fetch a single transaction by ID
 * 
 * Used for viewing or editing a specific transaction's details
 * 
 * @param {string} id - ID of the transaction to fetch
 * @returns {Object} Transaction data
 */
export const fetchTransaction = createAsyncThunk(
  'transactions/fetchTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/transactions/${id}`, { cache: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transaction'
      );
    }
  }
);

/**
 * Create a new transaction
 * 
 * Handles creating both one-time and recurring transactions
 * with all required properties
 * 
 * @param {Object} transactionData - New transaction data
 * @returns {Object} Created transaction
 */
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post('/api/transactions', transactionData);
      
      // Invalidate cache for transaction list after creating a new one
      clearCache('/api/transactions');
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create transaction'
      );
    }
  }
);

/**
 * Update an existing transaction
 * 
 * Handles optimistic updates for better UX and invalidates
 * related caches after successful update
 * 
 * @param {Object} params - Update parameters
 * @param {string} params.id - ID of transaction to update
 * @param {Object} params.transactionData - Updated transaction data
 * @returns {Object} Updated transaction
 */
export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transactionData }, { rejectWithValue, getState }) => {
    try {
      // Generate optimistic update ID for tracking
      const optimisticId = Date.now().toString();
      
      // Get the current transaction for rollback if needed
      const { transactions } = getState().transactions;
      const originalTransaction = transactions.find(t => t.id === id) || null;
      
      // Create optimistic response based on current data and updates
      const optimisticResponse = {
        ...originalTransaction,
        ...transactionData,
        id,
        _optimistic: true,
        _optimisticId: optimisticId
      };
      
      try {
        const response = await axios.put(`/api/transactions/${id}`, transactionData);
        
        // Invalidate caches after successful update
        clearCache(`/api/transactions/${id}`);
        clearCache('/api/transactions');
        
        return {
          ...response.data,
          _optimisticId: optimisticId
        };
      } catch (error) {
        // Return original data and error for rollback
        return rejectWithValue({
          error: error.response?.data?.message || 'Failed to update transaction',
          originalTransaction,
          optimisticId
        });
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to process transaction update'
      );
    }
  }
);

/**
 * Delete a transaction
 * 
 * Implements optimistic deletion with rollback capability and
 * invalidates caches after successful deletion
 * 
 * @param {string} id - ID of transaction to delete
 * @returns {Object} Deleted transaction ID and metadata
 */
export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue, getState }) => {
    try {
      // Generate optimistic deletion ID
      const optimisticId = Date.now().toString();
      
      // Get the current transaction for rollback if needed
      const { transactions } = getState().transactions;
      const originalTransaction = transactions.find(t => t.id === id) || null;
      
      try {
        await axios.delete(`/api/transactions/${id}`);
        
        // Invalidate caches after successful deletion
        clearCache(`/api/transactions/${id}`);
        clearCache('/api/transactions');
        
        return {
          id,
          optimisticId
        };
      } catch (error) {
        // Return original data and error for rollback
        return rejectWithValue({
          error: error.response?.data?.message || 'Failed to delete transaction',
          originalTransaction,
          optimisticId
        });
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to process transaction deletion'
      );
    }
  }
);

/**
 * Batch create multiple transactions at once
 * 
 * More efficient than making multiple individual API calls
 * 
 * @param {Array} transactions - Array of transaction objects to create
 * @returns {Array} Created transactions
 */
export const batchCreateTransactions = createAsyncThunk(
  'transactions/batchCreateTransactions',
  async (transactions, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/transactions/batch', { transactions });
      
      // Invalidate transaction list cache
      clearCache('/api/transactions');
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create batch transactions'
      );
    }
  }
);

/**
 * Import transactions from CSV
 * 
 * @param {FormData} formData - Form data with CSV file
 * @returns {Object} Import results
 */
export const importTransactions = createAsyncThunk(
  'transactions/importTransactions',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/transactions/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Invalidate transaction list cache after import
      clearCache('/api/transactions');
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to import transactions'
      );
    }
  }
);

// Transaction slice
const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactionError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.transaction = null;
    },
    // Add an optimistic update to the state
    addOptimisticUpdate: (state, action) => {
      state.optimisticUpdates.push(action.payload);
    },
    // Remove an optimistic update from the state
    removeOptimisticUpdate: (state, action) => {
      state.optimisticUpdates = state.optimisticUpdates.filter(
        update => update.optimisticId !== action.payload
      );
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        // Don't mark as error if it was just a cancelled request
        if (action.payload?.cancelled) {
          state.loading = false;
          return;
        }
        
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single transaction
      .addCase(fetchTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload;
      })
      .addCase(fetchTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = [action.payload, ...state.transactions];
        state.lastUpdated = Date.now();
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update transaction - with optimistic updates
      .addCase(updateTransaction.pending, (state, action) => {
        // Don't set full loading state for optimistic updates
        state.error = null;
        
        // If we have an optimistic update, apply it immediately
        if (action.meta.arg.optimistic) {
          const { id, transactionData, optimisticId } = action.meta.arg;
          
          // Find the transaction to update
          const index = state.transactions.findIndex(t => t.id === id);
          
          if (index !== -1) {
            // Save original for potential rollback
            const original = { ...state.transactions[index] };
            state.optimisticUpdates.push({
              type: 'update',
              id,
              original,
              optimisticId
            });
            
            // Apply optimistic update
            state.transactions[index] = {
              ...state.transactions[index],
              ...transactionData,
              _optimistic: true
            };
          }
        } else {
          state.loading = true;
        }
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove optimistic flag
        const { _optimisticId, ...transactionData } = action.payload;
        
        // Update in the list and single view
        if (state.transaction?.id === transactionData.id) {
          state.transaction = transactionData;
        }
        
        state.transactions = state.transactions.map(transaction => 
          transaction.id === transactionData.id ? transactionData : transaction
        );
        
        // Remove from optimistic updates
        if (_optimisticId) {
          state.optimisticUpdates = state.optimisticUpdates.filter(
            update => update.optimisticId !== _optimisticId
          );
        }
        
        state.lastUpdated = Date.now();
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        
        // Handle rollback for optimistic updates
        if (action.payload?.optimisticId) {
          const { originalTransaction, optimisticId } = action.payload;
          
          // Find the optimistic update to roll back
          const updateIndex = state.optimisticUpdates.findIndex(
            update => update.optimisticId === optimisticId
          );
          
          if (updateIndex !== -1) {
            const update = state.optimisticUpdates[updateIndex];
            
            // Restore original data
            if (update.type === 'update' && originalTransaction) {
              state.transactions = state.transactions.map(t => 
                t.id === originalTransaction.id ? originalTransaction : t
              );
            }
            
            // Remove from optimistic updates
            state.optimisticUpdates.splice(updateIndex, 1);
          }
        }
        
        state.error = action.payload?.error || action.payload;
      })
      
      // Delete transaction - with optimistic updates
      .addCase(deleteTransaction.pending, (state, action) => {
        // Create optimistic update immediately
        const id = action.meta.arg;
        const optimisticId = Date.now().toString();
        
        // Find the transaction to delete
        const index = state.transactions.findIndex(t => t.id === id);
        
        if (index !== -1) {
          // Save original for potential rollback
          const original = { ...state.transactions[index] };
          state.optimisticUpdates.push({
            type: 'delete',
            id,
            original,
            optimisticId
          });
          
          // Apply optimistic deletion
          state.transactions = state.transactions.filter(t => t.id !== id);
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove from optimistic updates
        const { id, optimisticId } = action.payload;
        
        state.optimisticUpdates = state.optimisticUpdates.filter(
          update => update.optimisticId !== optimisticId
        );
        
        // Handle case where transaction is open in single view
        if (state.transaction?.id === id) {
          state.transaction = null;
        }
        
        state.lastUpdated = Date.now();
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        
        // Handle rollback for optimistic updates
        if (action.payload?.optimisticId) {
          const { originalTransaction, optimisticId } = action.payload;
          
          // Find the optimistic update to roll back
          const updateIndex = state.optimisticUpdates.findIndex(
            update => update.optimisticId === optimisticId
          );
          
          if (updateIndex !== -1) {
            const update = state.optimisticUpdates[updateIndex];
            
            // Restore original data for deletion
            if (update.type === 'delete' && originalTransaction) {
              state.transactions = [...state.transactions, originalTransaction];
            }
            
            // Remove from optimistic updates
            state.optimisticUpdates.splice(updateIndex, 1);
          }
        }
        
        state.error = action.payload?.error || action.payload;
      })
      
      // Batch create transactions
      .addCase(batchCreateTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchCreateTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = [...action.payload, ...state.transactions];
        state.lastUpdated = Date.now();
      })
      .addCase(batchCreateTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Import transactions
      .addCase(importTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = [...action.payload.transactions, ...state.transactions];
        state.lastUpdated = Date.now();
      })
      .addCase(importTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  clearTransactionError, 
  clearCurrentTransaction,
  addOptimisticUpdate,
  removeOptimisticUpdate
} = transactionSlice.actions;

export default transactionSlice.reducer;
