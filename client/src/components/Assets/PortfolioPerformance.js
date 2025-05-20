/**
 * Portfolio Performance Component
 * 
 * Displays investment portfolio performance metrics and breakdowns
 * by asset type.
 */
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
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

const PortfolioPerformance = ({ performance, breakdown, returns }) => {
  const theme = useTheme();

  // Get data for returns by type chart
  const prepareReturnsChart = () => {
    if (!returns || Object.keys(returns).length === 0) {
      return null;
    }

    const labels = Object.keys(returns).map(type => getAssetTypeName(type));
    const returnValues = Object.values(returns).map(data => data.returnPercentage);
    
    const data = {
      labels,
      datasets: [
        {
          label: 'Return %',
          data: returnValues,
          backgroundColor: returnValues.map(val => 
            val >= 0 ? theme.palette.success.main : theme.palette.error.main
          ),
          borderRadius: 3
        }
      ]
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `Return: ${context.parsed.y.toFixed(2)}%`;
            }
          }
        }
      },
      scales: {
        y: {
          grid: {
            color: theme.palette.divider
          },
          ticks: {
            callback: (value) => {
              return value + '%';
            }
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };
    
    return { data, options };
  };

  const returnsChart = prepareReturnsChart();
  
  // No performance data available
  if (!performance) {
    return (
      <Box textAlign="center" my={4}>
        <ShowChartIcon fontSize="large" color="disabled" />
        <Typography variant="h6" color="textSecondary" mt={2}>
          No investment data available
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Mark assets as investments to track portfolio performance
        </Typography>
      </Box>
    );
  }
  
  return (
    <Grid container spacing={3}>
      {/* Performance Metrics */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Investment Portfolio Performance
            </Typography>
            
            <Grid container spacing={3} mt={1}>
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Total Value
                </Typography>
                <Typography variant="h6">
                  ${performance.totalValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Typography>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Initial Investment
                </Typography>
                <Typography variant="h6">
                  ${performance.initialValue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </Typography>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Total Return
                </Typography>
                <Box display="flex" alignItems="center">
                  {performance.totalReturn >= 0 ? (
                    <TrendingUpIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                  )}
                  <Typography 
                    variant="h6"
                    color={performance.totalReturn >= 0 ? 'success.main' : 'error.main'}
                  >
                    ${Math.abs(performance.totalReturn).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                    {' '}
                    ({performance.totalReturnPercentage >= 0 ? '+' : ''}
                    {performance.totalReturnPercentage.toFixed(2)}%)
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={6} md={3}>
                <Typography variant="body2" color="textSecondary">
                  Annualized Return
                </Typography>
                <Typography 
                  variant="h6"
                  color={performance.annualizedReturn >= 0 ? 'success.main' : 'error.main'}
                >
                  {performance.annualizedReturn >= 0 ? '+' : ''}
                  {performance.annualizedReturn.toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Returns by Asset Type Chart */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Returns by Asset Type
            </Typography>
            
            <Box height={300}>
              {returnsChart ? (
                <Bar data={returnsChart.data} options={returnsChart.options} />
              ) : (
                <Box 
                  height="100%" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <Typography color="textSecondary">
                    No return data available
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      
      {/* Investments Table */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Investment Breakdown
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset Type</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Initial Value</TableCell>
                    <TableCell align="right">Return %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {returns && Object.keys(returns).map((type) => (
                    <TableRow key={type}>
                      <TableCell component="th" scope="row">
                        {getAssetTypeName(type)}
                      </TableCell>
                      <TableCell align="right">
                        ${returns[type].value.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </TableCell>
                      <TableCell align="right">
                        ${returns[type].initialValue.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: returns[type].returnPercentage >= 0 
                            ? 'success.main' 
                            : 'error.main' 
                        }}
                      >
                        {returns[type].returnPercentage >= 0 ? '+' : ''}
                        {returns[type].returnPercentage.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {(!returns || Object.keys(returns).length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No investment data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {breakdown && Object.keys(breakdown).length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Top Performing Assets
                </Typography>
                
                {Object.keys(breakdown).flatMap(type => 
                  breakdown[type].assets
                    .sort((a, b) => b.returnPercentage - a.returnPercentage)
                    .slice(0, 2)
                )
                .sort((a, b) => b.returnPercentage - a.returnPercentage)
                .slice(0, 3)
                .map(asset => (
                  <Box key={asset.id} mb={2}>
                    <Typography variant="body2">
                      {asset.name}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box width="70%">
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(Math.max(asset.returnPercentage, 0), 100)}
                          color={asset.returnPercentage >= 0 ? "success" : "error"}
                        />
                      </Box>
                      <Typography 
                        variant="body2"
                        color={asset.returnPercentage >= 0 ? 'success.main' : 'error.main'}
                      >
                        {asset.returnPercentage >= 0 ? '+' : ''}
                        {asset.returnPercentage.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PortfolioPerformance;
