/**
 * AssetsStats Component
 * 
 * This component displays quick stats about assets in card format.
 * Used in the Assets main page to show net worth, total assets, and portfolio performance.
 */
import React from 'react';
import { Grid, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const AssetsStats = ({ netWorth, netWorthLoading, assets, loading, portfolio, portfolioLoading }) => {
  // Count active assets
  const activeAssets = assets.filter(asset => asset.isActive).length;

  return (
    <Grid container spacing={3}>
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
    </Grid>
  );
};

export default AssetsStats;
