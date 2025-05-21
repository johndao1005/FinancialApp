/**
 * Asset Allocation Chart Component
 * 
 * Displays the distribution of assets across different asset types
 * using a doughnut/pie chart.
 */
import React from 'react';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// Get human-readable asset type name
const getAssetTypeName = (type) => {
  switch (type) {
    case 'property':
      return 'Real Estate';
    case 'stock':
      return 'Stocks';
    case 'crypto':
      return 'Crypto';
    case 'term_deposit':
      return 'Term Deposits';
    default:
      return 'Other';
  }
};

const AssetAllocationChart = ({ allocation = {} }) => {
  const theme = useTheme();
  
  // Define chart colors
  const chartColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    theme.palette.grey[500]
  ];
  
  // Format data for chart
  const chartData = {
    labels: Object.keys(allocation).map(type => getAssetTypeName(type)),
    datasets: [
      {
        data: Object.values(allocation),
        backgroundColor: Object.keys(allocation).map((_, index) => 
          chartColors[index % chartColors.length]
        ),
        borderWidth: 1
      }
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value.toFixed(1)}%`;
          }
        }
      }
    },
    cutout: '60%'
  };
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Asset Allocation
        </Typography>
        
        <Box height={240} position="relative">
          {Object.keys(allocation).length > 0 ? (
            <Doughnut data={chartData} options={chartOptions} />
          ) : (
            <Box 
              height="100%" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Typography color="textSecondary">
                No allocation data available
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AssetAllocationChart;
