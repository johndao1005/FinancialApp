import React from 'react';
import { Link } from 'react-router-dom';
import { Form, Input, Button, Space, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RegisterForm = ({ loading, onFinish }) => {
  return (
    <Form
      name="register_form"
      className="register-form"
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        rules={[{ required: true, message: 'Please enter your name' }]}
      >
        <Input 
          prefix={<UserOutlined />} 
          placeholder="Full Name" 
          size="large" 
        />
      </Form.Item>
      
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please enter your email' },
          { type: 'email', message: 'Please enter a valid email' }
        ]}
      >
        <Input 
          prefix={<MailOutlined />} 
          placeholder="Email" 
          size="large" 
        />
      </Form.Item>
      
      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Please enter your password' },
          { min: 8, message: 'Password must be at least 8 characters' }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Password"
          size="large"
        />
      </Form.Item>
      
      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm your password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords do not match'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Confirm Password"
          size="large"
        />
      </Form.Item>
      
      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          className="register-form-button" 
          block 
          size="large"
          loading={loading}
        >
          Create Account
        </Button>
      </Form.Item>
      
      <Form.Item style={{ textAlign: 'center' }}>
        <Text>
          Already have an account? <Link to="/login">Log in</Link>
        </Text>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;
