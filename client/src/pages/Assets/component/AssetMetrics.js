/**
 * AssetMetrics Component
 * 
 * This component displays performance metrics for an asset.
 */
import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

const AssetMetrics = ({ asset }) => {
  // Calculate metrics
  const calculateROI = () => {
    if (!asset || !asset.initialValue || asset.initialValue === 0) return 0;
    return ((asset.currentValue - asset.initialValue) / asset.initialValue) * 100;
  };

  const roi = calculateROI();
  
  // Determine trend icon
  const getTrendIcon = () => {
    if (!asset) return <TrendingFlatIcon color="action" fontSize="small" />;
    
    if (asset.currentValue > asset.initialValue) {
      return <TrendingUpIcon color="success" fontSize="small" />;
    } else if (asset.currentValue < asset.initialValue) {
      return <TrendingDownIcon color="error" fontSize="small" />;
    } else {
      return <TrendingFlatIcon color="action" fontSize="small" />;
    }
  };

  if (!asset) return null;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              Current Value
            </Typography>
            <Typography variant="h6">
              ${asset.currentValue?.toLocaleString('en-US', {
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
            <Typography variant="body2" color="textSecondary">
              Initial Investment
            </Typography>
            <Typography variant="h6">
              ${asset.initialValue?.toLocaleString('en-US', {
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
            <Typography variant="body2" color="textSecondary">
              Return on Investment
            </Typography>
            <Box display="flex" alignItems="center">
              {getTrendIcon()}
              <Typography variant="h6" component="span" color={roi > 0 ? 'success.main' : roi < 0 ? 'error.main' : 'text.secondary'}>
                {roi.toFixed(2)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              Acquisition Date
            </Typography>
            <Typography variant="h6">
              {asset.acquisitionDate 
                ? new Date(asset.acquisitionDate).toLocaleDateString() 
                : 'N/A'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AssetMetrics;
