/**
 * Income Prediction Redux Slice
 * 
 * Manages state for income prediction and trend analysis features:
 * - Fetching and generating income predictions
 * - Income trend analysis and visualization
 * - Income source management
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Initial state
const initialState = {
  predictions: [],
  predictionsByMonth: {},
  historicalData: {},
  trends: {
    monthlyIncome: [],
    topSources: [],
    sourceBreakdown: {},
    stats: {}
  },
  sources: [],
  loading: false,
  predictionLoading: false,
  trendLoading: false,
  sourcesLoading: false,
  error: null,
  summary: null
};

// Async thunks
export const fetchIncomePredictions = createAsyncThunk(
  'income/fetchPredictions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/income/predictions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch income predictions');
    }
  }
);

export const generateIncomePredictions = createAsyncThunk(
  'income/generatePredictions',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/income/predictions', data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate income predictions');
    }
  }
);

export const fetchIncomeTrends = createAsyncThunk(
  'income/fetchTrends',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/income/trends', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch income trends');
    }
  }
);

export const fetchIncomeSources = createAsyncThunk(
  'income/fetchSources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/income/sources');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch income sources');
    }
  }
);

export const updatePredictionActuals = createAsyncThunk(
  'income/updatePredictionActuals',
  async ({ predictionId, actualAmount }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/api/income/predictions/${predictionId}/actual`, 
        { actualAmount }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update prediction with actual data');
    }
  }
);

// Slice definition
const incomePredictionSlice = createSlice({
  name: 'incomePrediction',
  initialState,
  reducers: {
    clearPredictionError: (state) => {
      state.error = null;
    },
    resetPredictionState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch predictions
      .addCase(fetchIncomePredictions.pending, (state) => {
        state.predictionLoading = true;
        state.error = null;
      })
      .addCase(fetchIncomePredictions.fulfilled, (state, action) => {
        state.predictionLoading = false;
        state.predictions = action.payload.predictions;
        state.predictionsByMonth = action.payload.predictionsByMonth;
      })
      .addCase(fetchIncomePredictions.rejected, (state, action) => {
        state.predictionLoading = false;
        state.error = action.payload || 'Failed to fetch predictions';
      })
      
      // Generate predictions
      .addCase(generateIncomePredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateIncomePredictions.fulfilled, (state, action) => {
        state.loading = false;
        state.predictions = action.payload.predictions;
        state.historicalData = action.payload.historicalData;
        state.summary = action.payload.summary;
      })
      .addCase(generateIncomePredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to generate predictions';
      })
      
      // Fetch income trends
      .addCase(fetchIncomeTrends.pending, (state) => {
        state.trendLoading = true;
        state.error = null;
      })
      .addCase(fetchIncomeTrends.fulfilled, (state, action) => {
        state.trendLoading = false;
        state.trends.monthlyIncome = action.payload.monthlyIncome;
        state.trends.topSources = action.payload.topSources;
        state.trends.sourceBreakdown = action.payload.sourceBreakdown;
        state.trends.stats = action.payload.stats;
      })
      .addCase(fetchIncomeTrends.rejected, (state, action) => {
        state.trendLoading = false;
        state.error = action.payload || 'Failed to fetch income trends';
      })
      
      // Fetch income sources
      .addCase(fetchIncomeSources.pending, (state) => {
        state.sourcesLoading = true;
        state.error = null;
      })
      .addCase(fetchIncomeSources.fulfilled, (state, action) => {
        state.sourcesLoading = false;
        state.sources = action.payload.sources;
      })
      .addCase(fetchIncomeSources.rejected, (state, action) => {
        state.sourcesLoading = false;
        state.error = action.payload || 'Failed to fetch income sources';
      })
      
      // Update prediction with actual data
      .addCase(updatePredictionActuals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePredictionActuals.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the prediction in the state
        const updatedPrediction = action.payload.prediction;
        const index = state.predictions.findIndex(p => p.id === updatedPrediction.id);
        
        if (index !== -1) {
          state.predictions[index] = updatedPrediction;
          
          // Also update in predictionsByMonth
          const month = new Date(updatedPrediction.predictionForDate)
            .toISOString().substring(0, 7); // YYYY-MM format
          
          if (state.predictionsByMonth[month]) {
            const monthIndex = state.predictionsByMonth[month]
              .findIndex(p => p.id === updatedPrediction.id);
            
            if (monthIndex !== -1) {
              state.predictionsByMonth[month][monthIndex] = updatedPrediction;
            }
          }
        }
      })
      .addCase(updatePredictionActuals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update prediction';
      });
  }
});

// Export actions and reducer
export const { clearPredictionError, resetPredictionState } = incomePredictionSlice.actions;
export default incomePredictionSlice.reducer;
