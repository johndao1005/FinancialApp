import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

// Initial state
const initialState = {
  goals: [],
  currentGoal: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchGoals = createAsyncThunk(
  'goal/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/goals');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch goals'
      );
    }
  }
);

export const fetchGoal = createAsyncThunk(
  'goal/fetchGoal',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/goals/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch goal'
      );
    }
  }
);

export const createGoal = createAsyncThunk(
  'goal/createGoal',
  async (goalData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/goals', goalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create goal'
      );
    }
  }
);

export const updateGoal = createAsyncThunk(
  'goal/updateGoal',
  async ({ id, goalData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/goals/${id}`, goalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update goal'
      );
    }
  }
);

export const deleteGoal = createAsyncThunk(
  'goal/deleteGoal',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/goals/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete goal'
      );
    }
  }
);

export const addContribution = createAsyncThunk(
  'goal/addContribution',
  async ({ id, contributionData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/api/goals/${id}/contributions`, contributionData);
      return { goalId: id, contribution: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add contribution'
      );
    }
  }
);

export const deleteContribution = createAsyncThunk(
  'goal/deleteContribution',
  async ({ goalId, contributionId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/goals/${goalId}/contributions/${contributionId}`);
      return { goalId, contributionId, response: response.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete contribution'
      );
    }
  }
);

// Goal slice
const goalSlice = createSlice({
  name: 'goal',
  initialState,
  reducers: {
    clearCurrentGoal: (state) => {
      state.currentGoal = null;
    },
    clearGoalError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single goal
      .addCase(fetchGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGoal = action.payload;
      })
      .addCase(fetchGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.unshift(action.payload);
        state.currentGoal = action.payload;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.map(goal => 
          goal.id === action.payload.id ? action.payload : goal
        );
        state.currentGoal = action.payload;
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter(goal => goal.id !== action.payload.id);
        if (state.currentGoal && state.currentGoal.id === action.payload.id) {
          state.currentGoal = null;
        }
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add contribution
      .addCase(addContribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addContribution.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update the current goal if it matches
        if (state.currentGoal && state.currentGoal.id === action.payload.goalId) {
          state.currentGoal = {
            ...state.currentGoal,
            currentAmount: parseFloat(state.currentGoal.currentAmount) + parseFloat(action.payload.contribution.amount),
            contributions: [
              action.payload.contribution,
              ...state.currentGoal.contributions
            ]
          };
          
          // Update completion status if needed
          if (parseFloat(state.currentGoal.currentAmount) >= parseFloat(state.currentGoal.targetAmount)) {
            state.currentGoal.status = 'completed';
          }
          
          // Recalculate progress percentage
          state.currentGoal.percentComplete = Math.min(
            (parseFloat(state.currentGoal.currentAmount) / parseFloat(state.currentGoal.targetAmount)) * 100,
            100
          );
          
          // Recalculate remaining amount
          state.currentGoal.remainingAmount = Math.max(
            parseFloat(state.currentGoal.targetAmount) - parseFloat(state.currentGoal.currentAmount),
            0
          );
        }
        
        // Update the goal in the goals array
        state.goals = state.goals.map(goal => {
          if (goal.id === action.payload.goalId) {
            const updatedGoal = {
              ...goal,
              currentAmount: parseFloat(goal.currentAmount) + parseFloat(action.payload.contribution.amount),
              contributions: [
                action.payload.contribution,
                ...(goal.contributions || [])
              ]
            };
            
            // Update completion status if needed
            if (parseFloat(updatedGoal.currentAmount) >= parseFloat(updatedGoal.targetAmount)) {
              updatedGoal.status = 'completed';
            }
            
            // Recalculate progress percentage
            updatedGoal.percentComplete = Math.min(
              (parseFloat(updatedGoal.currentAmount) / parseFloat(updatedGoal.targetAmount)) * 100,
              100
            );
            
            // Recalculate remaining amount
            updatedGoal.remainingAmount = Math.max(
              parseFloat(updatedGoal.targetAmount) - parseFloat(updatedGoal.currentAmount),
              0
            );
            
            return updatedGoal;
          }
          return goal;
        });
      })
      .addCase(addContribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete contribution
      .addCase(deleteContribution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContribution.fulfilled, (state, action) => {
        state.loading = false;
        
        // Find the contribution amount from the current goal if available
        let contributionAmount = 0;
        if (state.currentGoal && state.currentGoal.id === action.payload.goalId) {
          const contribution = state.currentGoal.contributions.find(
            c => c.id === action.payload.contributionId
          );
          contributionAmount = contribution ? parseFloat(contribution.amount) : 0;
          
          // Update the current goal
          state.currentGoal = {
            ...state.currentGoal,
            currentAmount: Math.max(parseFloat(state.currentGoal.currentAmount) - contributionAmount, 0),
            contributions: state.currentGoal.contributions.filter(
              c => c.id !== action.payload.contributionId
            )
          };
          
          // Update completion status if needed
          if (parseFloat(state.currentGoal.currentAmount) < parseFloat(state.currentGoal.targetAmount) && 
              state.currentGoal.status === 'completed') {
            state.currentGoal.status = 'in_progress';
          }
          
          // Recalculate progress percentage
          state.currentGoal.percentComplete = Math.min(
            (parseFloat(state.currentGoal.currentAmount) / parseFloat(state.currentGoal.targetAmount)) * 100,
            100
          );
          
          // Recalculate remaining amount
          state.currentGoal.remainingAmount = Math.max(
            parseFloat(state.currentGoal.targetAmount) - parseFloat(state.currentGoal.currentAmount),
            0
          );
        }
        
        // Update the goal in the goals array
        state.goals = state.goals.map(goal => {
          if (goal.id === action.payload.goalId) {
            // Find the contribution if we didn't get it from currentGoal
            if (contributionAmount === 0 && goal.contributions) {
              const contribution = goal.contributions.find(
                c => c.id === action.payload.contributionId
              );
              contributionAmount = contribution ? parseFloat(contribution.amount) : 0;
            }
            
            const updatedGoal = {
              ...goal,
              currentAmount: Math.max(parseFloat(goal.currentAmount) - contributionAmount, 0),
              contributions: goal.contributions ? goal.contributions.filter(
                c => c.id !== action.payload.contributionId
              ) : []
            };
            
            // Update completion status if needed
            if (parseFloat(updatedGoal.currentAmount) < parseFloat(updatedGoal.targetAmount) && 
                updatedGoal.status === 'completed') {
              updatedGoal.status = 'in_progress';
            }
            
            // Recalculate progress percentage
            updatedGoal.percentComplete = Math.min(
              (parseFloat(updatedGoal.currentAmount) / parseFloat(updatedGoal.targetAmount)) * 100,
              100
            );
            
            // Recalculate remaining amount
            updatedGoal.remainingAmount = Math.max(
              parseFloat(updatedGoal.targetAmount) - parseFloat(updatedGoal.currentAmount),
              0
            );
            
            return updatedGoal;
          }
          return goal;
        });
      })
      .addCase(deleteContribution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions and reducer
export const { clearCurrentGoal, clearGoalError } = goalSlice.actions;
export default goalSlice.reducer;
