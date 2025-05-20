/**
 * Asset Management Redux Slice
 * 
 * Manages state for the asset management feature:
 * - Asset CRUD operations
 * - Asset transaction recording
 * - Net worth tracking
 * - Portfolio performance metrics
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// Initial state
const initialState = {
  assets: [],
  assetsByType: {},
  currentAsset: null,
  transactions: [],
  netWorth: {
    current: 0,
    historical: [],
    allocation: {}
  },
  portfolio: {
    performance: null,
    breakdown: {},
    returns: {}
  },
  assetHistory: {
    valueHistory: [],
    performance: null
  },
  loading: false,
  transactionLoading: false,
  netWorthLoading: false,
  portfolioLoading: false,
  historyLoading: false,
  error: null,
  success: null
};

// Async thunks for asset management
export const fetchAssets = createAsyncThunk(
  'assets/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/assets', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assets');
    }
  }
);

export const fetchAssetById = createAsyncThunk(
  'assets/fetchById',
  async (assetId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/assets/${assetId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset details');
    }
  }
);

export const createAsset = createAsyncThunk(
  'assets/create',
  async (assetData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/assets', assetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create asset');
    }
  }
);

export const updateAsset = createAsyncThunk(
  'assets/update',
  async ({ assetId, assetData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/assets/${assetId}`, assetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset');
    }
  }
);

export const deleteAsset = createAsyncThunk(
  'assets/delete',
  async (assetId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/assets/${assetId}`);
      return { ...response.data, assetId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete asset');
    }
  }
);

// Async thunks for asset transactions
export const fetchAssetTransactions = createAsyncThunk(
  'assets/fetchTransactions',
  async (assetId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/asset-transactions/asset/${assetId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset transactions');
    }
  }
);

export const createAssetTransaction = createAsyncThunk(
  'assets/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/api/asset-transactions', transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create asset transaction');
    }
  }
);

export const updateAssetTransaction = createAsyncThunk(
  'assets/updateTransaction',
  async ({ transactionId, transactionData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/asset-transactions/${transactionId}`, transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update asset transaction');
    }
  }
);

export const deleteAssetTransaction = createAsyncThunk(
  'assets/deleteTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/asset-transactions/${transactionId}`);
      return { ...response.data, transactionId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete asset transaction');
    }
  }
);

// Async thunks for financial metrics
export const fetchNetWorth = createAsyncThunk(
  'assets/fetchNetWorth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/assets/user/net-worth');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch net worth data');
    }
  }
);

export const fetchPortfolioPerformance = createAsyncThunk(
  'assets/fetchPortfolioPerformance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/assets/user/portfolio-performance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio performance');
    }
  }
);

export const fetchAssetHistory = createAsyncThunk(
  'assets/fetchHistory',
  async ({ assetId, period = 'all' }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/asset-transactions/history/${assetId}`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch asset history');
    }
  }
);

// Asset slice definition
const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    clearAssetError: (state) => {
      state.error = null;
    },
    clearAssetSuccess: (state) => {
      state.success = null;
    },
    resetAssetState: () => initialState
  },
  extraReducers: (builder) => {
    builder
      // Fetch all assets
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.assets = action.payload.assets;
        state.assetsByType = action.payload.assetsByType || {};
        
        // Group assets by type
        const assetsByType = {};
        action.payload.assets.forEach(asset => {
          if (!assetsByType[asset.assetType]) {
            assetsByType[asset.assetType] = [];
          }
          assetsByType[asset.assetType].push(asset);
        });
        state.assetsByType = assetsByType;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch assets';
      })
      
      // Fetch single asset
      .addCase(fetchAssetById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAsset = action.payload.asset;
        state.transactions = action.payload.recentTransactions || [];
      })
      .addCase(fetchAssetById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch asset details';
      })
      
      // Create asset
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.loading = false;
        state.assets.push(action.payload.asset);
        
        // Add to assetsByType
        const { assetType } = action.payload.asset;
        if (!state.assetsByType[assetType]) {
          state.assetsByType[assetType] = [];
        }
        state.assetsByType[assetType].push(action.payload.asset);
        
        state.success = 'Asset created successfully';
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create asset';
      })
      
      // Update asset
      .addCase(updateAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAsset.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAsset = action.payload.asset;
        
        // Update in assets array
        const index = state.assets.findIndex(a => a.id === updatedAsset.id);
        if (index !== -1) {
          state.assets[index] = updatedAsset;
        }
        
        // Update in assetsByType
        Object.keys(state.assetsByType).forEach(type => {
          const typeIndex = state.assetsByType[type].findIndex(a => a.id === updatedAsset.id);
          if (typeIndex !== -1) {
            // If asset type changed, remove from old type array
            if (type !== updatedAsset.assetType) {
              state.assetsByType[type] = state.assetsByType[type].filter(a => a.id !== updatedAsset.id);
              
              // Add to new type array
              if (!state.assetsByType[updatedAsset.assetType]) {
                state.assetsByType[updatedAsset.assetType] = [];
              }
              state.assetsByType[updatedAsset.assetType].push(updatedAsset);
            } else {
              // Just update in place
              state.assetsByType[type][typeIndex] = updatedAsset;
            }
          }
        });
        
        // Update currentAsset if it's the one we're viewing
        if (state.currentAsset && state.currentAsset.id === updatedAsset.id) {
          state.currentAsset = updatedAsset;
        }
        
        state.success = 'Asset updated successfully';
      })
      .addCase(updateAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update asset';
      })
      
      // Delete asset
      .addCase(deleteAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAsset.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.assetId;
        
        // Remove from assets array
        state.assets = state.assets.filter(asset => asset.id !== deletedId);
        
        // Remove from assetsByType
        Object.keys(state.assetsByType).forEach(type => {
          state.assetsByType[type] = state.assetsByType[type].filter(a => a.id !== deletedId);
        });
        
        // Clear currentAsset if it's the one we deleted
        if (state.currentAsset && state.currentAsset.id === deletedId) {
          state.currentAsset = null;
        }
        
        state.success = 'Asset deleted successfully';
      })
      .addCase(deleteAsset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete asset';
      })
      
      // Fetch asset transactions
      .addCase(fetchAssetTransactions.pending, (state) => {
        state.transactionLoading = true;
        state.error = null;
      })
      .addCase(fetchAssetTransactions.fulfilled, (state, action) => {
        state.transactionLoading = false;
        state.transactions = action.payload.transactions;
      })
      .addCase(fetchAssetTransactions.rejected, (state, action) => {
        state.transactionLoading = false;
        state.error = action.payload || 'Failed to fetch asset transactions';
      })
      
      // Create asset transaction
      .addCase(createAssetTransaction.pending, (state) => {
        state.transactionLoading = true;
        state.error = null;
      })
      .addCase(createAssetTransaction.fulfilled, (state, action) => {
        state.transactionLoading = false;
        state.transactions.unshift(action.payload.transaction);
        
        // Update asset info if available
        if (action.payload.updatedAsset) {
          const updatedAsset = action.payload.updatedAsset;
          
          // Update in assets array
          const index = state.assets.findIndex(a => a.id === updatedAsset.id);
          if (index !== -1) {
            state.assets[index] = updatedAsset;
          }
          
          // Update in assetsByType
          Object.keys(state.assetsByType).forEach(type => {
            const typeIndex = state.assetsByType[type].findIndex(a => a.id === updatedAsset.id);
            if (typeIndex !== -1) {
              state.assetsByType[type][typeIndex] = updatedAsset;
            }
          });
          
          // Update currentAsset if it's the one we're viewing
          if (state.currentAsset && state.currentAsset.id === updatedAsset.id) {
            state.currentAsset = updatedAsset;
          }
        }
        
        state.success = 'Transaction recorded successfully';
      })
      .addCase(createAssetTransaction.rejected, (state, action) => {
        state.transactionLoading = false;
        state.error = action.payload || 'Failed to record transaction';
      })
      
      // Update asset transaction
      .addCase(updateAssetTransaction.pending, (state) => {
        state.transactionLoading = true;
        state.error = null;
      })
      .addCase(updateAssetTransaction.fulfilled, (state, action) => {
        state.transactionLoading = false;
        
        // Update in transactions array
        const updatedTransaction = action.payload.transaction;
        const index = state.transactions.findIndex(t => t.id === updatedTransaction.id);
        if (index !== -1) {
          state.transactions[index] = updatedTransaction;
        }
        
        // Update asset info if available
        if (action.payload.asset) {
          const updatedAsset = action.payload.asset;
          
          // Update in assets array
          const assetIndex = state.assets.findIndex(a => a.id === updatedAsset.id);
          if (assetIndex !== -1) {
            state.assets[assetIndex] = updatedAsset;
          }
          
          // Update in assetsByType
          Object.keys(state.assetsByType).forEach(type => {
            const typeIndex = state.assetsByType[type].findIndex(a => a.id === updatedAsset.id);
            if (typeIndex !== -1) {
              state.assetsByType[type][typeIndex] = updatedAsset;
            }
          });
          
          // Update currentAsset if it's the one we're viewing
          if (state.currentAsset && state.currentAsset.id === updatedAsset.id) {
            state.currentAsset = updatedAsset;
          }
        }
        
        state.success = 'Transaction updated successfully';
      })
      .addCase(updateAssetTransaction.rejected, (state, action) => {
        state.transactionLoading = false;
        state.error = action.payload || 'Failed to update transaction';
      })
      
      // Delete asset transaction
      .addCase(deleteAssetTransaction.pending, (state) => {
        state.transactionLoading = true;
        state.error = null;
      })
      .addCase(deleteAssetTransaction.fulfilled, (state, action) => {
        state.transactionLoading = false;
        
        // Remove from transactions array
        const deletedId = action.payload.transactionId;
        state.transactions = state.transactions.filter(t => t.id !== deletedId);
        
        // Update asset info if available
        if (action.payload.asset) {
          const updatedAsset = action.payload.asset;
          
          // Update in assets array
          const assetIndex = state.assets.findIndex(a => a.id === updatedAsset.id);
          if (assetIndex !== -1) {
            state.assets[assetIndex] = updatedAsset;
          }
          
          // Update in assetsByType
          Object.keys(state.assetsByType).forEach(type => {
            const typeIndex = state.assetsByType[type].findIndex(a => a.id === updatedAsset.id);
            if (typeIndex !== -1) {
              state.assetsByType[type][typeIndex] = updatedAsset;
            }
          });
          
          // Update currentAsset if it's the one we're viewing
          if (state.currentAsset && state.currentAsset.id === updatedAsset.id) {
            state.currentAsset = updatedAsset;
          }
        }
        
        state.success = 'Transaction deleted successfully';
      })
      .addCase(deleteAssetTransaction.rejected, (state, action) => {
        state.transactionLoading = false;
        state.error = action.payload || 'Failed to delete transaction';
      })
      
      // Fetch net worth
      .addCase(fetchNetWorth.pending, (state) => {
        state.netWorthLoading = true;
        state.error = null;
      })
      .addCase(fetchNetWorth.fulfilled, (state, action) => {
        state.netWorthLoading = false;
        state.netWorth.current = action.payload.currentNetWorth;
        state.netWorth.historical = action.payload.historicalNetWorth;
        state.netWorth.allocation = action.payload.assetAllocation;
      })
      .addCase(fetchNetWorth.rejected, (state, action) => {
        state.netWorthLoading = false;
        state.error = action.payload || 'Failed to fetch net worth data';
      })
      
      // Fetch portfolio performance
      .addCase(fetchPortfolioPerformance.pending, (state) => {
        state.portfolioLoading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioPerformance.fulfilled, (state, action) => {
        state.portfolioLoading = false;
        state.portfolio.performance = {
          totalValue: action.payload.portfolioValue,
          initialValue: action.payload.initialInvestment,
          totalReturn: action.payload.totalReturn,
          totalReturnPercentage: action.payload.totalReturnPercentage,
          annualizedReturn: action.payload.annualizedReturn,
          holdingPeriod: action.payload.averageHoldingPeriod
        };
        state.portfolio.breakdown = action.payload.investmentsByType;
        state.portfolio.returns = action.payload.returnsByType;
      })
      .addCase(fetchPortfolioPerformance.rejected, (state, action) => {
        state.portfolioLoading = false;
        state.error = action.payload || 'Failed to fetch portfolio performance';
      })
      
      // Fetch asset history
      .addCase(fetchAssetHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchAssetHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.assetHistory.valueHistory = action.payload.valueHistory;
        state.assetHistory.performance = action.payload.performance;
      })
      .addCase(fetchAssetHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload || 'Failed to fetch asset history';
      });
  }
});

// Export actions and reducer
export const { clearAssetError, clearAssetSuccess, resetAssetState } = assetSlice.actions;
export default assetSlice.reducer;
