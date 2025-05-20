/**
 * Income Prediction & Analysis Page
 * 
 * This page provides income trend visualization, prediction and analysis features:
 * - Displays monthly income trends
 * - Shows income prediction for future months
 * - Provides income source analysis
 * - Allows management of income predictions
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, Tabs, Spin, Alert, Row, Col, Typography, Button, Space, Tooltip 
} from 'antd';
import { 
  ReloadOutlined, 
  CalendarOutlined, 
  LineChartOutlined, 
  ThunderboltOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { fetchIncomeTrends, fetchIncomePredictions, fetchIncomeSources, generateIncomePredictions } from '../../redux/slices/incomePredictionSlice';

// Import components
import IncomeTrendChart from './components/IncomeTrendChart';
import IncomePredictionTable from './components/IncomePredictionTable';
import IncomeSourcesChart from './components/IncomeSourcesChart';
import IncomeStatsCards from './components/IncomeStatsCards';
import IncomeGeneratorForm from './components/IncomeGeneratorForm';
import SkeletonLoader from '../../components/SkeletonLoader';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const IncomePage = () => {
  const dispatch = useDispatch();
  const { 
    trends, 
    predictions, 
    sources,
    loading,
    trendLoading,
    predictionLoading,
    error,
    summary
  } = useSelector(state => state.incomePrediction);
  
  const [activeTab, setActiveTab] = useState('trends');
  const [showGenerator, setShowGenerator] = useState(false);
  
  // Load data on initial component mount
  useEffect(() => {
    loadPageData();
  }, []);
  
  // Function to load all income data
  const loadPageData = () => {
    dispatch(fetchIncomeTrends());
    dispatch(fetchIncomePredictions());
    dispatch(fetchIncomeSources());
  };
  
  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // Toggle prediction generator form
  const toggleGenerator = () => {
    setShowGenerator(!showGenerator);
  };
  
  // Handle generator form submission
  const handleGeneratePredictions = (values) => {
    dispatch(generateIncomePredictions(values))
      .unwrap()
      .then(() => {
        setShowGenerator(false);
      });
  };
  
  return (
    <div className="income-page">
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Title level={2}>Income Analysis & Prediction</Title>
          <Text type="secondary">
            Track your income patterns and predict future earnings
          </Text>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
          <Space>
            <Tooltip title="Refresh Data">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadPageData}
                loading={loading}
              >
                Refresh
              </Button>
            </Tooltip>
            <Tooltip title="Generate income predictions based on your historical data">
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={toggleGenerator}
              >
                Generate Predictions
              </Button>
            </Tooltip>
          </Space>
        </Col>
      </Row>
      
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      {showGenerator && (
        <Card style={{ marginBottom: 16 }}>
          <IncomeGeneratorForm 
            onSubmit={handleGeneratePredictions}
            onCancel={toggleGenerator}
            sources={sources}
            loading={loading}
          />
        </Card>
      )}
      
      <Tabs 
        activeKey={activeTab} 
        onChange={handleTabChange}
        tabPosition="top"
        style={{ marginBottom: 16 }}
      >
        <TabPane 
          tab={
            <span>
              <LineChartOutlined />
              Income Trends
            </span>
          } 
          key="trends"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              {trendLoading ? (
                <SkeletonLoader type="chart" />
              ) : (
                <Card title="Monthly Income Trend">
                  <IncomeTrendChart data={trends.monthlyIncome} />
                </Card>
              )}
            </Col>
            <Col xs={24} lg={8}>
              {trendLoading ? (
                <SkeletonLoader type="card" />
              ) : (
                <IncomeStatsCards stats={trends.stats} />
              )}
            </Col>
            <Col xs={24} md={12}>
              {trendLoading ? (
                <SkeletonLoader type="chart" />
              ) : (
                <Card title="Income Sources">
                  <IncomeSourcesChart data={trends.topSources} />
                </Card>
              )}
            </Col>
            <Col xs={24} md={12}>
              {trendLoading ? (
                <SkeletonLoader type="chart" />
              ) : (
                <Card 
                  title={
                    <Space>
                      <span>Income Stability Analysis</span>
                      <Tooltip title="Higher score means more stable and predictable income">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </Space>
                  }
                >
                  {/* Add income stability visualization component here */}
                  <div style={{ minHeight: 300 }}>
                    {/* Will be implemented in a later PR */}
                    <Alert
                      message="Income Stability Score"
                      description={
                        trends.stats?.stabilityScore 
                          ? `Your income stability score is ${trends.stats.stabilityScore}/100`
                          : 'Insufficient data to calculate stability score'
                      }
                      type="info"
                    />
                  </div>
                </Card>
              )}
            </Col>
          </Row>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <CalendarOutlined />
              Income Predictions
            </span>
          } 
          key="predictions"
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              {predictionLoading ? (
                <SkeletonLoader type="table" />
              ) : (
                <Card 
                  title="Income Predictions" 
                  extra={
                    <Tooltip title="Predictions are based on your historical income patterns">
                      <InfoCircleOutlined />
                    </Tooltip>
                  }
                >
                  <IncomePredictionTable 
                    predictions={predictions}
                    loading={loading}
                  />
                </Card>
              )}
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default IncomePage;
