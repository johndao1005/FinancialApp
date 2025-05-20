/**
 * Income Stats Cards Component
 * 
 * Displays key income statistics in card format:
 * - Average monthly income
 * - Growth rate
 * - Stability score
 * - Income frequency
 */
import React from 'react';
import { Card, Statistic, Row, Col, Tooltip, Progress } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  InfoCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  LineChartOutlined,
  BranchesOutlined
} from '@ant-design/icons';

const IncomeStatsCards = ({ stats = {} }) => {
  const {
    averageMonthlyIncome = 0,
    growthRate = 0,
    stabilityScore = 0,
    incomeFrequency = 'irregular',
    diversificationScore = 0
  } = stats;
  
  // Format income frequency for display
  const formatFrequency = (frequency) => {
    if (frequency === 'insufficient-data') return 'Insufficient Data';
    if (frequency === 'irregular') return 'Irregular';
    if (frequency === 'weekly') return 'Weekly';
    if (frequency === 'biweekly') return 'Bi-weekly';
    if (frequency === 'monthly') return 'Monthly';
    
    // Handle day-of-month pattern
    if (frequency && frequency.startsWith('monthly-day-')) {
      const day = frequency.split('-')[2];
      return `Monthly (Day ${day})`;
    }
    
    return frequency;
  };
  
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card size="small">
            <Statistic
              title="Average Monthly Income"
              value={averageMonthlyIncome}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12}>
          <Card size="small">
            <Statistic
              title="Income Growth Rate"
              value={growthRate}
              precision={1}
              valueStyle={{ color: growthRate >= 0 ? '#3f8600' : '#cf1322' }}
              prefix={growthRate >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12}>
          <Card 
            size="small"
            extra={
              <Tooltip title="How consistent and predictable your income is. Higher is better.">
                <InfoCircleOutlined />
              </Tooltip>
            }
          >
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><LineChartOutlined /> Stability Score</span>
                <span>{stabilityScore}/100</span>
              </div>
            </div>
            <Progress 
              percent={stabilityScore} 
              status={stabilityScore < 40 ? "exception" : "active"}
              showInfo={false}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#52c41a',
              }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12}>
          <Card size="small">
            <Statistic
              title="Income Frequency"
              value={formatFrequency(incomeFrequency)}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={24}>
          <Card 
            size="small"
            extra={
              <Tooltip title="Higher score means more diversified income sources, which reduces financial risk">
                <InfoCircleOutlined />
              </Tooltip>
            }
          >
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><BranchesOutlined /> Income Diversification</span>
                <span>{diversificationScore}/100</span>
              </div>
            </div>
            <Progress 
              percent={diversificationScore} 
              status={diversificationScore < 30 ? "exception" : "active"}
              showInfo={false}
              strokeColor={{
                '0%': '#faad14',
                '100%': '#52c41a',
              }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default IncomeStatsCards;
