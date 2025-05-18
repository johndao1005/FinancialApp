import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Spin, 
  Divider 
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  DollarOutlined 
} from '@ant-design/icons';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { fetchTransactions } from '../redux/slices/transactionSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector(state => state.transactions);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57', '#8884d8'];

  useEffect(() => {
    // Fetch transactions on component mount
    dispatch(fetchTransactions({}));
  }, [dispatch]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Process data for charts
      processMonthlyData();
      processCategoryData();
      processTopMerchants();
    }
  }, [transactions]);

  const processMonthlyData = () => {
    // Group transactions by month
    const monthlyMap = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          name: monthYear,
          income: 0,
          expenses: 0
        };
      }
      
      if (transaction.isExpense) {
        acc[monthYear].expenses += parseFloat(transaction.amount);
      } else {
        acc[monthYear].income += parseFloat(transaction.amount);
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    const result = Object.values(monthlyMap).sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/').map(Number);
      const [bMonth, bYear] = b.name.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
    
    setMonthlyData(result);
  };

  const processCategoryData = () => {
    // Group transactions by category
    const categoryMap = transactions.reduce((acc, transaction) => {
      if (transaction.isExpense) {
        const categoryName = transaction.category ? transaction.category.name : 'Uncategorized';
        
        if (!acc[categoryName]) {
          acc[categoryName] = {
            name: categoryName,
            value: 0
          };
        }
        
        acc[categoryName].value += parseFloat(transaction.amount);
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by amount
    const result = Object.values(categoryMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 7); // Top 7 categories
    
    setCategoryData(result);
  };

  const processTopMerchants = () => {
    // Group transactions by merchant
    const merchantMap = transactions.reduce((acc, transaction) => {
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

  // Calculate totals and summary data
  const calculateSummary = () => {
    if (!transactions.length) return { income: 0, expenses: 0, balance: 0 };
    
    return transactions.reduce((acc, transaction) => {
      const amount = parseFloat(transaction.amount);
      
      if (transaction.isExpense) {
        acc.expenses += amount;
      } else {
        acc.income += amount;
      }
      
      acc.balance = acc.income - acc.expenses;
      return acc;
    }, { income: 0, expenses: 0, balance: 0 });
  };

  const { income, expenses, balance } = calculateSummary();

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Financial Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Total Income</h3>
            <div className="amount positive">${income.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="col">
          <div className="card">
            <h3>Total Expenses</h3>
            <div className="amount negative">${expenses.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="col">
          <div className="card">
            <h3>Balance</h3>
            <div className={`amount ${balance >= 0 ? 'positive' : 'negative'}`}>
              ${balance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="row">
        {/* Monthly Income vs Expenses */}
        <div className="col">
          <div className="card">
            <h3>Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#2ecc71" name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#e74c3c" name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Spending by Category */}
        <div className="col">
          <div className="card">
            <h3>Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Top Merchants */}
      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Top Merchants</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topMerchants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                <Bar dataKey="amount" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
