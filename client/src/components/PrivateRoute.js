/**
 * PrivateRoute Component
 * 
 * Protects routes that require authentication:
 * 1. Shows loading indicator while authentication status is being checked
 * 2. Redirects unauthenticated users to the login page
 * 3. Renders child routes if the user is authenticated
 * 
 * Used in App.js to wrap all routes that require login
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin 
          indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
          tip="Loading..." 
        />
      </div>
    );
  }

  // If not authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
