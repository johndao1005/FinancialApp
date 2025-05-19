import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Space, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoginForm = ({ loading, onFinish }) => {
  return (
    <Form
      name="login_form"
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Email" 
          size="large" 
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please enter your password' }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          size="large"
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
