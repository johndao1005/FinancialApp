/**
 * Net Worth Chart Component
 * 
 * Displays historical net worth data in a line chart
 * to visualize wealth growth over time.
 */
import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography,
  useTheme
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const NetWorthChart = ({ historicalData = [] }) => {
  const theme = useTheme();
  
  // Format data for chart
  const chartData = {
    labels: historicalData.map(item => {
      // Convert YYYY-MM to Month Year format
      const [year, month] = item.month.split('-');
      return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }),
    datasets: [
      {
        label: 'Net Worth',
        data: historicalData.map(item => item.value),
        fill: 'start',
        backgroundColor: `${theme.palette.primary.main}20`, // Semi-transparent primary color
        borderColor: theme.palette.primary.main,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: theme.palette.primary.main
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: theme.palette.divider
        },
        ticks: {
          callback: (value) => {
            return '$' + value.toLocaleString('en-US');
          }
        }
      },
      x: {
        grid: {
          color: theme.palette.divider
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            }
            return label;
          }
        }
      }
    }
  };
  
  // Calculate net worth growth
  const calculateGrowth = () => {
    if (historicalData.length < 2) return { amount: 0, percentage: 0 };
    
    const oldestValue = historicalData[0].value;
    const newestValue = historicalData[historicalData.length - 1].value;
    const growthAmount = newestValue - oldestValue;
    const growthPercentage = oldestValue !== 0 
      ? (growthAmount / oldestValue) * 100 
      : 0;
    
    return {
      amount: growthAmount,
      percentage: growthPercentage
    };
  };
  
  const growth = calculateGrowth();
  
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Net Worth Trend</Typography>
          
          <Box textAlign="right">
            <Typography 
              variant="subtitle1" 
              color={growth.amount >= 0 ? 'success.main' : 'error.main'}
            >
              {growth.amount >= 0 ? '+' : ''}
              ${Math.abs(growth.amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              {' '}
              ({growth.percentage >= 0 ? '+' : ''}
              {growth.percentage.toFixed(2)}%)
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {historicalData.length > 0 && 
                `${historicalData[0].month.replace('-', ' ')} - Present`}
            </Typography>
          </Box>
        </Box>
        
        <Box height={300}>
          {historicalData.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <Box 
              height="100%" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Typography color="textSecondary">
                No historical data available
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NetWorthChart;
