/**
 * Main App Component
 * 
 * This is the root component of the Financial App that sets up:
 * 1. Routing with React Router for different pages
 * 2. Layout structure using Ant Design
 * 3. Authentication-based conditional rendering
 * 4. Theme configuration
 * 
 * The app has two main states:
 * - Authenticated: Shows navigation sidebar and private routes
 * - Unauthenticated: Shows only login/register pages
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider, Layout, theme } from 'antd';
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import UploadStatement from './pages/UploadStatement/UploadStatement';
import Profile from './pages/Profile/Profile';
import Budgets from './pages/Budgets/Budgets';
import Goals from './pages/Goals/Goals';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import { ROUTES, PRIMARY_COLORS, UI_SIZES } from './constants';
import './styles/App.css';

const { Content } = Layout;

function App() {
  // Get authentication state from Redux store
  const { isAuthenticated } = useSelector(state => state.auth);

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
        {/* Conditional rendering based on authentication status */}
        {isAuthenticated ? (
          <>
            {/* Authenticated Layout with Navigation */}
            <Navbar />
            <Layout className="site-layout">
              <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, overflow: 'initial' ,paddingLeft:100}}>
                <Routes>
                  {/* Protected Routes - Only accessible when logged in */}
                  <Route element={<PrivateRoute />}>
                    <Route path={ROUTES.DASHBOARD.path} element={<Dashboard />} />
                    <Route path={ROUTES.TRANSACTIONS.path} element={<Transactions />} />
                    <Route path={ROUTES.UPLOAD.path} element={<UploadStatement />} />
                    <Route path={ROUTES.PROFILE.path} element={<Profile />} />
                    <Route path={ROUTES.BUDGETS.path} element={<Budgets />} />
                    <Route path={ROUTES.GOALS.path} element={<Goals />} />
                  </Route>
                  <Route path="*" element={<Navigate to={ROUTES.DASHBOARD.path} />} />
                </Routes>
              </Content>
            </Layout>
          </>
        ) : (
          <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '24px' }}>
            {/* Unauthenticated Layout - Login/Register pages */}
            <Routes>
              <Route path={ROUTES.LOGIN.path} element={<Login />} />
              <Route path={ROUTES.REGISTER.path} element={<Register />} />
              <Route path="*" element={<Navigate to={ROUTES.LOGIN.path} />} />
            </Routes>
          </Content>
        )}
      </Layout>
    </ConfigProvider>
  );
}

export default App;
