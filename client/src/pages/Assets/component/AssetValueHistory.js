/**
 * AssetValueHistory Component
 * 
 * This component displays the historical value chart for an asset
 * and provides period selection functionality.
 */
import React, { useState, useEffect } from 'react';
import { 
  Box,
  Card, 
  CardContent, 
  Grid, 
  Typography, 
  ButtonGroup, 
  Button,
  CircularProgress
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { ASSET_PERIOD_OPTIONS } from '../../../constants/assetConstants';

/**
 * Prepare chart data for history visualization
 * @param {Array} valueHistory - Array of historical values
 * @returns {Object|null} Chart data and options, or null if no data
 */
const prepareHistoryChart = (valueHistory) => {
  if (!valueHistory || valueHistory.length === 0) {
    return null;
  }
  
  const chartData = {
    labels: valueHistory.map(point => {
      return new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }),
    datasets: [
      {
        label: 'Asset Value',
        data: valueHistory.map(point => point.value),
        fill: 'start',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        borderColor: '#3f51b5',
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#3f51b5'
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => {
            return '$' + value.toLocaleString('en-US');
          }
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
  
  return { data: chartData, options: chartOptions };
};

const AssetValueHistory = ({ 
  historyData,
  historyOptions,
  asset,
  transactions,
  currentPeriod = '1y',
  onPeriodChange,
  loading = false
}) => {
  const [chartConfig, setChartConfig] = useState(null);
  const [localPeriod, setLocalPeriod] = useState(currentPeriod);
  
  // If historyData and historyOptions are provided, use them
  // Otherwise process the asset and transactions to generate the chart
  useEffect(() => {
    if (historyData && historyOptions) {
      setChartConfig({ data: historyData, options: historyOptions });
    } else if (asset && asset.valueHistory) {
      setChartConfig(prepareHistoryChart(asset.valueHistory));
    }
  }, [historyData, historyOptions, asset, localPeriod]);
  
  // Handle period change locally if no external handler is provided
  const handlePeriodChange = (period) => {
    if (onPeriodChange) {
      onPeriodChange(period);
    } else {
      setLocalPeriod(period);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Value History
          </Typography>
          <ButtonGroup size="small" aria-label="time period">
            {ASSET_PERIOD_OPTIONS.map((period) => (
              <Button
                key={period.value}
                variant={(onPeriodChange ? currentPeriod : localPeriod) === period.value ? 'contained' : 'outlined'}
                onClick={() => handlePeriodChange(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4} height="300px" alignItems="center">
            <CircularProgress />
          </Box>
        ) : chartConfig ? (
          <Box height="300px">
            <Line data={chartConfig.data} options={chartConfig.options} />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" my={4} height="300px" alignItems="center">
            <Typography variant="body1" color="textSecondary">
              No historical data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetValueHistory;
