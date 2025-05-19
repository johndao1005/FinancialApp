/**
 * TopMerchantsChart Component
 * 
 * Displays a bar chart of the top merchants by expense amount.
 * Can be filtered by different time frames (week, month, year).
 */
import React, { useState, useEffect } from 'react';
import { Card, Row, Col } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const TopMerchantsChart = ({ transactions, timeFrame }) => {
  const [topMerchants, setTopMerchants] = useState([]);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      processTopMerchants();
    }
  }, [transactions, timeFrame]);

  /**
   * Get the date range based on selected timeframe
   * 
   * @returns {Object} startDate and endDate objects
   */
  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();
    
    switch(timeFrame) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1);
    }
    
    return { startDate, endDate };
  };

  /**
   * Process transaction data for top merchants bar chart
   * 
   * Groups expenses by merchant and calculates total spending
   * for each. Sorts by amount and limits to top 5 merchants.
   */
  const processTopMerchants = () => {
    // Get date range based on the selected time frame
    const { startDate, endDate } = getDateRange();
    
    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // Group transactions by merchant
    const merchantMap = filteredTransactions.reduce((acc, transaction) => {
      if (transaction.isExpense && transaction.merchant) {
        if (!acc[transaction.merchant]) {
          acc[transaction.merchant] = {
            name: transaction.merchant,
            amount: 0
          };
        }
        
        acc[transaction.merchant].amount += parseFloat(transaction.amount);
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by amount
    const result = Object.values(merchantMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 merchants
    
    setTopMerchants(result);
  };

  return (
    <Card title="Top Merchants">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topMerchants}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          <Bar dataKey="amount" fill="#1677ff" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TopMerchantsChart;
