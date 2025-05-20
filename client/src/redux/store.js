import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';
import categoryReducer from './slices/categorySlice';
import budgetReducer from './slices/budgetSlice';
import goalReducer from './slices/goalSlice';
import categoryOverrideReducer from './slices/categoryOverrideSlice';
import incomePredictionReducer from './slices/incomePredictionSlice';
import assetReducer from './slices/assetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    categories: categoryReducer,
    budgets: budgetReducer,
    goals: goalReducer,
    categoryOverrides: categoryOverrideReducer,
    incomePrediction: incomePredictionReducer,
    assets: assetReducer
  }
});
