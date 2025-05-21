/**
 * Asset Summary Component
 * 
 * Displays a summary of asset information for the dashboard:
 * - Total net worth
 * - Asset allocation breakdown
 * - Top performing assets
 */
import React from 'react';
import { Card, Row, Col, Statistic, List, Typography, Tag, Progress, Divider } from 'antd';
import { BankOutlined, RiseOutlined, FallOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants/navConstants';

const { Title, Text } = Typography;

const AssetSummary = ({ netWorth, assets, loading }) => {
  const navigate = useNavigate();

  // Get top assets (by value)
  const topAssets = [...assets]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 3);

  // Get best performing assets (by percentage gain)
  const bestPerformers = [...assets]
    .filter(asset => asset.initialValue > 0)
    .map(asset => ({
      ...asset,
      percentageChange: ((asset.currentValue - asset.initialValue) / asset.initialValue) * 100
    }))
    .sort((a, b) => b.percentageChange - a.percentageChange)
    .slice(0, 3);

  const handleViewAllClick = () => {
    navigate(ROUTES.ASSETS.path);
  };

  // Get human-readable asset type
  const getAssetTypeName = (type) => {
    switch (type) {
      case 'property': return 'Real Estate';
      case 'stock': return 'Stock';
      case 'crypto': return 'Crypto';
      case 'term_deposit': return 'Term Deposit';
      default: return 'Other';
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card 
      title={<Title level={5}>Asset Overview</Title>}
      extra={<a onClick={handleViewAllClick}>View All</a>}
      loading={loading}
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Statistic
            title="Net Worth"
            value={netWorth}
            precision={0}
            valueStyle={{ color: '#1677ff' }}
            prefix={<BankOutlined />}
            suffix="$"
          />
        </Col>
      </Row>

      <Divider />

      {assets.length > 0 ? (
        <>
          <Title level={5}>Top Assets</Title>
          <List
            size="small"
            dataSource={topAssets}
            renderItem={asset => (
              <List.Item
                extra={formatCurrency(asset.currentValue)}
              >
                <Text strong>{asset.name}</Text>
                <br />
                <Text type="secondary">{getAssetTypeName(asset.assetType)}</Text>
              </List.Item>
            )}
          />

          <Divider />

          <Title level={5}>Best Performers</Title>
          <List
            size="small"
            dataSource={bestPerformers}
            renderItem={asset => {
              const isPositive = asset.percentageChange >= 0;
              return (
                <List.Item
                  extra={
                    <Tag color={isPositive ? 'success' : 'error'}>
                      {isPositive ? <RiseOutlined /> : <FallOutlined />}
                      {' '}
                      {asset.percentageChange.toFixed(1)}%
                    </Tag>
                  }
                >
                  <Text strong>{asset.name}</Text>
                </List.Item>
              );
            }}
          />
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Text type="secondary">No assets found. Add assets to track your wealth.</Text>
          <br />
          <a onClick={handleViewAllClick} style={{ marginTop: 8, display: 'inline-block' }}>
            Add Assets
          </a>
        </div>
      )}
    </Card>
  );
};

export default AssetSummary;
