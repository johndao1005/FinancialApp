import React from 'react';
import { Card } from 'antd';
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

/**
 * MonthlyOverviewChart Component
 * 
 * Displays a line chart showing monthly income vs. expenses
 */
const MonthlyOverviewChart = ({ data }) => {
  return (
    <Card title="Monthly Overview">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="#52c41a" name="Income" />
          <Line type="monotone" dataKey="expenses" stroke="#f5222d" name="Expenses" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default MonthlyOverviewChart;
