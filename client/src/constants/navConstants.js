/**
 * Navigation Constants
 * 
 * This file contains all navigation-related constants used throughout the app.
 * Centralizing these values makes it easier to maintain and update navigation
 * elements in one place.
 */
import {
  DashboardOutlined,
  TransactionOutlined,
  UploadOutlined,
  UserOutlined,
  DollarOutlined,
  FlagOutlined,
  LogoutOutlined
} from '@ant-design/icons';

/**
 * Main navigation routes
 * Used in both Navbar and App.js for consistent routing
 */
export const ROUTES = {
  DASHBOARD: {
    path: '/',
    name: 'Dashboard',
    icon: DashboardOutlined
  },
  TRANSACTIONS: {
    path: '/transactions',
    name: 'Transactions',
    icon: TransactionOutlined
  },
  BUDGETS: {
    path: '/budgets',
    name: 'Budgets',
    icon: DollarOutlined
  },
  GOALS: {
    path: '/goals',
    name: 'Goals',
    icon: FlagOutlined
  },
  UPLOAD: {
    path: '/upload',
    name: 'Upload',
    icon: UploadOutlined
  },
  PROFILE: {
    path: '/profile',
    name: 'Profile',
    icon: UserOutlined
  },
  LOGIN: {
    path: '/login',
    name: 'Login'
  },
  REGISTER: {
    path: '/register',
    name: 'Register'
  }
};

/**
 * Profile dropdown menu options
 */
export const USER_MENU_ITEMS = {
  PROFILE: {
    key: 'profile',
    icon: UserOutlined,
    label: 'Profile',
    path: ROUTES.PROFILE.path
  },
  LOGOUT: {
    key: 'logout',
    icon: LogoutOutlined,
    label: 'Logout'
  }
};

/**
 * App constants
 */
export const APP_CONSTANTS = {
  APP_NAME: 'SmartSpend',
  APP_SHORT_NAME: 'SS'
};
