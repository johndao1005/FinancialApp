/**
 * Navbar Component
 * 
 * Provides the main navigation interface for the application:
 * 1. Collapsible sidebar with links to main sections
 * 2. Responsive design that adapts to mobile and desktop
 * 3. User profile dropdown with logout functionality
 * 4. Visual indication of the current active page
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  TransactionOutlined,
  UploadOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DollarOutlined,
  FlagOutlined
} from '@ant-design/icons';
import { logout } from '../redux/slices/authSlice';

const { Header, Sider } = Layout;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  
  // UI state
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  /**
   * Handle window resize events to adjust for mobile/desktop layouts
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Handle user logout
   * Dispatches logout action and redirects to login page
   */
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const items = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/transactions',
      icon: <TransactionOutlined />,
      label: <Link to="/transactions">Transactions</Link>,
    },
    {
      key: '/budgets',
      icon: <DollarOutlined />,
      label: <Link to="/budgets">Budgets</Link>,
    },
    {
      key: '/goals',
      icon: <FlagOutlined />,
      label: <Link to="/goals">Goals</Link>,
    },
    {
      key: '/upload',
      icon: <UploadOutlined />,
      label: <Link to="/upload">Upload</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
  ];

  const userDropdownItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Logout</span>,
    },
  ];

  return (
    <Layout>
      {!isMobile && (
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          style={{ 
            height: '100vh', 
            position: 'fixed', 
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000
          }}
        >
          <div className="logo" style={{ 
            height: '64px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            color: 'white', 
            fontSize: collapsed ? '14px' : '20px',
            margin: '16px 0'
          }}>
            {collapsed ? 'SS' : 'SmartSpend'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={[location.pathname]}
            selectedKeys={[location.pathname]}
            items={items}
          />
        </Sider>
      )}
      <Layout className="site-layout" style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 200) }}>
        <Header
          style={{
            padding: 0,
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {isMobile ? (
            <>
              <div className="mobile-logo" style={{ marginLeft: 16, fontSize: '18px', fontWeight: 'bold' }}>
                SmartSpend
              </div>
              <Dropdown
                menu={{
                  items: [...items, ...userDropdownItems],
                }}
                trigger={['click']}
              >
                <Button type="text" icon={<MenuUnfoldOutlined />} style={{ marginRight: 16 }} />
              </Dropdown>
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
              <div style={{ marginRight: 24 }}>
                <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1677ff', cursor: 'pointer' }}
                  />
                </Dropdown>
              </div>
            </>
          )}
        </Header>
      </Layout>
    </Layout>
  );
};

export default Navbar;
