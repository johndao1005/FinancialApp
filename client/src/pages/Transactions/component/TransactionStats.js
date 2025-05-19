import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic,
  Radio,
  Divider
} from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import TopMerchantsChart from '../../../components/TopMerchantsChart';

const TransactionStats = ({ 
  transactions,
  timeFrame,
  onTimeFrameChange
}) => {
  // Calculate summary statistics
  const income = transactions
    ?.filter(t => t.amount > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    
  const expenses = transactions
    ?.filter(t => t.amount < 0)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;
    
  const balance = income + expenses;

  // Get time frame label
  const getTimeFrameLabel = () => {
    switch(timeFrame) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Current Period';
    }
  };

  return (
    <div className="transaction-stats">
      <Card>
        <Row gutter={16} align="middle">
          <Col span={16}>
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Income"
                  value={income}
                  precision={2}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                  suffix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Expenses"
                  value={Math.abs(expenses)}
                  precision={2}
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ArrowDownOutlined />}
                  suffix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Balance"
                  value={balance}
                  precision={2}
                  valueStyle={{ color: balance >= 0 ? '#3f8600' : '#cf1322' }}
                  suffix="$"
                />
              </Col>
            </Row>
          </Col>
          
          <Col span={8}>
            <div style={{ textAlign: 'right' }}>
              <Radio.Group 
                value={timeFrame} 
                onChange={e => onTimeFrameChange(e.target.value)}
                optionType="button"
                buttonStyle="solid"
              >
                <Radio.Button value="week">Week</Radio.Button>
                <Radio.Button value="month">Month</Radio.Button>
                <Radio.Button value="year">Year</Radio.Button>
              </Radio.Group>
            </div>
          </Col>
        </Row>
        
        <Divider />
        
        <Row>
          <Col span={24}>
            <TopMerchantsChart 
              transactions={transactions} 
              title={`Top Merchants (${getTimeFrameLabel()})`}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TransactionStats;
