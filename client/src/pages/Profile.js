import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Card, 
  Typography, 
  Form, 
  Input, 
  Button, 
  Select, 
  Row, 
  Col, 
  Alert, 
  Divider, 
  Badge, 
  Tag,
  Space 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  DollarOutlined,
  CrownOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        baseCurrency: user.baseCurrency || 'USD'
      });
    }
  }, [user, profileForm]);

  const updateProfile = async (values) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/profile', values, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error updating profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (values) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMessage({
        type: 'success',
        text: 'Password changed successfully'
      });
      
      // Clear password fields
      passwordForm.resetFields();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error changing password'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>User Profile</Title>
      
      {message.text && (
        <Alert
          message={message.type === 'success' ? 'Success' : 'Error'}
          description={message.text}
          type={message.type === 'success' ? 'success' : 'error'}
          showIcon
          style={{ marginBottom: '24px' }}
        />
      )}
      
      <Row gutter={[16, 16]}>
        {/* Profile Information */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>Profile Information</span>
              </Space>
            }
            bordered={true}
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={updateProfile}
            >
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please input your first name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="First Name" />
              </Form.Item>
              
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please input your last name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Last Name" />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="Email"
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
                  disabled 
                  title="Email cannot be changed for security reasons"
                />
              </Form.Item>
              
              <Form.Item
                name="baseCurrency"
                label="Base Currency"
                rules={[{ required: true, message: 'Please select your base currency!' }]}
              >
                <Select 
                  placeholder="Select Base Currency"
                  suffixIcon={<DollarOutlined />}
                >
                  <Option value="USD">USD - US Dollar</Option>
                  <Option value="EUR">EUR - Euro</Option>
                  <Option value="GBP">GBP - British Pound</Option>
                  <Option value="CAD">CAD - Canadian Dollar</Option>
                  <Option value="AUD">AUD - Australian Dollar</Option>
                  <Option value="JPY">JPY - Japanese Yen</Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                >
                  Update Profile
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          {/* Change Password */}
          <Card
            title={
              <Space>
                <LockOutlined />
                <span>Change Password</span>
              </Space>
            }
            bordered={true}
            style={{ marginBottom: '16px' }}
          >
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={changePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Current Password" 
                />
              </Form.Item>
              
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="New Password" 
                />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirm New Password" 
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
          
          {/* Account Status */}
          <Card
            title={
              <Space>
                <CrownOutlined />
                <span>Account Status</span>
              </Space>
            }
            bordered={true}
          >
            <div style={{ padding: '16px 0' }}>
              <p>
                <strong>Account Type:</strong>{' '}
                {user?.isPremium ? (
                  <Tag color="gold">Premium</Tag>
                ) : (
                  <Tag color="blue">Free</Tag>
                )}
              </p>
              
              {!user?.isPremium && (
                <Button type="primary" style={{ background: '#faad14', borderColor: '#faad14' }}>
                  <CrownOutlined /> Upgrade to Premium
                </Button>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
