/**
 * AssetsTabs Component
 * 
 * This component manages the tabbed interface in the Assets page,
 * showing All Assets, Net Worth, and Investment Portfolio tabs.
 */
import React from 'react';
import { Box, Paper, Tabs, Tab, CircularProgress, Typography, Button } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddIcon from '@mui/icons-material/Add';
import { TabPanel } from '../../../constants/assetConstants';
import AssetList from '../../../components/Assets/AssetList';
import NetWorthChart from '../../../components/Assets/NetWorthChart';
import AssetAllocationChart from '../../../components/Assets/AssetAllocationChart';
import PortfolioPerformance from '../../../components/Assets/PortfolioPerformance';
import AssetsList from '../../Assets/component/AssetsList';

const AssetsTabs = ({
  tabValue,
  handleTabChange,
  loading,
  assets,
  assetsByType,
  handleOpenAddDialog,
  onAssetClick,
  netWorthLoading,
  netWorth,
  portfolioLoading,
  portfolio
}) => {
  return (
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
          <AssetsList 
            assets={assets} 
            assetsByType={assetsByType}
            onAssetClick={onAssetClick}
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
          <Box container spacing={3} sx={{ display: 'flex', flexWrap: 'wrap' }}>
            <Box sx={{ width: { xs: '100%', md: '66.67%' }, p: 2 }}>
              <NetWorthChart historicalData={netWorth.historical} />
            </Box>
            <Box sx={{ width: { xs: '100%', md: '33.33%' }, p: 2 }}>
              <AssetAllocationChart allocation={netWorth.allocation} />
              <Typography variant="body2" color="textSecondary" mt={2} textAlign="center">
                Asset Allocation
              </Typography>
            </Box>
          </Box>
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
  );
};

export default AssetsTabs;
