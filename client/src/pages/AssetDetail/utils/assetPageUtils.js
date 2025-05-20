/**
 * Asset detail page utility functions
 * 
 * Contains utility functions specifically used within the Asset Detail page components
 */
import React from 'react';
import { Typography, Box } from '@mui/material';

/**
 * Format currency value for display
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, decimals = 2) => {
  if (!value && value !== 0) return '$0.00';
  
  return '$' + parseFloat(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Calculate performance metrics for an asset
 * @param {Object} asset - The asset object
 * @returns {Object} Object containing calculated metrics
 */
export const calculateAssetMetrics = (asset) => {
  if (!asset) return null;
  
  const initialValue = parseFloat(asset.initialValue || 0);
  const currentValue = parseFloat(asset.currentValue || 0);
  const absoluteChange = currentValue - initialValue;
  const percentageChange = initialValue > 0 ? (absoluteChange / initialValue) * 100 : 0;
  
  // Calculate acquisition date in readable format
  const acquisitionDate = asset.acquisitionDate 
    ? new Date(asset.acquisitionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';
  
  // Calculate asset age
  const assetAgeMs = asset.acquisitionDate 
    ? new Date() - new Date(asset.acquisitionDate) 
    : 0;
  const assetAgeYears = assetAgeMs / (1000 * 60 * 60 * 24 * 365.25);
  
  // Calculate annualized return
  let annualizedReturn = 0;
  if (assetAgeYears > 0 && currentValue > 0 && initialValue > 0) {
    annualizedReturn = ((Math.pow(currentValue / initialValue, 1 / assetAgeYears) - 1) * 100);
  }
  
  return {
    initialValue,
    currentValue,
    absoluteChange,
    percentageChange,
    acquisitionDate,
    assetAgeYears,
    annualizedReturn
  };
};

/**
 * Format a date for display
 * @param {string} dateString - Date string to format
 * @param {Object} options - Format options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return new Date(dateString).toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Prepare chart data for history visualization
 * @param {Array} valueHistory - Array of historical values
 * @returns {Object|null} Chart data and options, or null if no data
 */
export const prepareHistoryChart = (valueHistory) => {
  if (!valueHistory || valueHistory.length === 0) {
    return null;
  }
  
  const chartData = {
    labels: valueHistory.map(point => {
      return new Date(point.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }),
    datasets: [
      {
        label: 'Asset Value',
        data: valueHistory.map(point => point.value),
        fill: 'start',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        borderColor: '#3f51b5',
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#3f51b5'
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => {
            return '$' + value.toLocaleString('en-US');
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              });
            }
            return label;
          }
        }
      }
    }
  };
  
  return { data: chartData, options: chartOptions };
};
