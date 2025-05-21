/**
 * Navbar Component
 * 
 * Provides the main navigation interface for the application:
 * 1. Collapsible sidebar with links to main sections
 * 2. Responsive design that adapts to mobile and desktop
 * 3. User profile dropdown with logout functionality
 * 4. Visual indication of the current active page
 * 5. Quick transaction entry button for adding transactions from anywhere
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import { MenuFoldOutlined, UserOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { logout } from '../redux/slices/authSlice';
import { 
  ROUTES, 
  USER_MENU_ITEMS, 
  APP_CONSTANTS, 
  UI_SIZES, 
  BREAKPOINTS 
} from '../constants';
import QuickTransactionEntry from './QuickTransactionEntry';

const { Header, Sider } = Layout;

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(state => state.auth);
  
  // UI state
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= BREAKPOINTS.MD);
  /**
   * Handle window resize events to adjust for mobile/desktop layouts
   */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= BREAKPOINTS.MD);
    };

    // Add debouncing to avoid excessive rendering on resize
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  /**
   * Handle user logout
   * Dispatches logout action and redirects to login page
   */  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  /**
   * Handle successful transaction creation
   * Navigates to transactions page to show the newly added transaction
   */
  const handleTransactionSuccess = useCallback(() => {
    navigate('/transactions');
  }, [navigate]);
  // Generate navigation items from constants - memoize to prevent recalculation
  const items = useMemo(() => Object.values(ROUTES)
    .filter(route => route.path !== '/login' && route.path !== '/register')
    .map(route => ({
      key: route.path,
      icon: <route.icon />,
      label: <Link to={route.path}>{route.name}</Link>,
    })), []);

  // Generate user dropdown items from constants - memoize to prevent recalculation 
  const userDropdownItems = useMemo(() => [
    {
      key: USER_MENU_ITEMS.PROFILE.key,
      icon: <USER_MENU_ITEMS.PROFILE.icon />,
      label: <Link to={USER_MENU_ITEMS.PROFILE.path}>{USER_MENU_ITEMS.PROFILE.label}</Link>,
    },
    {
      key: USER_MENU_ITEMS.LOGOUT.key,
      icon: <USER_MENU_ITEMS.LOGOUT.icon />,
      label: <span onClick={handleLogout}>{USER_MENU_ITEMS.LOGOUT.label}</span>,
    },
  ], [handleLogout]);

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
            {collapsed ? APP_CONSTANTS.APP_SHORT_NAME : APP_CONSTANTS.APP_NAME}
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
      <Layout className="site-layout" style={{ marginLeft: isMobile ? 0 : (collapsed ? UI_SIZES.SIDEBAR_COLLAPSED_WIDTH : UI_SIZES.SIDEBAR_WIDTH) }}>
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
                {APP_CONSTANTS.APP_NAME}
              </div>
              <Space>
                <QuickTransactionEntry onSuccess={handleTransactionSuccess} />
                <Dropdown
                  menu={{
                    items: [...items, ...userDropdownItems],
                  }}
                  trigger={['click']}
                >
                  <Button type="text" icon={<MenuUnfoldOutlined />} style={{ marginRight: 16 }} />
                </Dropdown>
              </Space>
            </>
          ) : (
            <>
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
              <Space style={{ marginRight: 24 }}>
                <QuickTransactionEntry onSuccess={handleTransactionSuccess} />
                <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
                  <Avatar 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#1677ff', cursor: 'pointer' }}
                  />
                </Dropdown>
              </Space>
            </>
          )}
        </Header>
      </Layout>
    </Layout>
  );
};

export default React.memo(Navbar);
