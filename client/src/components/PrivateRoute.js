import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // If not authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
