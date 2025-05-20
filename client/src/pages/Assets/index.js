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
  Button, 
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useParams } from 'react-router-dom';
import AddAssetDialog from '../../components/Assets/AddAssetDialog';
import AssetDetail from './AssetDetail';
import { TabPanel } from '../../constants/assetConstants';
import { AssetsStats, AssetsTabs } from './component';

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
        <Grid item xs={12}>
          <AssetsStats 
            netWorth={netWorth}
            netWorthLoading={netWorthLoading}
            assets={assets}
            loading={loading}
            portfolio={portfolio}
            portfolioLoading={portfolioLoading}
          />
        </Grid>

        {/* Main content tabs */}
        <Grid item xs={12}>
          <AssetsTabs
            tabValue={tabValue}
            handleTabChange={handleTabChange}
            loading={loading}
            assets={assets}
            assetsByType={assetsByType}
            handleOpenAddDialog={handleOpenAddDialog}
            onAssetClick={handleAssetClick}
            netWorthLoading={netWorthLoading}
            netWorth={netWorth}
            portfolioLoading={portfolioLoading}
            portfolio={portfolio}
          />
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
