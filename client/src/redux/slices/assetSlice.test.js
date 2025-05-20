/**
 * Asset Slice Tests
 * 
 * Tests for the asset management Redux slice
 * including actions, reducers, and thunks.
 */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import assetReducer, {
  fetchAssets,
  fetchAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  fetchNetWorth,
  fetchPortfolioPerformance,
  createAssetTransaction,
  resetAssetState
} from './assetSlice';
import axiosInstance from '../../utils/axios';

// Mock axios
jest.mock('../../utils/axios');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Asset Redux Slice', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      assets: {
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
        loading: false,
        error: null,
        success: null
      }
    });
    
    jest.clearAllMocks();
  });
  
  describe('Asset Reducers', () => {
    it('should handle initial state', () => {
      expect(assetReducer(undefined, { type: 'unknown' })).toEqual({
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
      });
    });
    
    it('should handle resetAssetState', () => {
      const result = assetReducer(
        {
          assets: [{ id: '1', name: 'Test Asset' }],
          error: 'Some error',
          success: 'Operation successful'
        },
        resetAssetState()
      );
      
      expect(result.error).toBeNull();
      expect(result.success).toBeNull();
    });
  });
  
  describe('Asset Thunks', () => {
    it('should fetch assets successfully', async () => {
      const mockAssets = [
        { id: '1', name: 'Property', assetType: 'property', currentValue: 500000 },
        { id: '2', name: 'Stocks', assetType: 'stock', currentValue: 10000 }
      ];
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockAssets });
      
      await store.dispatch(fetchAssets());
      
      const actions = store.getActions();
      expect(actions[0].type).toEqual(fetchAssets.pending.type);
      expect(actions[1].type).toEqual(fetchAssets.fulfilled.type);
      expect(actions[1].payload).toEqual(mockAssets);
    });
    
    it('should handle fetchAssets rejection', async () => {
      const errorMessage = 'Failed to fetch assets';
      axiosInstance.get.mockRejectedValueOnce({ 
        response: { data: { message: errorMessage } } 
      });
      
      await store.dispatch(fetchAssets());
      
      const actions = store.getActions();
      expect(actions[0].type).toEqual(fetchAssets.pending.type);
      expect(actions[1].type).toEqual(fetchAssets.rejected.type);
      expect(actions[1].payload).toEqual(errorMessage);
    });
    
    it('should fetch asset by id successfully', async () => {
      const mockAsset = { 
        id: '1', 
        name: 'Property', 
        assetType: 'property', 
        currentValue: 500000 
      };
      
      axiosInstance.get.mockResolvedValueOnce({ data: mockAsset });
      
      await store.dispatch(fetchAssetById('1'));
      
      const actions = store.getActions();
      expect(actions[0].type).toEqual(fetchAssetById.pending.type);
      expect(actions[1].type).toEqual(fetchAssetById.fulfilled.type);
      expect(actions[1].payload).toEqual(mockAsset);
    });
    
    it('should create asset successfully', async () => {
      const newAsset = { 
        name: 'New Property', 
        assetType: 'property', 
        initialValue: 450000 
      };
      
      const createdAsset = {
        id: '3',
        ...newAsset,
        currentValue: 450000,
        createdAt: '2023-10-01'
      };
      
      axiosInstance.post.mockResolvedValueOnce({ data: createdAsset });
      
      await store.dispatch(createAsset(newAsset));
      
      const actions = store.getActions();
      expect(actions[0].type).toEqual(createAsset.pending.type);
      expect(actions[1].type).toEqual(createAsset.fulfilled.type);
      expect(actions[1].payload).toEqual(createdAsset);
    });
  });
});
