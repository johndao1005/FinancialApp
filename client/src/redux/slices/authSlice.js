/**
 * Authentication Slice
 * 
 * Manages user authentication state and operations:
 * 1. User registration and login
 * 2. Loading authenticated user data
 * 3. Logout functionality
 * 4. Token storage in localStorage
 * 5. Error handling for auth operations
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';
import { AUTH_API, USER_API } from '../../constants';
import tokenStorage from '../../utils/tokenStorage';

// Define the initial state
const initialState = {
  user: null,             // User data when authenticated
  isAuthenticated: false, // Authentication status
  loading: false,         // Loading state for async operations
  error: null            // Error messages if any
};

// Async thunks for authentication
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(AUTH_API.REGISTER, userData);
      await tokenStorage.setAuthToken(response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(AUTH_API.LOGIN, userData);
      const success = await tokenStorage.setAuthToken(response.data.token);
      
      if (!success) {
        throw new Error('Failed to securely store authentication token');
      }
      
      return response.data;
    } catch (error) {
      // Record the failed login attempt for security
      if (error.response && (error.response.status === 401 || error.response.status === 400)) {
        const lockoutInfo = await tokenStorage.recordFailedLoginAttempt();
        
        // If user is locked out, provide that information
        if (lockoutInfo.isLockedOut) {
          const lockoutEndTime = lockoutInfo.lockoutEnds.toLocaleTimeString();
          return rejectWithValue(
            `Too many failed login attempts. Please try again after ${lockoutEndTime}`
          );
        }
      }
      
      return rejectWithValue(
        error.response?.data?.message || 'Login failed'
      );
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      // Check if user is authenticated using secure token storage
      const isAuth = await tokenStorage.isAuthenticated();
      
      if (!isAuth) {
        return rejectWithValue('No valid token found');
      }
      
      const response = await axios.get(USER_API.PROFILE);
      
      // Add a formatted name field for easier usage in UI
      const user = response.data;
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      return user;
    } catch (error) {
      await tokenStorage.clearAuthToken();
      return rejectWithValue(
        error.response?.data?.message || 'Failed to load user'
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      // Format the data to match what the server expects
      const formattedData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        baseCurrency: userData.currency,
        settings: {
          language: userData.language
        }
      };
      
      console.log('Sending profile update:', formattedData);
      const response = await axios.put(USER_API.PROFILE, formattedData);
      
      // Add a formatted name field to the response so it's easier to use in the UI
      const user = response.data;
      user.name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update profile'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,  reducers: {
    logout: (state) => {
      tokenStorage.clearAuthToken();
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register user
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login user
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
