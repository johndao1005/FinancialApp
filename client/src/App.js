import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider, Layout, theme } from 'antd';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Login from './pages/Login';
import Register from './pages/Register';
import UploadStatement from './pages/UploadStatement';
import Profile from './pages/Profile';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import './styles/App.css';

const { Content } = Layout;

function App() {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff', // Custom primary color
          borderRadius: 6,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {isAuthenticated ? (
          <>
            <Navbar />
            <Layout className="site-layout">
              <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, overflow: 'initial' }}>
                <Routes>
                  <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/upload" element={<UploadStatement />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/budgets" element={<Budgets />} />
                    <Route path="/goals" element={<Goals />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Content>
            </Layout>
          </>
        ) : (
          <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </Content>
        )}
      </Layout>
    </ConfigProvider>
  );
}

export default App;
