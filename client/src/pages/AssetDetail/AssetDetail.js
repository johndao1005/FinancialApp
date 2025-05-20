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
  deleteAsset,
  fetchAssetHistory
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
  AssetValueHistory,
  AssetTransactions,
  AssetMetrics,
  AssetEditDialog,
  AssetTransactionDialog
} from './component';
import { calculateAssetMetrics } from './utils/assetPageUtils';

const AssetDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assetId } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  
  const { 
    currentAsset, 
    assetLoading, 
    assetError,
    transactions,
    transactionsLoading,
    valueHistory,
    valueHistoryLoading,
  } = useSelector(state => state.assets);

  // Fetch asset details on component mount
  useEffect(() => {    if (assetId) {
      dispatch(fetchAssetById(assetId));
      dispatch(fetchAssetTransactions(assetId));
      dispatch(fetchAssetHistory({ assetId, period: selectedPeriod }));
    }
  }, [dispatch, assetId, selectedPeriod]);

  // Calculate asset metrics
  const metrics = currentAsset ? calculateAssetMetrics(currentAsset) : null;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    navigate('/assets');
  };

  const handleEditAsset = () => {
    setEditDialogOpen(true);
  };

  const handleAddTransaction = () => {
    setTransactionDialogOpen(true);
  };

  const handleDeleteAsset = async () => {
    if (window.confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      await dispatch(deleteAsset(assetId));
      navigate('/assets');
    }
  };

  const handleUpdateAsset = async (updatedAsset) => {
    await dispatch(updateAsset({ 
      assetId: currentAsset.id, 
      assetData: updatedAsset 
    }));
    setEditDialogOpen(false);
    dispatch(fetchAssetById(assetId));
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // Loading state
  if (assetLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Error state
  if (assetError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{assetError}</Alert>
      </Container>
    );
  }

  // Asset not found state
  if (!currentAsset) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Asset not found. It may have been deleted or you don't have access to it.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Asset Detail Header */}
      <AssetDetailHeader 
        asset={currentAsset}
        metrics={metrics}
        onGoBack={handleGoBack}
        onEdit={handleEditAsset}
        onAddTransaction={handleAddTransaction}
      />

      {/* Asset Metrics */}
      <AssetMetrics 
        asset={currentAsset} 
        metrics={metrics} 
      />

      {/* Asset Tabs */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="asset detail tabs"
          >
            <Tab label="Details" id="asset-tab-0" aria-controls="asset-tabpanel-0" />
            <Tab label="Value History" id="asset-tab-1" aria-controls="asset-tabpanel-1" />
            <Tab label="Transactions" id="asset-tab-2" aria-controls="asset-tabpanel-2" />
          </Tabs>
        </Box>

        {/* Details Tab */}
        <TabPanel value={tabValue} index={0}>
          <AssetDetails asset={currentAsset} />
        </TabPanel>

        {/* Value History Tab */}
        <TabPanel value={tabValue} index={1}>
          <AssetValueHistory 
            valueHistory={valueHistory}
            loading={valueHistoryLoading}
            period={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </TabPanel>

        {/* Transactions Tab */}
        <TabPanel value={tabValue} index={2}>
          <AssetTransactions 
            transactions={transactions} 
            loading={transactionsLoading} 
            asset={currentAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        </TabPanel>
      </Box>

      {/* Edit Asset Dialog */}
      <AssetEditDialog 
        open={editDialogOpen}
        asset={currentAsset}
        onClose={() => setEditDialogOpen(false)}
        onSave={handleUpdateAsset}
      />

      {/* Add Transaction Dialog */}
      <AssetTransactionDialog 
        open={transactionDialogOpen}
        asset={currentAsset}
        onClose={() => setTransactionDialogOpen(false)}
        onSave={() => {
          setTransactionDialogOpen(false);
          dispatch(fetchAssetTransactions(assetId));
          dispatch(fetchAssetById(assetId));
        }}
      />
    </Container>
  );
};

export default AssetDetailPage;
