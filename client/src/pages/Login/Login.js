import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Alert, Space } from 'antd';
import { loginUser, clearError } from '../../redux/slices/authSlice';
import LoginForm from './component/LoginForm';

const { Title, Text } = Typography;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Clean up error state when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch]);

  const onFinish = (values) => {
    dispatch(loginUser(values));
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
          
          <LoginForm 
            loading={loading}
            onFinish={onFinish}
          />
        </Space>
      </Card>
    </div>
  );
};

export default Login;
