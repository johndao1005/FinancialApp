import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Helper function to set auth header
const setAuthToken = (token) => {
  if (token) {
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }
  return {};
};

// Initial state
const initialState = {
  transactions: [],
  transaction: null,
  loading: false,
  error: null,
  totalCount: 0,
  totalPages: 0,
  currentPage: 1
};

// Fetch transactions
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async ({ page = 1, limit = 20, filters = {} }, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    
    try {
      let url = `/api/transactions?page=${page}&limit=${limit}`;
      
      // Add filters to URL if provided
      if (filters.startDate && filters.endDate) {
        url += `&startDate=${filters.startDate}&endDate=${filters.endDate}`;
      }
      
      if (filters.category) {
        url += `&category=${filters.category}`;
      }
      
      const response = await axios.get(url, setAuthToken(token));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transactions'
      );
    }
  }
);

// Fetch single transaction
export const fetchTransaction = createAsyncThunk(
  'transactions/fetchTransaction',
  async (id, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get(`/api/transactions/${id}`, setAuthToken(token));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch transaction'
      );
    }
  }
);

// Create new transaction
export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post('/api/transactions', transactionData, setAuthToken(token));
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
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.put(`/api/transactions/${id}`, transactionData, setAuthToken(token));
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
    const token = localStorage.getItem('token');
    
    try {
      await axios.delete(`/api/transactions/${id}`, setAuthToken(token));
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
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post('/api/transactions/import', formData, {
        ...setAuthToken(token),
        headers: {
          ...setAuthToken(token).headers,
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
