/**
 * Income Trend Chart Component
 * 
 * Visualizes historical income data over time with a line chart
 */
import React from 'react';
import { Empty, Typography } from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const { Text } = Typography;

const IncomeTrendChart = ({ data = [] }) => {
  // Format data for the chart
  const formattedData = data.map(item => ({
    ...item,
    formattedMonth: new Date(item.month + '-01').toLocaleDateString('en-US', { 
      month: 'short',
      year: 'numeric'
    })
  }));
  
  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <Text strong>{label}</Text>
          <p>{`Income: $${payload[0].value.toFixed(2)}`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  if (!data || data.length === 0) {
    return (
      <Empty 
        description="No income data available" 
        style={{ margin: '40px 0' }}
      />
    );
  }
  
  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedMonth"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={value => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Income"
            stroke="#52c41a"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeTrendChart;
