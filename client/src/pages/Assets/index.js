/**
 * Assets Page
 * 
 * Main page for asset management providing an overview of assets,
 * net worth, and investment portfolio performance.
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAssets, fetchNetWorth, fetchPortfolioPerformance } from '../../redux/slices/assetSlice';
import { 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Tabs, 
  Tab, 
  Box, 
  Divider,
  CircularProgress,
  Paper,
  Alert,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate, useParams } from 'react-router-dom';
import AssetList from '../../components/Assets/AssetList';
import NetWorthChart from '../../components/Assets/NetWorthChart';
import AssetAllocationChart from '../../components/Assets/AssetAllocationChart';
import PortfolioPerformance from '../../components/Assets/PortfolioPerformance';
import AddAssetDialog from '../../components/Assets/AddAssetDialog';
import AssetDetail from './AssetDetail';

// Tabs panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`asset-tabpanel-${index}`}
      aria-labelledby={`asset-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Assets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assetId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // If assetId is provided, show the detail page instead
  if (assetId) {
    return <AssetDetail />;
  }
  
  const { 
    assets, 
    assetsByType,
    loading, 
    netWorth, 
    netWorthLoading,
    portfolio,
    portfolioLoading,
    error
  } = useSelector(state => state.assets);

  // Fetch assets and financial metrics on component mount
  useEffect(() => {
    dispatch(fetchAssets());
    dispatch(fetchNetWorth());
    dispatch(fetchPortfolioPerformance());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAddDialog = () => {
    setDialogOpen(true);
  };

  const handleAssetClick = (assetId) => {
    navigate(`/assets/${assetId}`);
  };

  // Calculate total assets value
  const totalValue = assets.reduce((sum, asset) => 
    sum + parseFloat(asset.currentValue), 0);

  // Count active assets
  const activeAssets = assets.filter(asset => asset.isActive).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" gutterBottom>
            Asset Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Asset
          </Button>
        </Grid>

        {/* Quick Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Net Worth
              </Typography>
              <Typography variant="h4" component="div">
                {netWorthLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  `$${netWorth.current.toLocaleString('en-US', { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total value of all assets
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Assets
              </Typography>
              <Typography variant="h4" component="div">
                {loading ? <CircularProgress size={24} /> : activeAssets}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Number of active assets
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Portfolio Performance
              </Typography>
              <Typography variant="h4" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                {portfolioLoading ? (
                  <CircularProgress size={24} />
                ) : portfolio.performance ? (
                  <>
                    {portfolio.performance.totalReturnPercentage >= 0 ? (
                      <TrendingUpIcon color="success" />
                    ) : (
                      <TrendingDownIcon color="error" />
                    )}
                    {portfolio.performance.totalReturnPercentage.toFixed(2)}%
                  </>
                ) : (
                  'N/A'
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overall investment return
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Main content tabs */}
        <Grid item xs={12}>
          <Paper sx={{ mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              aria-label="asset management tabs"
            >
              <Tab label="All Assets" />
              <Tab label="Net Worth" />
              <Tab label="Investment Portfolio" />
            </Tabs>

            {/* All Assets Tab */}
            <TabPanel value={tabValue} index={0}>
              {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : assets.length === 0 ? (
                <Box textAlign="center" my={4}>
                  <AccountBalanceIcon fontSize="large" color="disabled" />
                  <Typography variant="h6" color="textSecondary" mt={2}>
                    No assets found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    Add your first asset to start tracking your wealth
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                  >
                    Add Asset
                  </Button>
                </Box>
              ) : (
                <AssetList 
                  assets={assets} 
                  assetsByType={assetsByType}
                  onAssetClick={handleAssetClick}
                />
              )}
            </TabPanel>

            {/* Net Worth Tab */}
            <TabPanel value={tabValue} index={1}>
              {netWorthLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <NetWorthChart historicalData={netWorth.historical} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <AssetAllocationChart allocation={netWorth.allocation} />
                    <Typography variant="body2" color="textSecondary" mt={2} textAlign="center">
                      Asset Allocation
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </TabPanel>

            {/* Investment Portfolio Tab */}
            <TabPanel value={tabValue} index={2}>
              {portfolioLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <PortfolioPerformance 
                  performance={portfolio.performance}
                  breakdown={portfolio.breakdown}
                  returns={portfolio.returns}
                />
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      {/* Add Asset Dialog */}
      <AddAssetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Container>
  );
};

export default Assets;
