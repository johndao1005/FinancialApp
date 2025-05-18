import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

const Profile = () => {
  const { user } = useSelector(state => state.auth);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    baseCurrency: 'USD'
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        baseCurrency: user.baseCurrency || 'USD'
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/profile', profileData, {
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

  const changePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      setLoading(false);
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters'
      });
      setLoading(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
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
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
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
    <div className="profile-page">
      <h1>User Profile</h1>
      
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message.text}
        </div>
      )}
      
      <div className="row">
        {/* Profile Information */}
        <div className="col">
          <div className="card">
            <div className="card-header">
              <h3>Profile Information</h3>
            </div>
            
            <form onSubmit={updateProfile}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="form-control"
                  disabled // Email cannot be changed for security reasons
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Base Currency</label>
                <select
                  name="baseCurrency"
                  value={profileData.baseCurrency}
                  onChange={handleProfileChange}
                  className="form-control"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="btn"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Change Password */}
        <div className="col">
          <div className="card">
            <div className="card-header">
              <h3>Change Password</h3>
            </div>
            
            <form onSubmit={changePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="form-control"
                />
              </div>
              
              <button
                type="submit"
                className="btn"
                disabled={loading}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
          
          {/* Account Status */}
          <div className="card">
            <div className="card-header">
              <h3>Account Status</h3>
            </div>
            
            <div className="account-status">
              <p>
                <strong>Account Type:</strong>{' '}
                {user?.isPremium ? 'Premium' : 'Free'}
              </p>
              
              {!user?.isPremium && (
                <button className="btn">
                  Upgrade to Premium
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
