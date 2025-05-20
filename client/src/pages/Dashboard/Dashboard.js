/**
 * Dashboard Component
 * 
 * Main financial overview page that displays:
 * 1. Summary cards with income, expenses, and balance totals
 * 2. Monthly income vs. expenses line chart
 * 3. Spending by category pie chart
 * 4. Quick transaction entry form for adding new transactions
 * 5. Recent transactions table
 * 
 * The dashboard data is automatically calculated from transaction history.
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Row, 
  Col, 
  Typography, 
  Spin, 
  Divider,
  Tag
} from 'antd';
import { fetchTransactions } from '../../redux/slices/transactionSlice';
import { fetchAssets, fetchNetWorth } from '../../redux/slices/assetSlice';
import QuickTransactionEntry from '../../components/QuickTransactionEntry';
import AssetSummary from '../../components/Assets/AssetSummary';

// Import component modules
import SummaryCards from './component/SummaryCards';
import MonthlyOverviewChart from './component/MonthlyOverviewChart';
import CategoryPieChart from './component/CategoryPieChart';
import RecentTransactionsTable from './component/RecentTransactionsTable';
import TimeFrameSelector from './component/TimeFrameSelector';

const { Title } = Typography;

const Dashboard = () => {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector(state => state.transactions);
  const { assets, netWorth, loading: assetLoading } = useSelector(state => state.assets);
  
  // State for chart data
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [timeFrame, setTimeFrame] = useState('month'); // 'week', 'month', 'year'

  // Colors for charts
  const COLORS = ['#1677ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2', '#fa8c16'];
  useEffect(() => {
    // Fetch transactions on component mount
    dispatch(fetchTransactions({ limit: 100 })); // Increase limit to get more data for filtering
    
    // Fetch asset data for the dashboard
    dispatch(fetchAssets());
    dispatch(fetchNetWorth());
  }, [dispatch]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Process data for charts
      processMonthlyData();
      processCategoryData();
      processRecentTransactions();
    }
  }, [transactions, timeFrame]);

  /**
   * Process transaction data for monthly income/expense chart
   * 
   * Groups transactions by month, separates income and expenses,
   * and sorts chronologically.
   */
  const processMonthlyData = () => {
    // Get date range based on the selected time frame
    const { startDate, endDate } = getDateRange();
    
    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // Group transactions by month
    const monthlyMap = filteredTransactions.reduce((acc, transaction) => {
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
   * Process transaction data for category pie chart
   * 
   * Groups expenses by category and calculates total spending
   * for each category. Sorts by amount and limits to top 7 categories.
   */
  const processCategoryData = () => {
    // Get date range based on the selected time frame
    const { startDate, endDate } = getDateRange();
    
    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // Group transactions by category
    const categoryMap = filteredTransactions.reduce((acc, transaction) => {
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
   * Calculate financial summary statistics
   * 
   * Computes total income, expenses, and balance from all transactions
   * within the selected time frame
   * 
   * @returns {Object} Summary containing income, expenses, and balance
   */
  const calculateSummary = () => {
    if (!transactions.length) return { income: 0, expenses: 0, balance: 0 };
    
    // Get date range based on the selected time frame
    const { startDate, endDate } = getDateRange();
    
    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    return filteredTransactions.reduce((acc, transaction) => {
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

  /**
   * Process top 10 recent transactions for the table
   */
  const processRecentTransactions = () => {
    // Get date range based on the selected time frame
    const { startDate, endDate } = getDateRange();
    
    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    const formattedTransactions = filteredTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(transaction => ({
        key: transaction.id,
        id: transaction.id,
        date: new Date(transaction.date).toLocaleDateString(),
        description: transaction.description || 'No description',
        category: transaction.category ? transaction.category.name : 'Uncategorized',
        amount: parseFloat(transaction.amount).toFixed(2),
        isExpense: transaction.isExpense
      }));
    
    setRecentTransactions(formattedTransactions);
  };

  /**
   * Handle time frame change
   */
  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
  };

  // Columns for the recent transactions table
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <span style={{ color: record.isExpense ? '#f5222d' : '#52c41a' }}>
          {record.isExpense ? '-' : '+'} ${text}
        </span>
      )
    }
  ];

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
      
      {/* Time Frame Selector */}
      <Row style={{ marginBottom: '16px' }}>
        <Col>
          <TimeFrameSelector 
            timeFrame={timeFrame}
            onChange={handleTimeFrameChange}
          />
        </Col>
      </Row>
      
      {/* Summary Cards */}
      <SummaryCards 
        income={income}
        expenses={expenses}
        balance={balance}
      />
      
      <Divider />
      
      {/* Charts and Asset Summary */}
      <Row gutter={[16, 16]}>
        {/* Monthly Income vs Expenses Line Chart */}
        <Col xs={24} lg={12}>
          <MonthlyOverviewChart data={monthlyData} />
        </Col>
        
        {/* Spending by Category Pie Chart */}
        <Col xs={24} lg={12}>
          <CategoryPieChart data={categoryData} colors={COLORS} />
        </Col>
        
        {/* Asset Summary */}
        <Col xs={24} lg={12}>
          <AssetSummary 
            netWorth={netWorth?.current || 0} 
            assets={assets} 
            loading={assetLoading} 
          />
        </Col>
      </Row>
      
      <Divider />
      
      {/* Recent Transactions Table */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <RecentTransactionsTable transactions={recentTransactions} />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
