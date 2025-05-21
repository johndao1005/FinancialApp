import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Space, Typography, Tooltip } from 'antd';
import { UserOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoginForm = ({ loading, onFinish, disabled = false }) => {
  return (
    <Form
      name="login_form"
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off" // Disable browser autocomplete for security
    >      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' },
          { max: 100, message: 'Email cannot exceed 100 characters' },
          { 
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
            message: 'Please enter a valid email address' 
          }
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Email" 
          size="large" 
          disabled={disabled}
          maxLength={100} // Limit input length
          onPaste={(e) => {
            // Sanitize pasted content for additional security
            const pastedText = e.clipboardData.getData('text');
            if (pastedText.includes('<') || pastedText.includes('>') || pastedText.includes('script')) {
              e.preventDefault();
            }
          }}
        />
      </Form.Item>
        <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Please enter your password' },
          { min: 6, message: 'Password must be at least 6 characters' },
          { max: 64, message: 'Password cannot exceed 64 characters' }
        ]}
        extra={
          <Tooltip title="Ensure your password is secure: use a mix of letters, numbers, and special characters. Never share your password with anyone.">
            <Text type="secondary" style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
              <InfoCircleOutlined style={{ marginRight: '5px' }} /> Password security tips
            </Text>
          </Tooltip>
        }
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          size="large"
          disabled={disabled}
          maxLength={64} // Limit input length
          autoComplete="current-password"
        />
      </Form.Item>
        <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          className="login-form-button" 
          block 
          size="large"
          loading={loading}
          disabled={disabled}
        >
          Log in
        </Button>
      </Form.Item>
      
      <Form.Item style={{ textAlign: 'center' }}>
        <Space direction="vertical">
          <Text>
            Don't have an account? <Link to="/register">Register now!</Link>
          </Text>
          <Link to="/forgot-password">Forgot password?</Link>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
