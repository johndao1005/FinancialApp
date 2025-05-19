import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons';

/**
 * SummaryCards Component
 * 
 * Displays summary statistics for income, expenses, and balance
 */
const SummaryCards = ({ income, expenses, balance }) => {
  return (
    <Row gutter={[16, 16]}>
      {/* Income Card */}
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Total Income"
            value={income}
            precision={2}
            valueStyle={{ color: '#52c41a' }}
            prefix={<ArrowUpOutlined />}
            suffix="$"
          />
        </Card>
      </Col>
      
      {/* Expenses Card */}
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Total Expenses"
            value={expenses}
            precision={2}
            valueStyle={{ color: '#f5222d' }}
            prefix={<ArrowDownOutlined />}
            suffix="$"
          />
        </Card>
      </Col>
      
      {/* Balance Card */}
      <Col xs={24} sm={8}>
        <Card>
          <Statistic
            title="Balance"
            value={balance}
            precision={2}
            valueStyle={{ color: balance >= 0 ? '#52c41a' : '#f5222d' }}
            prefix={<DollarOutlined />}
            suffix="$"
          />
        </Card>
      </Col>
    </Row>
  );
};

export default SummaryCards;
