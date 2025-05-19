/**
 * Dashboard Component
 * 
 * Main financial overview page that displays:
 * 1. Summary cards with income, expenses, and balance totals
 * 2. Monthly income vs. expenses line chart
 * 3. Spending by category pie chart
 * 4. Top merchants bar chart
 * 5. Quick transaction entry form for adding new transactions
 * 
 * The dashboard data is automatically calculated from transaction history.
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Spin, 
  Divider,
  Space
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
import QuickTransactionEntry from '../components/QuickTransactionEntry';

const { Title } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector(state => state.transactions);
  
  // State for chart data
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topMerchants, setTopMerchants] = useState([]);

  // Colors for charts
  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#fa8c16'];

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

  /**
   * Process transaction data for monthly income/expense chart
   * 
   * Groups transactions by month, separates income and expenses,
   * and sorts chronologically.
   */
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

  /**
   * Process transaction data for category pie chart
   * 
   * Groups expenses by category and calculates total spending
   * for each category. Sorts by amount and limits to top 7 categories.
   */
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

  /**
   * Process transaction data for top merchants bar chart
   * 
   * Groups expenses by merchant and calculates total spending
   * for each. Sorts by amount and limits to top 5 merchants.
   */
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

  /**
   * Calculate financial summary statistics
   * 
   * Computes total income, expenses, and balance from all transactions
   * 
   * @returns {Object} Summary containing income, expenses, and balance
   */
  const calculateSummary = () => {
    if (!transactions.length) return { income: 0, expenses: 0, balance: 0 };
    
    return transactions.reduce((acc, transaction) => {
      const amount = Math.abs(parseFloat(transaction.amount));
      
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

  // Show loading spinner while transactions are being fetched
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '70vh' 
      }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header with Title and Quick Transaction Entry */}
      <Row align="middle" justify="space-between" style={{ marginBottom: '16px' }}>
        <Col>
          <Typography.Title level={2}>Financial Dashboard</Typography.Title>
        </Col>
        <Col>
          <QuickTransactionEntry 
            onSuccess={() => dispatch(fetchTransactions({}))} 
          />
        </Col>
      </Row>
      
      {/* Summary Cards */}
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
      
      <Divider />
      
      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Monthly Income vs Expenses Line Chart */}
        <Col xs={24} lg={12}>
          <Card title="Monthly Overview">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
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
        </Col>
        
        {/* Spending by Category Pie Chart */}
        <Col xs={24} lg={12}>
          <Card title="Spending by Category">
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
          </Card>
        </Col>
      </Row>
      
      <Divider />
      
      {/* Top Merchants Bar Chart */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
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
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
