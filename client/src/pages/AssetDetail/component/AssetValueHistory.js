/**
 * AssetValueHistory Component
 * 
 * This component displays the historical value chart for an asset
 * and provides period selection functionality.
 */
import React from 'react';
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
import { prepareHistoryChart } from '../utils/assetPageUtils';

const AssetValueHistory = ({ 
  valueHistory,
  loading,
  period: currentPeriod,
  onPeriodChange
}) => {
  // Period options for the history chart
  const periodOptions = [
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' },
    { value: 'all', label: 'All' }
  ];

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Value History
          </Typography>
          <ButtonGroup size="small" aria-label="time period">
            {periodOptions.map((period) => (
              <Button
                key={period.value}
                variant={currentPeriod === period.value ? 'contained' : 'outlined'}
                onClick={() => onPeriodChange(period.value)}
              >
                {period.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4} height="300px" alignItems="center">
            <CircularProgress />
          </Box>        ) : valueHistory && valueHistory.length > 0 ? (
          <Box height="300px">
            {(() => {
              const chartConfig = prepareHistoryChart(valueHistory);
              return chartConfig ? 
                <Line data={chartConfig.data} options={chartConfig.options} /> : 
                <Typography variant="body1" color="textSecondary">Unable to generate chart</Typography>;
            })()}
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
