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
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Initial state
const initialState = {
  transactions: [],     // List of transactions
  transaction: null,    // Single transaction for viewing/editing
  loading: false,       // Loading state for async operations
  error: null,          // Error messages if any
  totalCount: 0,        // Total count of all transactions for pagination
  totalPages: 0,        // Total number of pages
  currentPage: 1        // Current active page
};

/**
 * Fetch transactions with filters
 * 
 * Async thunk to retrieve transactions with:
 * - Pagination support (page, limit)
 * - Date range filtering
 * - Category filtering
 * 
 * @param {Object} params - Parameters for fetching transactions
 * @param {number} params.page - Page number (defaults to 1)
 * @param {number} params.limit - Results per page (defaults to 20)
 * @param {Object} params.filters - Filter criteria
 * @returns {Object} Transaction list, pagination info
 */
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    try {
      let url = `/api/transactions?page=${page}&limit=${limit}`;
      
      // Add filters to URL if provided
      if (filters.startDate && filters.endDate) {
        url += `&startDate=${filters.startDate}&endDate=${filters.endDate}`;
      }
      
      if (filters.category) {
        url += `&category=${filters.category}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
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
      const response = await axios.get(`/api/transactions/${id}`);
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
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/transactions', transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create transaction'
      );
    }
  }
);

// Update transaction
export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, transactionData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/transactions/${id}`, transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update transaction'
      );
    }
  }
);

// Delete transaction
export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/transactions/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete transaction'
      );
    }
  }
);

// Import transactions from CSV
export const importTransactions = createAsyncThunk(
  'transactions/importTransactions',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/transactions/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
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
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transaction = action.payload;
        state.transactions = state.transactions.map(transaction => 
          transaction.id === action.payload.id ? action.payload : transaction
        );
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter(
          transaction => transaction.id !== action.payload
        );
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
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
      })
      .addCase(importTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearTransactionError, clearCurrentTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
