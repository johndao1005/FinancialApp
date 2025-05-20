/**
 * Asset List Component
 * 
 * Displays a list of assets grouped by asset type
 * with summarized information for each asset.
 */
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HomeIcon from '@mui/icons-material/Home';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

// Map asset types to icons
const getAssetTypeIcon = (type) => {
  switch (type) {
    case 'property':
      return <HomeIcon />;
    case 'stock':
      return <ShowChartIcon />;
    case 'crypto':
      return <CurrencyBitcoinIcon />;
    case 'term_deposit':
      return <AccountBalanceIcon />;
    default:
      return <HelpOutlineIcon />;
  }
};

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
      return 'Term Deposits & Savings';
    default:
      return 'Other Assets';
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

const AssetList = ({ assets, assetsByType, onAssetClick }) => {
  // Define asset types in specific order
  const assetTypeOrder = ['property', 'stock', 'crypto', 'term_deposit', 'other'];
  
  // Sort asset types for display
  const sortedAssetTypes = Object.keys(assetsByType).sort((a, b) => {
    return assetTypeOrder.indexOf(a) - assetTypeOrder.indexOf(b);
  });

  return (
    <Box>
      {sortedAssetTypes.map((assetType) => (
        <Accordion key={assetType} defaultExpanded>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${assetType}-content`}
            id={`${assetType}-header`}
          >
            <Box display="flex" alignItems="center">
              <Box mr={1}>
                {getAssetTypeIcon(assetType)}
              </Box>
              <Typography variant="h6">
                {getAssetTypeName(assetType)}
              </Typography>
              <Chip 
                label={assetsByType[assetType].length} 
                size="small" 
                sx={{ ml: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List disablePadding>
              {assetsByType[assetType].map((asset) => (
                <ListItem 
                  key={asset.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'action.hover',
                      cursor: 'pointer'
                    },
                    opacity: asset.isActive ? 1 : 0.6
                  }}
                  onClick={() => onAssetClick(asset.id)}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1" component="span">
                          {asset.name}
                        </Typography>
                        {!asset.isActive && (
                          <Chip 
                            label="Sold" 
                            size="small" 
                            color="default"
                            sx={{ ml: 1 }}
                          />
                        )}
                        {asset.isInvestment && (
                          <Chip 
                            label="Investment" 
                            size="small" 
                            color="primary"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box mt={1}>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                              Current Value
                            </Typography>
                            <Typography variant="body1">
                              ${parseFloat(asset.currentValue).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                              Initial Value
                            </Typography>
                            <Typography variant="body1">
                              ${parseFloat(asset.initialValue).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                              Change
                            </Typography>
                            <Box display="flex" alignItems="center">
                              {getTrendIcon(asset.initialValue, asset.currentValue)}
                              <Typography 
                                variant="body1"
                                color={
                                  parseFloat(asset.currentValue) > parseFloat(asset.initialValue)
                                    ? 'success.main'
                                    : parseFloat(asset.currentValue) < parseFloat(asset.initialValue)
                                    ? 'error.main'
                                    : 'text.primary'
                                }
                                ml={0.5}
                              >
                                {((parseFloat(asset.currentValue) - parseFloat(asset.initialValue)) / 
                                  parseFloat(asset.initialValue) * 100).toFixed(2)}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} md={3}>
                            <Typography variant="body2" color="textSecondary">
                              Acquired
                            </Typography>
                            <Typography variant="body1">
                              {new Date(asset.acquisitionDate).toLocaleDateString()}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => onAssetClick(asset.id)}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default AssetList;
