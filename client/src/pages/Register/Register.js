import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Alert, Space } from 'antd';
import { registerUser, clearError } from '../../redux/slices/authSlice';
import RegisterForm from './component/RegisterForm';

const { Title, Text } = Typography;

const Register = () => {
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
  }, [isAuthenticated, navigate, dispatch]);  const onFinish = (values) => {
    const { firstName, lastName, email, password } = values;
    dispatch(registerUser({ firstName, lastName, email, password }));
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <Title level={2}>Create an Account</Title>
            <Text type="secondary">
              Start managing your finances with our intuitive financial tracker
            </Text>
          </div>
          
          {error && (
            <Alert 
              message="Registration Failed" 
              description={error} 
              type="error" 
              showIcon 
            />
          )}
          
          <RegisterForm 
            loading={loading}
            onFinish={onFinish}
          />
        </Space>
      </Card>
    </div>
  );
};

export default Register;
