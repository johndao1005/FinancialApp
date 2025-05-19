import React from 'react';
import { Card, Space, Radio } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

/**
 * TimeFrameSelector Component
 * 
 * Displays time frame selection controls for dashboard data filtering
 */
const TimeFrameSelector = ({ timeFrame, onChange }) => {
  return (
    <Card>
      <Space>
        <CalendarOutlined />
        <span>Time Frame:</span>
        <Radio.Group 
          value={timeFrame} 
          onChange={onChange}
        >
          <Radio.Button value="week">Last 7 Days</Radio.Button>
          <Radio.Button value="month">Last Month</Radio.Button>
          <Radio.Button value="year">Last Year</Radio.Button>
        </Radio.Group>
      </Space>
    </Card>
  );
};

export default TimeFrameSelector;
