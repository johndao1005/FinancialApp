/**
 * Asset Valuation Chart Component
 * 
 * Displays the historical and projected valuation of an asset over time,
 * including depreciation or appreciation patterns.
 */
import React from 'react';
import { Box, Card, CardContent, Typography, useTheme, ButtonGroup, Button } from '@mui/material';
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
import { generateValuationProjection, formatCurrency } from '../../../utils/assetUtils';

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

const ValuationChart = ({ 
  asset, 
  transactions = [], 
  projectionYears = 5, 
  showProjection = true 
}) => {
  const theme = useTheme();
  const [timeFrame, setTimeFrame] = React.useState('all'); // 'all', '1y', '5y', '10y'
  
  // Generate valuation data points
  const valuationData = React.useMemo(() => {
    // Clone asset and add transactions
    const assetWithTransactions = {
      ...asset,
      transactions: transactions.filter(t => t.transactionType === 'valuation_update')
    };
    
    return generateValuationProjection(assetWithTransactions, projectionYears);
  }, [asset, transactions, projectionYears]);
  
  // Filter data based on selected time frame
  const filteredData = React.useMemo(() => {
    if (timeFrame === 'all') return valuationData;
    
    const now = new Date();
    let cutoffDate;
    
    switch (timeFrame) {
      case '1y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case '5y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      case '10y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 10));
        break;
      default:
        return valuationData;
    }
    
    return valuationData.filter(dp => new Date(dp.date) >= cutoffDate);
  }, [valuationData, timeFrame]);
  
  // Separate historical data from projections
  const historicalData = filteredData.filter(dp => dp.isHistorical);
  const projectionData = showProjection ? filteredData.filter(dp => dp.isProjection) : [];
  
  // Format chart data
  const chartData = {
    labels: [...historicalData, ...projectionData].map(dp => {
      return new Date(dp.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      });
    }),
    datasets: [
      // Historical values
      {
        label: 'Historical Value',
        data: historicalData.map(dp => dp.value),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.main,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false
      },
      // Projected values
      ...(showProjection ? [{
        label: 'Projected Value',
        data: Array(historicalData.length).fill(null).concat(projectionData.map(dp => dp.value)),
        borderColor: theme.palette.grey[500],
        backgroundColor: theme.palette.grey[500],
        borderDash: [5, 5],
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false
      }] : [])
    ]
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: theme.palette.divider
        },
        ticks: {
          callback: (value) => formatCurrency(value, asset.currency)
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            const formattedValue = formatCurrency(value, asset.currency);
            
            // Add additional info for historical points
            if (context.datasetIndex === 0) {
              const dataPoint = historicalData[context.dataIndex];
              if (dataPoint?.notes) {
                return [`${label}: ${formattedValue}`, `Note: ${dataPoint.notes}`];
              }
            }
            
            return `${label}: ${formattedValue}`;
          },
          title: (tooltipItems) => {
            const date = tooltipItems[0].label;
            const pointIndex = tooltipItems[0].dataIndex;
            const isProjection = tooltipItems[0].datasetIndex === 1;
            
            if (isProjection) {
              return `${date} (Projected)`;
            }
            return date;
          }
        }
      }
    }
  };
  
  // Calculate appreciation/depreciation summary data
  const firstValue = historicalData.length > 0 ? historicalData[0].value : 0;
  const currentValue = asset.currentValue;
  const latestProjection = projectionData.length > 0 ? projectionData[projectionData.length - 1].value : currentValue;
  
  const totalChangeAmount = currentValue - firstValue;
  const totalChangePercent = firstValue > 0 ? (totalChangeAmount / firstValue) * 100 : 0;
  
  const projectedChangeAmount = latestProjection - currentValue;
  const projectedChangePercent = currentValue > 0 ? (projectedChangeAmount / currentValue) * 100 : 0;
  
  const isAssetAppreciating = totalChangePercent >= 0;
  
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Value {isAssetAppreciating ? 'Appreciation' : 'Depreciation'} Over Time
          </Typography>
          
          <ButtonGroup size="small" variant="outlined">
            <Button 
              onClick={() => setTimeFrame('1y')}
              variant={timeFrame === '1y' ? 'contained' : 'outlined'}
            >
              1Y
            </Button>
            <Button 
              onClick={() => setTimeFrame('5y')}
              variant={timeFrame === '5y' ? 'contained' : 'outlined'}
            >
              5Y
            </Button>
            <Button 
              onClick={() => setTimeFrame('all')}
              variant={timeFrame === 'all' ? 'contained' : 'outlined'}
            >
              All
            </Button>
          </ButtonGroup>
        </Box>
        
        <Box height={300} mb={3}>
          <Line data={chartData} options={chartOptions} />
        </Box>
        
        <Box display="flex" flexWrap="wrap" justifyContent="space-between">
          <Box flex="1" p={1} minWidth="200px">
            <Typography variant="subtitle2" color="textSecondary">
              Total {isAssetAppreciating ? 'Appreciation' : 'Depreciation'}
            </Typography>
            <Typography variant="h6" sx={{ 
              color: isAssetAppreciating ? 'success.main' : 'error.main'
            }}>
              {totalChangePercent.toFixed(2)}% 
              ({formatCurrency(Math.abs(totalChangeAmount), asset.currency)})
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Since {historicalData.length > 0 ? 
                new Date(historicalData[0].date).toLocaleDateString('en-US', { 
                  year: 'numeric', month: 'short' 
                }) : 'acquisition'}
            </Typography>
          </Box>
          
          {showProjection && (
            <Box flex="1" p={1} minWidth="200px">
              <Typography variant="subtitle2" color="textSecondary">
                Projected {projectedChangePercent >= 0 ? 'Appreciation' : 'Depreciation'}
              </Typography>
              <Typography variant="h6" sx={{ 
                color: projectedChangePercent >= 0 ? 'success.main' : 'error.main'
              }}>
                {projectedChangePercent.toFixed(2)}% 
                ({formatCurrency(Math.abs(projectedChangeAmount), asset.currency)})
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Next {projectionYears} years
              </Typography>
            </Box>
          )}
          
          <Box flex="1" p={1} minWidth="200px">
            <Typography variant="subtitle2" color="textSecondary">
              Annual Rate
            </Typography>
            <Typography variant="h6">
              {asset.annualRateOfReturn ? 
                `${asset.annualRateOfReturn}%` : 
                (asset.depreciationMethod !== 'none' ? 
                  `${(100 / asset.usefulLifeYears).toFixed(1)}% (depreciation)` : 
                  'Not specified')}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {asset.depreciationMethod === 'straight-line' ? 'Straight-Line Method' :
               asset.depreciationMethod === 'double-declining' ? 'Double-Declining Method' :
               asset.appreciationType === 'compound' ? 'Compound Growth' :
               asset.appreciationType === 'linear' ? 'Linear Growth' : 'Manual Valuation'}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ValuationChart;
