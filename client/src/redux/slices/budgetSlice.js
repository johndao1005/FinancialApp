import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Initial state
const initialState = {
  budgets: [],
  currentBudget: null,
  budgetProgress: null,
  loading: false,
  error: null
};

// Async thunks
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
