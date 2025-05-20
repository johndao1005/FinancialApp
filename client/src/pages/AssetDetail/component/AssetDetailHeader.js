/**
 * AssetDetailHeader Component
 * 
 * Displays the header section of the asset detail page, including:
 * - Asset name and status
 * - Back button
 * - Edit and transaction buttons
 * - Asset metrics and performance indicators
 */
import React from 'react';
import { Box, Typography, Button, Chip, Grid, Divider } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import { getAssetTypeName, getTrendIcon } from '../../../constants/assetConstants';
import { formatCurrency } from '../utils/assetPageUtils';

const AssetDetailHeader = ({ 
  asset, 
  metrics, 
  onGoBack, 
  onEdit, 
  onAddTransaction 
}) => {
  if (!asset || !metrics) return null;
  
  const { 
    percentageChange, 
    absoluteChange, 
    initialValue, 
    currentValue,
    acquisitionDate,
    assetAgeYears,
    annualizedReturn
  } = metrics;
  
  return (
    <Grid container spacing={2} mb={4}>
      <Grid item xs={12} display="flex" justifyContent="space-between">
        <Box display="flex" alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={onGoBack}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1">
            {asset.name}
          </Typography>
          {asset.isActive ? (
            <Chip 
              label="Active" 
              color="success" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          ) : (
            <Chip 
              label="Inactive" 
              color="default" 
              size="small" 
              sx={{ ml: 2 }} 
            />
          )}
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddTransaction}
          >
            Add Transaction
          </Button>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Divider />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="h6" component="h2" gutterBottom>
          {getAssetTypeName(asset.type)}
        </Typography>
        {asset.description && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {asset.description}
          </Typography>
        )}
        <Box display="flex" alignItems="center" mb={1}>
          <EventIcon color="action" fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Acquired on {acquisitionDate}
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Typography variant="h5" component="div" align="right">
          {formatCurrency(asset.currentValue)}
        </Typography>
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          {getTrendIcon(initialValue, currentValue)}
          <Typography 
            variant="body1" 
            color={percentageChange >= 0 ? 'success.main' : 'error.main'}
            component="span"
            sx={{ ml: 0.5 }}
          >
            {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(2)}%
          </Typography>
          <Typography variant="body2" color="textSecondary" component="span" sx={{ ml: 1 }}>
            ({absoluteChange >= 0 ? '+' : ''}{formatCurrency(absoluteChange)})
          </Typography>
        </Box>
        {assetAgeYears >= 1 && (
          <Typography variant="body2" color="textSecondary" align="right">
            Annualized return: {annualizedReturn.toFixed(2)}%
          </Typography>
        )}
      </Grid>
    </Grid>
  );
};

export default AssetDetailHeader;
