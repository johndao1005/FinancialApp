import React from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Space
} from 'antd';
import { LockOutlined } from '@ant-design/icons';

const PasswordForm = ({ 
  loading, 
  onFinish, 
  onCancel 
}) => {
  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
    >
      <Form.Item
        name="currentPassword"
        label="Current Password"
        rules={[{ required: true, message: 'Please enter your current password' }]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="Current password" 
        />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[
          { required: true, message: 'Please enter your new password' },
          { min: 8, message: 'Password must be at least 8 characters' }
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="New password" 
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label="Confirm New Password"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: 'Please confirm your new password' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords do not match'));
            },
          })
        ]}
      >
        <Input.Password 
          prefix={<LockOutlined />} 
          placeholder="Confirm new password" 
        />
      </Form.Item>

      <Form.Item>
        <Row justify="end">
          <Space>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Password
            </Button>
          </Space>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default PasswordForm;
