import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Card, 
  Typography, 
  Button, 
  Row, 
  Col, 
  Alert, 
  Divider, 
  Tabs,
  message 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  SettingOutlined
} from '@ant-design/icons';

// Import components
import ProfileForm from './component/ProfileForm';
import PasswordForm from './component/PasswordForm';
import AccountInfo from './component/AccountInfo';

const { Title } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  const handleProfileUpdate = async (values) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      await axios.put('/api/users/profile', values);
      setSuccess('Profile updated successfully!');
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (values) => {
    setPasswordLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      await axios.put('/api/users/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      setSuccess('Password updated successfully!');
      message.success('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      
      if (error.response && error.response.status === 401) {
        setError('Current password is incorrect.');
        message.error('Current password is incorrect.');
      } else {
        setError('Failed to update password. Please try again.');
        message.error('Failed to update password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleTabChange = (key) => {
    setActiveTab(key);
    setSuccess(null);
    setError(null);
  };
  
  // Initial values for profile form
  const initialProfileValues = {
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.settings?.currency || 'USD',
    language: user?.settings?.language || 'en',
  };
  
  if (!user) {
    return (
      <Card>
        <Alert 
          message="Not Logged In" 
          description="You need to log in to view your profile."
          type="warning" 
          showIcon 
        />
      </Card>
    );
  }
  
  return (
    <div className="profile-page">
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Title level={2}>My Profile</Title>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <AccountInfo user={user} />
        </Col>
        
        <Col xs={24} md={16}>
          <Card>
            <Tabs 
              activeKey={activeTab} 
              onChange={handleTabChange}
            >
              <TabPane 
                tab={
                  <span>
                    <UserOutlined />
                    Profile Information
                  </span>
                } 
                key="profile"
              >
                {success && (
                  <Alert
                    message="Success"
                    description={success}
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {error && (
                  <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                <ProfileForm
                  initialValues={initialProfileValues}
                  loading={loading}
                  onFinish={handleProfileUpdate}
                  onCancel={() => setActiveTab('profile')}
                />
              </TabPane>
              
              <TabPane
                tab={
                  <span>
                    <LockOutlined />
                    Change Password
                  </span>
                }
                key="password"
              >
                {success && (
                  <Alert
                    message="Success"
                    description={success}
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                {error && (
                  <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}
                
                <PasswordForm
                  loading={passwordLoading}
                  onFinish={handlePasswordUpdate}
                  onCancel={() => setActiveTab('password')}
                />
              </TabPane>
              
              <TabPane
                tab={
                  <span>
                    <SettingOutlined />
                    Account Settings
                  </span>
                }
                key="settings"
              >
                <p>Account settings and preferences coming soon.</p>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
