/**
 * Asset Detail Page
 * 
 * Displays detailed information about a specific asset including:
 * - Current valuation and performance metrics
 * - Transaction history
 * - Historical value chart
 * - Asset-specific attributes
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAssetById, fetchAssetHistory, createAssetTransaction, updateAsset } from '../../redux/slices/assetSlice';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Paper,
  Alert,
  Box,
  Chip,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material';
import ValuationChart from '../../components/Assets/ValuationChart';
import ValuationUpdateDialog from '../../components/Assets/ValuationUpdateDialog';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EventIcon from '@mui/icons-material/Event';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-detail-tabpanel-${index}`}
      aria-labelledby={`asset-detail-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Get human-readable asset type name
const getAssetTypeName = (type) => {
  switch (type) {
    case 'property':
      return 'Real Estate';
    case 'stock':
      return 'Stocks & Shares';
    case 'crypto':
      return 'Cryptocurrency';
    case 'term_deposit':
      return 'Term Deposit';
    default:
      return 'Other Asset';
  }
};

// Get trend icon based on performance
const getTrendIcon = (initialValue, currentValue) => {
  const difference = currentValue - initialValue;
  if (difference > 0) {
    return <TrendingUpIcon color="success" fontSize="small" />;
  } else if (difference < 0) {
    return <TrendingDownIcon color="error" fontSize="small" />;
  } else {
    return <TrendingFlatIcon color="action" fontSize="small" />;
  }
};

const AssetDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [valuationDialogOpen, setValuationDialogOpen] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState('all'); // '1m', '3m', '6m', '1y', 'all'
  
  // Redux state
  const { 
    currentAsset, 
    transactions, 
    assetHistory,
    loading,
    transactionLoading, 
    historyLoading,
    error 
  } = useSelector(state => state.assets);
    // Form state for edit asset dialog
  const [editAssetData, setEditAssetData] = useState({
    name: '',
    currentValue: '',
    notes: '',
    isInvestment: false,
    isActive: true,
    soldDate: new Date().toISOString().split('T')[0],
    saleValue: '',
    annualRateOfReturn: ''
  });
  
  // Form state for add transaction dialog
  const [transactionData, setTransactionData] = useState({
    date: new Date().toISOString().split('T')[0],
    transactionType: 'valuation_update',
    amount: '',
    quantity: '',
    notes: ''
  });
  
  // Load asset data on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchAssetById(id));
      dispatch(fetchAssetHistory({ assetId: id, period: historyPeriod }));
    }
  }, [dispatch, id]);
  
  // Update edit form data when asset loads
  useEffect(() => {
    if (currentAsset) {
      setEditAssetData({
        name: currentAsset.name,
        currentValue: currentAsset.currentValue,
        notes: currentAsset.notes || '',
        isInvestment: currentAsset.isInvestment,
        isActive: currentAsset.isActive,
        soldDate: new Date().toISOString().split('T')[0],
        saleValue: currentAsset.currentValue,
        annualRateOfReturn: currentAsset.annualRateOfReturn || ''
      });
    }
  }, [currentAsset]);
  
  // When history period changes, reload history data
  useEffect(() => {
    if (id) {
      dispatch(fetchAssetHistory({ assetId: id, period: historyPeriod }));
    }
  }, [dispatch, id, historyPeriod]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleGoBack = () => {
    navigate('/assets');
  };
  
  const handleOpenEditDialog = () => {
    setEditDialogOpen(true);
  };
  
  const handleOpenTransactionDialog = () => {
    setTransactionDialogOpen(true);
    
    // Reset transaction form
    setTransactionData({
      date: new Date().toISOString().split('T')[0],
      transactionType: 'valuation_update',
      amount: '',
      quantity: '',
      notes: ''
    });
  };
  
  const handleEditAssetChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditAssetData({
      ...editAssetData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setTransactionData({
      ...transactionData,
      [name]: value
    });
  };
  
  const handleUpdateAsset = () => {
    const updatedData = { ...editAssetData };
    
    dispatch(updateAsset({ 
      assetId: id, 
      assetData: updatedData 
    }));
    
    setEditDialogOpen(false);
  };
  
  const handleAddTransaction = () => {
    const newTransaction = {
      assetId: id,
      ...transactionData,
      amount: parseFloat(transactionData.amount),
      quantity: transactionData.quantity ? parseFloat(transactionData.quantity) : null
    };
    
    dispatch(createAssetTransaction(newTransaction));
    setTransactionDialogOpen(false);
  };
  
  const handleHistoryPeriodChange = (period) => {
    setHistoryPeriod(period);
  };
  
  // Prepare chart data if we have history
  const prepareHistoryChart = () => {
    if (!assetHistory.valueHistory || assetHistory.valueHistory.length === 0) {
      return null;
    }
    
    const chartData = {
      labels: assetHistory.valueHistory.map(point => {
        return new Date(point.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }),
      datasets: [
        {
          label: 'Asset Value',
          data: assetHistory.valueHistory.map(point => point.value),
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
  
  const historyChart = prepareHistoryChart();
  
  // Loading state
  if (loading && !currentAsset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" my={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Error state
  if (error && !currentAsset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Back to Assets
        </Button>
      </Container>
    );
  }
  
  // If asset not loaded yet
  if (!currentAsset) {
    return null;
  }
  
  // Calculate asset performance metrics
  const initialValue = parseFloat(currentAsset.initialValue);
  const currentValue = parseFloat(currentAsset.currentValue);
  const absoluteChange = currentValue - initialValue;
  const percentageChange = initialValue > 0 ? (absoluteChange / initialValue) * 100 : 0;
  
  // Get acquisition date in readable format
  const acquisitionDate = new Date(currentAsset.acquisitionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Get asset age
  const assetAgeMs = new Date() - new Date(currentAsset.acquisitionDate);
  const assetAgeYears = assetAgeMs / (1000 * 60 * 60 * 24 * 365.25);
  
  // Calculate annualized return if we have performance data
  let annualizedReturn = 0;
  if (assetAgeYears > 0 && currentValue > 0 && initialValue > 0) {
    annualizedReturn = ((Math.pow(currentValue / initialValue, 1 / assetAgeYears) - 1) * 100);
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Page header with back button */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          {currentAsset.name}
        </Typography>
        
        {!currentAsset.isActive && (
          <Chip 
            label="Sold" 
            color="default"
            sx={{ ml: 2 }}
          />
        )}
        
        {currentAsset.isInvestment && (
          <Chip 
            label="Investment" 
            color="primary"
            sx={{ ml: 2 }}
          />
        )}
        
        <Box ml="auto">
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleOpenEditDialog}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenTransactionDialog}
            disabled={!currentAsset.isActive}
          >
            Add Transaction
          </Button>
        </Box>
      </Box>
      
      {/* Asset overview cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Current Value
              </Typography>
              <Typography variant="h4">
                ${currentValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last updated: {new Date(currentAsset.lastValueUpdateDate).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Initial Value
              </Typography>
              <Typography variant="h4">
                ${initialValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Acquired: {acquisitionDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Return
              </Typography>
              <Box display="flex" alignItems="center">
                {getTrendIcon(initialValue, currentValue)}
                <Typography 
                  variant="h4" 
                  color={absoluteChange >= 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 1 }}
                >
                  {absoluteChange >= 0 ? '+' : ''}
                  {percentageChange.toFixed(2)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                ${absoluteChange.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Asset Type
              </Typography>
              <Typography variant="h4">
                {getAssetTypeName(currentAsset.assetType)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Held for {assetAgeYears.toFixed(1)} years
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Tabs for details, transactions, and history */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          aria-label="asset details tabs"
        >
          <Tab label="Details" />
          <Tab label="Transactions" />
          <Tab label="Value History" />
        </Tabs>
        
        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Asset Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Asset Name
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {currentAsset.name}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Asset Type
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {getAssetTypeName(currentAsset.assetType)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Acquisition Date
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {acquisitionDate}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Currency
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {currentAsset.currency}
                      </Typography>
                    </Grid>
                    
                    {currentAsset.quantity && (
                      <>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Quantity
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body1">
                            {parseFloat(currentAsset.quantity).toLocaleString('en-US', {
                              maximumFractionDigits: 8
                            })}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    {currentAsset.symbol && (
                      <>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Symbol
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body1">
                            {currentAsset.symbol}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    {currentAsset.location && (
                      <>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Location
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body1">
                            {currentAsset.location}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="textSecondary">
                        Investment Asset
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">
                        {currentAsset.isInvestment ? 'Yes' : 'No'}
                      </Typography>
                    </Grid>
                    
                    {currentAsset.isInvestment && currentAsset.annualRateOfReturn && (
                      <>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Expected Return
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body1">
                            {parseFloat(currentAsset.annualRateOfReturn).toFixed(2)}% annually
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    {!currentAsset.isActive && (
                      <>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Sold Date
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body1">
                            {new Date(currentAsset.soldDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Sale Value
                          </Typography>
                        </Grid>
                        <Grid item xs={8}>
                          <Typography variant="body1">
                            ${parseFloat(currentAsset.saleValue).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    {currentAsset.notes && (
                      <>
                        <Grid item xs={12}>
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            Notes
                          </Typography>
                          <Typography variant="body1">
                            {currentAsset.notes}
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Performance Metrics
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Total Return
                      </Typography>
                      <Box display="flex" alignItems="center">
                        {getTrendIcon(initialValue, currentValue)}
                        <Typography 
                          variant="body1" 
                          color={absoluteChange >= 0 ? 'success.main' : 'error.main'}
                          sx={{ ml: 0.5 }}
                        >
                          {absoluteChange >= 0 ? '+' : ''}
                          ${Math.abs(absoluteChange).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                          {' '}
                          ({percentageChange >= 0 ? '+' : ''}
                          {percentageChange.toFixed(2)}%)
                        </Typography>
                    </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Annualized Return
                      </Typography>
                      <Typography 
                        variant="body1"
                        color={annualizedReturn >= 0 ? 'success.main' : 'error.main'}
                      >
                        {annualizedReturn >= 0 ? '+' : ''}
                        {annualizedReturn.toFixed(2)}% per year
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Holding Period
                      </Typography>
                      <Typography variant="body1">
                        {assetAgeYears.toFixed(1)} years
                      </Typography>
                    </Grid>
                    
                    {currentAsset.quantity && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          Current Price Per Unit
                        </Typography>
                        <Typography variant="body1">
                          ${(currentValue / parseFloat(currentAsset.quantity)).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8
                          })}
                        </Typography>
                      </Grid>
                    )}
                    
                    {assetHistory.performance && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 2 }} />
                          <Typography variant="subtitle1" gutterBottom>
                            Historical Performance
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Absolute Return
                          </Typography>
                          <Typography 
                            variant="body1"
                            color={assetHistory.performance.absoluteReturn >= 0 ? 'success.main' : 'error.main'}
                          >
                            {assetHistory.performance.absoluteReturn >= 0 ? '+' : ''}
                            ${Math.abs(assetHistory.performance.absoluteReturn).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Percent Return
                          </Typography>
                          <Typography 
                            variant="body1"
                            color={assetHistory.performance.percentReturn >= 0 ? 'success.main' : 'error.main'}
                          >
                            {assetHistory.performance.percentReturn >= 0 ? '+' : ''}
                            {assetHistory.performance.percentReturn.toFixed(2)}%
                          </Typography>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Transactions Tab */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Transaction History
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenTransactionDialog}
                  disabled={!currentAsset.isActive}
                >
                  Add Transaction
                </Button>
              </Box>
              
              {transactionLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : transactions.length === 0 ? (
                <Box textAlign="center" my={4}>
                  <Typography variant="body1" color="textSecondary">
                    No transactions found for this asset.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {transactions.map((transaction) => (
                    <Paper
                      key={transaction.id}
                      variant="outlined"
                      sx={{
                        mb: 2,
                        p: 2,
                        borderLeft: '4px solid',
                        borderLeftColor: getTransactionColor(transaction.transactionType)
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="textSecondary">
                            Date
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <EventIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography variant="body1">
                              {new Date(transaction.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="textSecondary">
                            Type
                          </Typography>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {transaction.transactionType.replace(/_/g, ' ')}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="textSecondary">
                            Amount
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                            <Typography 
                              variant="body1"
                              color={parseFloat(transaction.amount) >= 0 ? 'success.main' : 'error.main'}
                            >
                              {parseFloat(transaction.amount) >= 0 ? '+' : ''}
                              ${Math.abs(parseFloat(transaction.amount)).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="body2" color="textSecondary">
                            Value After
                          </Typography>
                          <Typography variant="body1">
                            ${parseFloat(transaction.valueAfterTransaction).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}
                          </Typography>
                        </Grid>
                        
                        {transaction.quantity && (
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                              Quantity
                            </Typography>
                            <Typography variant="body1">
                              {parseFloat(transaction.quantity).toLocaleString('en-US', {
                                maximumFractionDigits: 8
                              })}
                            </Typography>
                          </Grid>
                        )}
                        
                        {transaction.notes && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="textSecondary">
                              Notes
                            </Typography>
                            <Typography variant="body1">
                              {transaction.notes}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </TabPanel>
          {/* Value History Tab */}        <TabPanel value={tabValue} index={2}>
          {historyLoading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AttachMoneyIcon />}
                  onClick={() => setValuationDialogOpen(true)}
                  disabled={!currentAsset.isActive}
                >
                  Update Valuation
                </Button>
              </Box>
              
              <ValuationChart 
                asset={currentAsset} 
                transactions={assetHistory?.valueHistory || []} 
                projectionYears={5}
                showProjection={true}
              />
              
              {assetHistory.performance && (
                <Box mt={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Performance Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">
                        Total Return
                      </Typography>
                      <Typography 
                        variant="body1"
                        color={assetHistory.performance.percentReturn >= 0 ? 'success.main' : 'error.main'}
                      >
                        {assetHistory.performance.percentReturn >= 0 ? '+' : ''}
                        {assetHistory.performance.percentReturn.toFixed(2)}%
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">
                        Value Change
                      </Typography>
                      <Typography variant="body1">
                        ${assetHistory.performance.absoluteReturn.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">
                        Annualized Return
                      </Typography>
                      <Typography 
                        variant="body1"
                        color={assetHistory.performance.annualizedReturn >= 0 ? 'success.main' : 'error.main'}
                      >
                        {assetHistory.performance.annualizedReturn >= 0 ? '+' : ''}
                        {assetHistory.performance.annualizedReturn.toFixed(2)}%
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="textSecondary">
                        Holding Period
                      </Typography>
                      <Typography variant="body1">
                        {assetHistory.performance.holdingPeriodYears.toFixed(1)} years
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </>
          )}
        </TabPanel>      </Paper>
      
      {/* Edit Asset Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Asset</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Asset Name"
                name="name"
                value={editAssetData.name}
                onChange={handleEditAssetChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Value"
                name="currentValue"
                type="number"
                value={editAssetData.currentValue}
                onChange={handleEditAssetChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editAssetData.isInvestment}
                    onChange={handleEditAssetChange}
                    name="isInvestment"
                    color="primary"
                  />
                }
                label="This is an investment asset (include in portfolio performance)"
              />
            </Grid>
            
            {editAssetData.isInvestment && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expected Annual Rate of Return (%)"
                  name="annualRateOfReturn"
                  type="number"
                  value={editAssetData.annualRateOfReturn}
                  onChange={handleEditAssetChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!editAssetData.isActive}
                    onChange={(e) => setEditAssetData({
                      ...editAssetData,
                      isActive: !e.target.checked
                    })}
                    name="isSold"
                    color="primary"
                  />
                }
                label="Mark as sold/disposed"
              />
            </Grid>
            
            {!editAssetData.isActive && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sale Date"
                    name="soldDate"
                    type="date"
                    value={editAssetData.soldDate}
                    onChange={handleEditAssetChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sale Value"
                    name="saleValue"
                    type="number"
                    value={editAssetData.saleValue}
                    onChange={handleEditAssetChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={editAssetData.notes}
                onChange={handleEditAssetChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleUpdateAsset}
          >
            Update Asset
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Add Transaction Dialog */}
      <Dialog
        open={transactionDialogOpen}
        onClose={() => setTransactionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Transaction Type"
                name="transactionType"
                value={transactionData.transactionType}
                onChange={handleTransactionChange}
              >
                <MenuItem value="valuation_update">Value Update</MenuItem>
                <MenuItem value="purchase">Purchase/Acquisition</MenuItem>
                <MenuItem value="sale">Sale</MenuItem>
                <MenuItem value="contribution">Contribution</MenuItem>
                <MenuItem value="withdrawal">Withdrawal</MenuItem>
                <MenuItem value="dividend">Dividend</MenuItem>
                <MenuItem value="interest">Interest</MenuItem>
                <MenuItem value="fee">Fee</MenuItem>
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={transactionData.date}
                onChange={handleTransactionChange}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={transactionData.transactionType === 'valuation_update' ? 'New Total Value' : 'Amount'}
                name="amount"
                type="number"
                value={transactionData.amount}
                onChange={handleTransactionChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                helperText={
                  transactionData.transactionType === 'valuation_update' 
                    ? 'Enter the new total value of the asset' 
                    : transactionData.transactionType === 'sale' || transactionData.transactionType === 'withdrawal' || transactionData.transactionType === 'fee'
                    ? 'Enter a negative amount'
                    : 'Enter a positive amount'
                }
              />
            </Grid>
            
            {['purchase', 'sale', 'split'].includes(transactionData.transactionType) && currentAsset.quantity && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={transactionData.quantity}
                  onChange={handleTransactionChange}
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={transactionData.notes}
                onChange={handleTransactionChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleAddTransaction}
            disabled={!transactionData.amount}          >
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Valuation Update Dialog */}
      <ValuationUpdateDialog 
        open={valuationDialogOpen}
        onClose={() => setValuationDialogOpen(false)}
        asset={currentAsset}
      />
    </Container>
  );
};

// Helper functions
const getTransactionColor = (type) => {
  switch (type) {
    case 'purchase':
    case 'contribution':
      return '#4caf50';  // green
    case 'sale':
    case 'withdrawal':
    case 'fee':
      return '#f44336';  // red
    case 'valuation_update':
      return '#3f51b5';  // blue
    case 'dividend':
    case 'interest':
      return '#ff9800';  // orange
    default:
      return '#9e9e9e';  // grey
  }
};

export default AssetDetail;
