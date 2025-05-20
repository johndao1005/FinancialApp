/**
 * CategoryOverrideSlice test
 * 
 * Tests the categoryOverrideSlice's functionality:
 * - Action creators
 * - Reducers
 * - Async thunks
 */
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import axios from '../utils/axios';
import categoryOverrideReducer, {
  fetchCategoryOverrides,
  createCategoryOverride,
  applyCategoryRules,
  generateRulesFromPatterns,
  updateCategoryOverride,
  deleteCategoryOverride,
  clearCategoryOverrideError,
  clearApplyResult,
  clearGeneratedRules
} from '../redux/slices/categoryOverrideSlice';

// Mock axios
jest.mock('../utils/axios');

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('categoryOverrideSlice', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      categoryOverride: {
        categoryOverrides: [],
        loading: false,
        error: null,
        lastApplyResult: null,
        generatedRules: []
      }
    });
    
    jest.clearAllMocks();
  });
  
  describe('action creators and reducers', () => {
    test('should handle initial state', () => {
      const initialState = {
        categoryOverrides: [],
        loading: false,
        error: null,
        lastApplyResult: null,
        generatedRules: []
      };
      
      expect(categoryOverrideReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
    
    test('should handle clearCategoryOverrideError', () => {
      const initialState = {
        categoryOverrides: [],
        loading: false,
        error: 'Some error',
        lastApplyResult: null,
        generatedRules: []
      };
      
      const action = clearCategoryOverrideError();
      const nextState = categoryOverrideReducer(initialState, action);
      
      expect(nextState.error).toBeNull();
    });
    
    test('should handle clearApplyResult', () => {
      const initialState = {
        categoryOverrides: [],
        loading: false,
        error: null,
        lastApplyResult: { message: 'Applied rules', updatedCount: 5 },
        generatedRules: []
      };
      
      const action = clearApplyResult();
      const nextState = categoryOverrideReducer(initialState, action);
      
      expect(nextState.lastApplyResult).toBeNull();
    });
    
    test('should handle clearGeneratedRules', () => {
      const initialState = {
        categoryOverrides: [],
        loading: false,
        error: null,
        lastApplyResult: null,
        generatedRules: [{ id: 1, pattern: 'Test' }]
      };
      
      const action = clearGeneratedRules();
      const nextState = categoryOverrideReducer(initialState, action);
      
      expect(nextState.generatedRules).toEqual([]);
    });
  });
  
  describe('async thunks', () => {
    test('fetchCategoryOverrides should get all user category rules', async () => {
      const mockRules = [
        { id: 1, pattern: 'Grocery', categoryId: 2 },
        { id: 2, pattern: 'Restaurant', categoryId: 3 }
      ];
      
      axios.get.mockResolvedValueOnce({ data: mockRules });
      
      await store.dispatch(fetchCategoryOverrides());
      const actions = store.getActions();
      
      expect(actions[0].type).toBe(fetchCategoryOverrides.pending.type);
      expect(actions[1].type).toBe(fetchCategoryOverrides.fulfilled.type);
      expect(actions[1].payload).toEqual(mockRules);
    });
    
    test('createCategoryOverride should create a new rule', async () => {
      const newRule = { pattern: 'Coffee', matchField: 'merchant', categoryId: 3 };
      const mockResponse = { id: 3, ...newRule };
      
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      await store.dispatch(createCategoryOverride(newRule));
      const actions = store.getActions();
      
      expect(actions[0].type).toBe(createCategoryOverride.pending.type);
      expect(actions[1].type).toBe(createCategoryOverride.fulfilled.type);
      expect(actions[1].payload).toEqual(mockResponse);
    });
    
    test('applyCategoryRules should apply rules to transactions', async () => {
      const mockResponse = { message: 'Applied rules', updatedCount: 5 };
      
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      await store.dispatch(applyCategoryRules({}));
      const actions = store.getActions();
      
      expect(actions[0].type).toBe(applyCategoryRules.pending.type);
      expect(actions[1].type).toBe(applyCategoryRules.fulfilled.type);
      expect(actions[1].payload).toEqual(mockResponse);
    });
    
    test('generateRulesFromPatterns should generate new rules', async () => {
      const mockResponse = {
        message: 'Created 3 rules',
        createdRules: [
          { id: 4, pattern: 'Coffee Shop', categoryId: 3 },
          { id: 5, amount: '3.99', categoryId: 3 },
          { id: 6, pattern: 'Gas Station', categoryId: 4 }
        ]
      };
      
      axios.post.mockResolvedValueOnce({ data: mockResponse });
      
      await store.dispatch(generateRulesFromPatterns());
      const actions = store.getActions();
      
      expect(actions[0].type).toBe(generateRulesFromPatterns.pending.type);
      expect(actions[1].type).toBe(generateRulesFromPatterns.fulfilled.type);
      expect(actions[1].payload).toEqual(mockResponse);
    });
    
    test('updateCategoryOverride should update an existing rule', async () => {
      const updatedRule = { id: 1, pattern: 'Grocery Store', categoryId: 2, isActive: false };
      
      axios.put.mockResolvedValueOnce({ data: updatedRule });
      
      await store.dispatch(updateCategoryOverride({
        id: 1,
        overrideData: { isActive: false }
      }));
      const actions = store.getActions();
      
      expect(actions[0].type).toBe(updateCategoryOverride.pending.type);
      expect(actions[1].type).toBe(updateCategoryOverride.fulfilled.type);
      expect(actions[1].payload).toEqual(updatedRule);
    });
    
    test('deleteCategoryOverride should remove a rule', async () => {
      axios.delete.mockResolvedValueOnce({});
      
      await store.dispatch(deleteCategoryOverride(1));
      const actions = store.getActions();
      
      expect(actions[0].type).toBe(deleteCategoryOverride.pending.type);
      expect(actions[1].type).toBe(deleteCategoryOverride.fulfilled.type);
      expect(actions[1].payload).toBe(1);
    });
  });
});
