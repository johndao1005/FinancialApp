import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Alert, Space } from 'antd';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import LoginForm from './component/LoginForm';

const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);
  const [attemptDelay, setAttemptDelay] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Check if redirected due to session expiration
    if (location.search.includes('session=expired')) {
      setSessionExpired(true);
    }
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clean up error state when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch, location]);  const onFinish = (values) => {
    // Security enhancement: Implement a small delay before submitting
    // This helps mitigate brute force attacks while not noticeably affecting UX
    if (attemptDelay > 0) {
      // Don't allow login attempts during the delay period
      return;
    }
    
    const { email, password } = values;
    
    // Basic client-side validation
    if (!email || !password) {
      return;
    }
    
    // Implement a progressive delay based on consecutive failed attempts
    // This slows down brute force attempts but doesn't lock legitimate users
    const currentAttempts = parseInt(sessionStorage.getItem('loginAttempts') || '0');
    sessionStorage.setItem('loginAttempts', (currentAttempts + 1).toString());
    
    // After the first few attempts, start implementing delays
    if (currentAttempts > 2) {
      const delay = Math.min(2000 * (currentAttempts - 2), 10000); // Cap at 10 seconds
      setAttemptDelay(delay);
      
      setTimeout(() => {
        setAttemptDelay(0);
      }, delay);
    }
    
    // Clear session expired message if it was shown
    if (sessionExpired) {
      setSessionExpired(false);
    }
    
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Welcome Back</Title>
            <Text type="secondary">
              Log in to your account to manage your finances
            </Text>
          </div>
            {error && (
            <Alert 
              message="Login Failed" 
              description={error} 
              type="error" 
              showIcon 
            />
          )}
          
          {sessionExpired && !error && (
            <Alert
              message="Session Expired"
              description="Your session has expired. Please log in again to continue."
              type="warning"
              showIcon
            />
          )}
          
          {attemptDelay > 0 && (
            <Alert
              message="Too Many Attempts"
              description={`Please wait ${Math.ceil(attemptDelay/1000)} seconds before trying again.`}
              type="warning"
              showIcon
            />
          )}
          
          <LoginForm 
            loading={loading || attemptDelay > 0}
            onFinish={onFinish}
            disabled={attemptDelay > 0}
          />
        </Space>
      </Card>
    </div>
  );
};

export default Login;
