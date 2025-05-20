/**
 * Asset Detail Page
 * 
 * Displays detailed information about a specific asset, including:
 * - Asset metrics (current value, performance, etc.)
 * - Transaction history
 * - Value history
 * - Asset details
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  fetchAssetById, 
  fetchAssetTransactions, 
  fetchNetWorth,
  updateAsset,
  deleteAsset
} from '../../redux/slices/assetSlice';
import { 
  Container, 
  Grid, 
  Alert,
  Box,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import { TabPanel } from '../../constants/assetConstants';
import { 
  AssetDetailHeader, 
  AssetDetails, 
  AssetMetrics,
  AssetTransactions,
  AssetValueHistory,
  AssetEditDialog,
  AssetTransactionDialog
} from './component';
import { calculateAssetMetrics } from './utils/assetPageUtils';

const AssetDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assetId } = useParams();
  
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  
  const { 
    currentAsset, 
    assetTransactions, 
    loading, 
    assetTransactionsLoading,
    error 
  } = useSelector(state => state.assets);
  
  // Fetch asset data and transactions on component mount
  useEffect(() => {
    if (assetId) {
      dispatch(fetchAssetById(assetId));
      dispatch(fetchAssetTransactions(assetId));
    }
  }, [dispatch, assetId]);
  
  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Navigate back to assets list
  const handleGoBack = () => {
    navigate('/assets');
  };
  
  // Open edit dialog
  const handleEditClick = () => {
    setEditDialogOpen(true);
  };
  
  // Open add transaction dialog
  const handleAddTransactionClick = () => {
    setTransactionDialogOpen(true);
  };
  
  // Handle asset edit submission
  const handleEditSubmit = async (assetData) => {
    await dispatch(updateAsset({ assetId, assetData }));
    setEditDialogOpen(false);
    // Refresh asset data
    dispatch(fetchAssetById(assetId));
    dispatch(fetchNetWorth());
  };
  
  // Handle asset deletion
  const handleDeleteAsset = async () => {
    await dispatch(deleteAsset(assetId));
    navigate('/assets');
  };
  
  // Calculate metrics for the asset
  const assetMetrics = currentAsset ? calculateAssetMetrics(currentAsset) : null;
  
  // Show loading state while fetching data
  if (loading && !currentAsset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  // Show error message if asset not found
  if (!loading && !currentAsset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          Asset not found. The asset may have been deleted or you may not have permission to view it.
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Asset Header with metrics */}
        <Grid item xs={12}>
          <AssetDetailHeader 
            asset={currentAsset}
            metrics={assetMetrics}
            onGoBack={handleGoBack}
            onEdit={handleEditClick}
            onAddTransaction={handleAddTransactionClick}
          />
        </Grid>
        
        {/* Tabs for different sections */}
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="asset detail tabs">
              <Tab label="Overview" id="asset-tab-0" aria-controls="asset-tabpanel-0" />
              <Tab label="Transactions" id="asset-tab-1" aria-controls="asset-tabpanel-1" />
              <Tab label="Value History" id="asset-tab-2" aria-controls="asset-tabpanel-2" />
            </Tabs>
          </Box>
          
          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <AssetDetails asset={currentAsset} />
            <AssetMetrics asset={currentAsset} metrics={assetMetrics} />
          </TabPanel>
          
          {/* Transactions Tab */}
          <TabPanel value={tabValue} index={1}>
            <AssetTransactions 
              transactions={assetTransactions} 
              loading={assetTransactionsLoading} 
              onAddTransaction={handleAddTransactionClick}
            />
          </TabPanel>
          
          {/* Value History Tab */}
          <TabPanel value={tabValue} index={2}>
            <AssetValueHistory 
              asset={currentAsset}
              transactions={assetTransactions}
            />
          </TabPanel>
        </Grid>
      </Grid>
      
      {/* Edit Asset Dialog */}
      <AssetEditDialog 
        open={editDialogOpen}
        asset={currentAsset}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditSubmit}
        onDelete={handleDeleteAsset}
      />
      
      {/* Add Transaction Dialog */}
      <AssetTransactionDialog 
        open={transactionDialogOpen}
        asset={currentAsset}
        onClose={() => setTransactionDialogOpen(false)}
      />
    </Container>
  );
};

export default AssetDetail;
