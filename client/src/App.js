/**
 * Main App Component
 * 
 * This is the root component of the Financial App that sets up:
 * 1. Routing with React Router for different pages
 * 2. Layout structure using Ant Design
 * 3. Authentication-based conditional rendering
 * 4. Theme configuration
 * 5. Code splitting with React.lazy for improved performance
 * 6. Application security features
 * 
 * The app has two main states:
 * - Authenticated: Shows navigation sidebar and private routes
 * - Unauthenticated: Shows only login/register pages
 */

import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider, Layout, theme, Spin } from 'antd';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { AssetNotifications } from './components';
import { ROUTES, PRIMARY_COLORS, UI_SIZES } from './constants';
import { initSecurity } from './utils/security';
import './styles/App.css';

const { Content } = Layout;

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions/Transactions'));
const Login = lazy(() => import('./pages/Login/Login'));
const Register = lazy(() => import('./pages/Register/Register'));
const UploadStatement = lazy(() => import('./pages/UploadStatement/UploadStatement'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Budgets = lazy(() => import('./pages/Budgets/Budgets'));
const Goals = lazy(() => import('./pages/Goals/Goals'));
const Income = lazy(() => import('./pages/Income/Income'));
const AssetsList = lazy(() => import('./pages/AssetsList'));
const AssetDetail = lazy(() => import('./pages/AssetDetail'));

// Loading component for suspense fallback
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100%', 
    padding: '50px' 
  }}>
    <Spin size="large" tip="Loading..." />
  </div>
);

function App() {
  // Get authentication state from Redux store
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Initialize security features when the app loads
  useEffect(() => {
    // Set up security features
    initSecurity();
    
    // Set Content Security Policy dynamically
    if (process.env.NODE_ENV === 'production') {
      // Create CSP meta tag
      const cspMeta = document.createElement('meta');
      cspMeta.httpEquiv = 'Content-Security-Policy';
      cspMeta.content = 
        "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data:; " +
        "connect-src 'self'";
      document.head.appendChild(cspMeta);
    }
    
    // Listen for storage events to detect session tampering
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token' || event.key === 'auth_token_expiry') {
        // Token was modified in another tab/window - potential attack
        console.warn('Authentication data modified externally');
        window.location.href = '/login?security=breach';
      }
    });
    
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: PRIMARY_COLORS.MAIN,
          borderRadius: UI_SIZES.BORDER_RADIUS,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* Conditional rendering based on authentication status */}        {isAuthenticated ? (
          <>
            {/* Authenticated Layout with Navigation */}            <Navbar />
            <Layout className="site-layout">
              <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, overflow: 'initial' ,paddingLeft:100}}>
                {/* Asset Notifications Component */}
                <AssetNotifications />
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Protected Routes - Only accessible when logged in */}                    <Route element={<PrivateRoute />}>                      <Route path={ROUTES.DASHBOARD.path} element={<Dashboard />} />                      <Route path={ROUTES.TRANSACTIONS.path} element={<Transactions />} />
                      <Route path={ROUTES.INCOME.path} element={<Income />} />
                      <Route path={ROUTES.ASSETS.path} element={<AssetsList />} />
                      <Route path={`${ROUTES.ASSETS.path}/:assetId`} element={<AssetDetail />} />
                      <Route path={ROUTES.UPLOAD.path} element={<UploadStatement />} />
                      <Route path={ROUTES.PROFILE.path} element={<Profile />} />
                      <Route path={ROUTES.BUDGETS.path} element={<Budgets />} />
                      <Route path={ROUTES.GOALS.path} element={<Goals />} />
                    </Route>
                    <Route path="*" element={<Navigate to={ROUTES.DASHBOARD.path} />} />
                  </Routes>
                </Suspense>
              </Content>
            </Layout>
          </>        ) : (
          <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
            {/* Unauthenticated Layout - Login/Register pages */}
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path={ROUTES.LOGIN.path} element={<Login />} />
                <Route path={ROUTES.REGISTER.path} element={<Register />} />
                <Route path="*" element={<Navigate to={ROUTES.LOGIN.path} />} />
              </Routes>
            </Suspense>
          </Content>
        )}
      </Layout>
    </ConfigProvider>
  );
}

export default App;
