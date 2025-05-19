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
import { updateProfile, loadUser } from '../../redux/slices/authSlice';
import { USER_API } from '../../constants';

// Import components
import ProfileForm from './component/ProfileForm';
import PasswordForm from './component/PasswordForm';
import AccountInfo from './component/AccountInfo';

const { Title } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error: authError } = useSelector(state => state.auth);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);
  
  const handleProfileUpdate = async (values) => {
    setSuccess(null);
    setError(null);
    
    try {
      await dispatch(updateProfile(values)).unwrap();
      setSuccess('Profile updated successfully!');
      message.success('Profile updated successfully!');
      
      // Reload user data to get fresh data
      dispatch(loadUser());
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
      message.error('Failed to update profile. Please try again.');
    }
  };
  
  const handlePasswordUpdate = async (values) => {
    setPasswordLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      await axios.put(USER_API.PASSWORD, {
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
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    currency: user?.baseCurrency || 'USD',
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
