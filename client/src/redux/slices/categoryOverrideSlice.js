/**
 * CategoryOverride Redux Slice
 * 
 * Manages the state for user category override rules in the application.
 * 
 * Key features:
 * - Creating and managing category override rules
 * - Applying category rules to transactions
 * - Retrieving user's category rules
 * - Auto-generating rules from transaction patterns
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Initial state
const initialState = {
  categoryOverrides: [],
  loading: false,
  error: null,
  lastApplyResult: null,
  generatedRules: []
};

// Fetch user's category overrides
export const fetchCategoryOverrides = createAsyncThunk(
  'categoryOverride/fetchOverrides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/category-overrides');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch category rules'
      );
    }
  }
);

// Create a new category override rule
export const createCategoryOverride = createAsyncThunk(
  'categoryOverride/createOverride',
  async (overrideData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/category-overrides', overrideData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create category rule'
      );
    }
  }
);

// Apply category rules to transactions
export const applyCategoryRules = createAsyncThunk(
  'categoryOverride/applyRules',
  async ({ transactionIds, skipExistingCategories = true }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/category-overrides/apply', { 
        transactionIds,
        skipExistingCategories
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to apply category rules'
      );
    }
  }
);

// Auto-generate category rules from transaction patterns
export const generateRulesFromPatterns = createAsyncThunk(
  'categoryOverride/generateRules',
  async (options = {}, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/category-overrides/generate-from-patterns', options);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to generate category rules'
      );
    }
  }
);

// Update a category override rule
export const updateCategoryOverride = createAsyncThunk(
  'categoryOverride/updateOverride',
  async ({ id, overrideData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/category-overrides/${id}`, overrideData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update category rule'
      );
    }
  }
);

// Delete a category override rule
export const deleteCategoryOverride = createAsyncThunk(
  'categoryOverride/deleteOverride',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/category-overrides/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete category rule'
      );
    }
  }
);

// Category override slice
const categoryOverrideSlice = createSlice({
  name: 'categoryOverride',
  initialState,
  reducers: {
    clearCategoryOverrideError: (state) => {
      state.error = null;
    },
    clearApplyResult: (state) => {
      state.lastApplyResult = null;
    },
    clearGeneratedRules: (state) => {
      state.generatedRules = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch category overrides
      .addCase(fetchCategoryOverrides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryOverrides.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryOverrides = action.payload;
      })
      .addCase(fetchCategoryOverrides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create category override
      .addCase(createCategoryOverride.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategoryOverride.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryOverrides = [action.payload, ...state.categoryOverrides];
      })
      .addCase(createCategoryOverride.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Apply category rules
      .addCase(applyCategoryRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCategoryRules.fulfilled, (state, action) => {
        state.loading = false;
        state.lastApplyResult = action.payload;
      })
      .addCase(applyCategoryRules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Generate category rules
      .addCase(generateRulesFromPatterns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateRulesFromPatterns.fulfilled, (state, action) => {
        state.loading = false;
        state.generatedRules = action.payload.createdRules;
        state.categoryOverrides = [...action.payload.createdRules.map(rule => ({
          id: rule.id,
          categoryId: rule.categoryId,
          pattern: rule.pattern || '',
          amount: rule.amount || null,
          matchField: rule.matchField,
          matchType: rule.matchType || 'contains',
          matchPriority: 'medium',
          isActive: true,
          useCount: 0,
          createdAt: new Date().toISOString()
        })), ...state.categoryOverrides];
      })
      .addCase(generateRulesFromPatterns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update category override
      .addCase(updateCategoryOverride.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategoryOverride.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryOverrides = state.categoryOverrides.map(override => 
          override.id === action.payload.id ? action.payload : override
        );
      })
      .addCase(updateCategoryOverride.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete category override
      .addCase(deleteCategoryOverride.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategoryOverride.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryOverrides = state.categoryOverrides.filter(
          override => override.id !== action.payload
        );
      })
      .addCase(deleteCategoryOverride.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCategoryOverrideError, clearApplyResult, clearGeneratedRules } = categoryOverrideSlice.actions;
export default categoryOverrideSlice.reducer;