/**
 * Income Sources Chart Component
 * 
 * Visualizes the breakdown of income by source using a pie/donut chart
 */
import React from 'react';
import { Empty, Typography } from 'antd';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip 
} from 'recharts';

const { Text } = Typography;

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a480cf'];

const IncomeSourcesChart = ({ data = [] }) => {
  // Format data for the chart
  const formattedData = data.map((source, index) => ({
    name: source.source,
    value: source.total,
    percentage: source.percentage,
    color: COLORS[index % COLORS.length]
  }));
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <Text strong>{payload[0].name}</Text>
          <p>{`Amount: $${payload[0].value.toFixed(2)}`}</p>
          <p>{`Percentage: ${payload[0].payload.percentage}%`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  if (!data || data.length === 0) {
    return (
      <Empty 
        description="No income source data available" 
        style={{ margin: '40px 0' }}
      />
    );
  }
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percentage }) => `${name} (${percentage}%)`}
            labelLine={false}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeSourcesChart;
