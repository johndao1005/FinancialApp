/**
 * Asset Constants and Utility Functions
 * 
 * Central location for asset-related constants and shared utility functions
 * used across various asset components.
 */
import React from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { Box } from '@mui/material';

/**
 * Period options for asset history charts
 */
export const ASSET_PERIOD_OPTIONS = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' }
];

/**
 * Get human-readable asset type name from asset type code
 * @param {string} type - The asset type code
 * @returns {string} Human-readable asset type name
 */
export const getAssetTypeName = (type) => {
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

/**
 * Get trend icon based on value change
 * @param {number} initialValue - The initial value
 * @param {number} currentValue - The current value
 * @returns {JSX.Element} Appropriate trend icon component
 */
export const getTrendIcon = (initialValue, currentValue) => {
  const difference = currentValue - initialValue;
  if (difference > 0) {
    return <TrendingUpIcon color="success" fontSize="small" />;
  } else if (difference < 0) {
    return <TrendingDownIcon color="error" fontSize="small" />;
  } else {
    return <TrendingFlatIcon color="action" fontSize="small" />;
  }
};

/**
 * TabPanel component for Material UI tabs
 * @param {Object} props - Component properties
 * @returns {JSX.Element} TabPanel component
 */
export function TabPanel(props) {
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
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Get transaction color based on transaction type
 * @param {string} type - The transaction type
 * @returns {string} Hex color code
 */
export const getTransactionColor = (type) => {
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
