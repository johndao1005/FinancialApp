/**
 * Budget Redux Slice
 * 
 * Manages the state for budget-related functionality in the application.
 * Handles fetching, creating, updating, and deleting budget records,
 * as well as tracking budget progress and performance metrics.
 * 
 * This slice includes:
 * - Async thunks for API interactions
 * - Reducers for state management
 * - Selectors for accessing budget data
 * 
 * The state maintains:
 * - List of user budgets
 * - Currently selected budget
 * - Budget progress tracking
 * - Loading and error states
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

/**
 * Initial state for the budget slice
 * 
 * @property {Array} budgets - List of all user budgets
 * @property {Object|null} currentBudget - Currently selected budget details
 * @property {Object|null} budgetProgress - Progress data for the current budget
 * @property {boolean} loading - Indicates if an API request is in progress
 * @property {string|null} error - Error message from the last failed operation
 */
const initialState = {
  budgets: [],         // Array of budget objects
  currentBudget: null, // Current selected budget details
  budgetProgress: null, // Budget spending progress data
  loading: false,      // Loading state for async operations
  error: null          // Error message if any
};

/**
 * Async Thunks for Budget Operations
 */

/**
 * Fetches all budgets for the current user
 * 
 * @returns {Array} List of budget objects
 * @throws Will reject with error message if API call fails
 */
export const fetchBudgets = createAsyncThunk(
  'budget/fetchBudgets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/budgets');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch budgets'
      );
    }
  }
);

/**
 * Fetches a single budget by ID
 * 
 * @param {string} id - Budget ID to fetch
 * @returns {Object} Budget details
 * @throws Will reject with error message if API call fails
 */
export const fetchBudget = createAsyncThunk(
  'budget/fetchBudget',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/budgets/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch budget'
      );
    }
  }
);

/**
 * Fetches progress data for a specific budget
 * 
 * @param {string} id - Budget ID to fetch progress for
 * @returns {Object} Budget progress data including spent amount and percentage
 * @throws Will reject with error message if API call fails
 */
export const fetchBudgetProgress = createAsyncThunk(
  'budget/fetchBudgetProgress',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/budgets/${id}/progress`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch budget progress'
      );
    }
  }
);

export const createBudget = createAsyncThunk(
  'budget/createBudget',
  async (budgetData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/budgets', budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create budget'
      );
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budget/updateBudget',
  async ({ id, budgetData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/budgets/${id}`, budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update budget'
      );
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budget/deleteBudget',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/budgets/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete budget'
      );
    }
  }
);

// Budget slice
const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearCurrentBudget: (state) => {
      state.currentBudget = null;
      state.budgetProgress = null;
    },
    clearBudgetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single budget
      .addCase(fetchBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBudget = action.payload;
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch budget progress
      .addCase(fetchBudgetProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgetProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.budgetProgress = action.payload;
      })
      .addCase(fetchBudgetProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create budget
      .addCase(createBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets.unshift(action.payload);
        state.currentBudget = action.payload;
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update budget
      .addCase(updateBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.map(budget => 
          budget.id === action.payload.id ? action.payload : budget
        );
        state.currentBudget = action.payload;
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete budget
      .addCase(deleteBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
        if (state.currentBudget && state.currentBudget.id === action.payload) {
          state.currentBudget = null;
          state.budgetProgress = null;
        }
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions and reducer
export const { clearCurrentBudget, clearBudgetError } = budgetSlice.actions;
export default budgetSlice.reducer;
