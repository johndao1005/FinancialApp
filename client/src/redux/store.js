import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { createLogger } from 'redux-logger';

import authReducer from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';
import categoryReducer from './slices/categorySlice';
import budgetReducer from './slices/budgetSlice';
import goalReducer from './slices/goalSlice';
import categoryOverrideReducer from './slices/categoryOverrideSlice';
import incomePredictionReducer from './slices/incomePredictionSlice';
import assetReducer from './slices/assetSlice';

// Configure persistence for reducers that should be persisted
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'user'] // Only persist these fields
};

// Create the root reducer with persistence
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  transactions: transactionReducer,
  categories: categoryReducer,
  budgets: budgetReducer,
  goals: goalReducer,
  categoryOverrides: categoryOverrideReducer,
  incomePrediction: incomePredictionReducer,
  assets: assetReducer
});

// Only use logger in development
const middlewares = [];
if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    collapsed: true,
    diff: true
  });
  middlewares.push(logger);
}

// Configure store with performance optimizations
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Disable serializable check for redux-persist
      immutableCheck: process.env.NODE_ENV === 'development' // Only check immutability in development
    }).concat(middlewares),
  devTools: process.env.NODE_ENV !== 'production'
});

export const persistor = persistStore(store);
