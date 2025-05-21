/**
 * Asset Valuation Update Dialog
 * 
 * Dialog for updating an asset's value and recording a valuation transaction.
 * Provides options for different valuation methods and depreciation/appreciation settings.
 */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createAssetTransaction, updateAsset } from '../../../redux/slices/assetSlice';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormHelperText,
  Box,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  calculateStraightLineDepreciation,
  calculateDoubleDecliningSalvage,
  calculateAppreciation,
  formatCurrency
} from '../../../utils/assetUtils';

const ValuationUpdateDialog = ({ open, onClose, asset }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Form state
  const [valuationData, setValuationData] = useState({
    date: new Date(),
    currentValue: '',
    transactionType: 'valuation_update',
    notes: '',
    
    // Depreciation/Appreciation settings
    depreciationMethod: 'none',
    appreciationType: 'none',
    annualRateOfReturn: '',
    salvageValue: '',
    usefulLifeYears: '',
    
    // Valuation scheduling
    valuationMethod: 'manual',
    nextValuationDate: null,
    
    // Calculated value
    useCalculatedValue: false
  });
  
  // Preview state
  const [previewValue, setPreviewValue] = useState(null);
  
  // Initialize form with asset data
  useEffect(() => {
    if (asset) {
      setValuationData({
        date: new Date(),
        currentValue: asset.currentValue,
        transactionType: 'valuation_update',
        notes: '',
        
        depreciationMethod: asset.depreciationMethod || 'none',
        appreciationType: asset.appreciationType || 'none',
        annualRateOfReturn: asset.annualRateOfReturn || '',
        salvageValue: asset.salvageValue || (asset.initialValue * 0.1).toFixed(2), // 10% of initial value by default
        usefulLifeYears: asset.usefulLifeYears || '10',
        
        valuationMethod: asset.valuationMethod || 'manual',
        nextValuationDate: asset.nextValuationDate ? new Date(asset.nextValuationDate) : null,
        
        useCalculatedValue: false
      });
    }
  }, [asset]);
  
  // Calculate the projected asset value based on current settings
  useEffect(() => {
    if (!asset) return;
    
    try {
      const initialValue = parseFloat(asset.initialValue);
      const acquisitionDate = new Date(asset.acquisitionDate);
      const currentDate = new Date(valuationData.date);
      
      // Calculate years held
      const yearsHeld = (currentDate - acquisitionDate) / (1000 * 60 * 60 * 24 * 365);
      
      let calculatedValue = 0;
      
      if (valuationData.depreciationMethod !== 'none') {
        // Use depreciation calculation
        const salvageValue = parseFloat(valuationData.salvageValue || 0);
        const usefulLifeYears = parseFloat(valuationData.usefulLifeYears || 10);
        
        if (valuationData.depreciationMethod === 'straight-line') {
          calculatedValue = calculateStraightLineDepreciation(
            initialValue,
            salvageValue,
            usefulLifeYears,
            yearsHeld
          );
        } else if (valuationData.depreciationMethod === 'double-declining') {
          calculatedValue = calculateDoubleDecliningSalvage(
            initialValue,
            salvageValue,
            usefulLifeYears,
            yearsHeld
          );
        }
      } else if (valuationData.appreciationType !== 'none') {
        // Use appreciation calculation
        const rate = parseFloat(valuationData.annualRateOfReturn || 0);
        const isCompounded = valuationData.appreciationType === 'compound';
        
        calculatedValue = calculateAppreciation(
          initialValue,
          rate,
          yearsHeld,
          isCompounded
        );
      } else {
        // No calculation, use current value
        calculatedValue = parseFloat(asset.currentValue);
      }
      
      setPreviewValue(calculatedValue);
      
      // Update current value if using calculated value
      if (valuationData.useCalculatedValue) {
        setValuationData(prev => ({
          ...prev,
          currentValue: calculatedValue.toFixed(2)
        }));
      }
    } catch (error) {
      console.error('Error calculating value:', error);
    }
  }, [
    asset, 
    valuationData.date, 
    valuationData.depreciationMethod,
    valuationData.appreciationType,
    valuationData.annualRateOfReturn,
    valuationData.salvageValue,
    valuationData.usefulLifeYears,
    valuationData.useCalculatedValue
  ]);
  
  const handleChange = (field) => (e) => {
    setValuationData({
      ...valuationData,
      [field]: e.target.value
    });
  };
  
  const handleDateChange = (date) => {
    setValuationData({
      ...valuationData,
      date
    });
  };
  
  const handleNextValuationDateChange = (date) => {
    setValuationData({
      ...valuationData,
      nextValuationDate: date
    });
  };
  
  const handleSubmit = async () => {
    setFormError(null);
    
    try {
      // Validate form
      if (!valuationData.date) {
        setFormError('Valuation date is required');
        return;
      }
      
      if (!valuationData.currentValue || parseFloat(valuationData.currentValue) <= 0) {
        setFormError('Current value must be a positive number');
        return;
      }
      
      // If using depreciation, validate depreciation settings
      if (valuationData.depreciationMethod !== 'none') {
        if (!valuationData.salvageValue || parseFloat(valuationData.salvageValue) < 0) {
          setFormError('Salvage value must be a non-negative number');
          return;
        }
        
        if (!valuationData.usefulLifeYears || parseFloat(valuationData.usefulLifeYears) <= 0) {
          setFormError('Useful life must be a positive number');
          return;
        }
      }
      
      // If using appreciation, validate appreciation settings
      if (valuationData.appreciationType !== 'none') {
        if (!valuationData.annualRateOfReturn) {
          setFormError('Annual rate of return is required');
          return;
        }
      }
      
      // Set loading state
      setLoading(true);
      
      // Create transaction first
      const transactionData = {
        assetId: asset.id,
        date: valuationData.date.toISOString(),
        transactionType: valuationData.transactionType,
        amount: parseFloat(valuationData.currentValue) - parseFloat(asset.currentValue),
        valueAfterTransaction: parseFloat(valuationData.currentValue),
        notes: valuationData.notes
      };
      
      await dispatch(createAssetTransaction(transactionData));
        // Update asset settings
      const assetUpdateData = {
        id: asset.id,
        currentValue: parseFloat(valuationData.currentValue),
        lastValueUpdateDate: valuationData.date.toISOString(),
        depreciationMethod: valuationData.depreciationMethod,
        appreciationType: valuationData.appreciationType,
        annualRateOfReturn: valuationData.annualRateOfReturn ? 
          parseFloat(valuationData.annualRateOfReturn) : null,
        salvageValue: valuationData.salvageValue ? 
          parseFloat(valuationData.salvageValue) : null,
        usefulLifeYears: valuationData.usefulLifeYears ? 
          parseInt(valuationData.usefulLifeYears, 10) : null,
        valuationMethod: valuationData.valuationMethod,
        nextValuationDate: valuationData.nextValuationDate ? 
          valuationData.nextValuationDate.toISOString() : null
      };
      
      // Call redux action to update asset
      await dispatch(updateAsset({ assetId: asset.id, assetData: assetUpdateData }));
      
      // Close dialog
      onClose();
    } catch (error) {
      console.error('Error updating valuation:', error);
      setFormError('Error updating valuation. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    onClose();
  };
  
  // Format currency for display
  const displayCurrency = (value) => {
    if (!value) return '';
    return formatCurrency(value, asset?.currency || 'USD');
  };
  
  if (!asset) return null;
  
  return (
    <Dialog open={open} onClose={loading ? null : handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>Update Asset Valuation</DialogTitle>
      
      <DialogContent dividers>
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Basic valuation information */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Valuation Date"
                value={valuationData.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="normal" required />
                )}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              label="Current Value"
              value={valuationData.currentValue}
              onChange={handleChange('currentValue')}
              fullWidth
              margin="normal"
              required
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                )
              }}
              disabled={valuationData.useCalculatedValue}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Valuation Notes"
              value={valuationData.notes}
              onChange={handleChange('notes')}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              placeholder="Add notes about this valuation update"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Divider>
              <Typography variant="subtitle2" color="textSecondary">
                Valuation Method
              </Typography>
            </Divider>
          </Grid>
          
          {/* Depreciation vs Appreciation settings */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Depreciation Method</InputLabel>
              <Select
                value={valuationData.depreciationMethod}
                onChange={(e) => {
                  // If selecting a depreciation method, reset appreciation
                  const newVal = e.target.value;
                  setValuationData({
                    ...valuationData,
                    depreciationMethod: newVal,
                    appreciationType: newVal !== 'none' ? 'none' : valuationData.appreciationType
                  });
                }}
                label="Depreciation Method"
              >
                <MenuItem value="none">No Depreciation</MenuItem>
                <MenuItem value="straight-line">Straight-Line Method</MenuItem>
                <MenuItem value="double-declining">Double-Declining Balance</MenuItem>
              </Select>
              <FormHelperText>
                For assets that lose value over time (vehicles, equipment)
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Appreciation Type</InputLabel>
              <Select
                value={valuationData.appreciationType}
                onChange={(e) => {
                  // If selecting an appreciation type, reset depreciation
                  const newVal = e.target.value;
                  setValuationData({
                    ...valuationData,
                    appreciationType: newVal,
                    depreciationMethod: newVal !== 'none' ? 'none' : valuationData.depreciationMethod
                  });
                }}
                label="Appreciation Type"
              >
                <MenuItem value="none">No Appreciation</MenuItem>
                <MenuItem value="compound">Compound (e.g., investments)</MenuItem>
                <MenuItem value="linear">Linear (e.g., fixed-rate savings)</MenuItem>
              </Select>
              <FormHelperText>
                For assets that gain value over time (property, investments)
              </FormHelperText>
            </FormControl>
          </Grid>
          
          {/* Depreciation settings */}
          {valuationData.depreciationMethod !== 'none' && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Useful Life (Years)"
                  value={valuationData.usefulLifeYears}
                  onChange={handleChange('usefulLifeYears')}
                  fullWidth
                  margin="normal"
                  required
                  type="number"
                  InputProps={{
                    inputProps: { min: 1 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  label="Salvage Value"
                  value={valuationData.salvageValue}
                  onChange={handleChange('salvageValue')}
                  fullWidth
                  margin="normal"
                  required
                  type="number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    inputProps: { min: 0 }
                  }}
                />
              </Grid>
            </>
          )}
          
          {/* Appreciation settings */}
          {valuationData.appreciationType !== 'none' && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Annual Rate of Return (%)"
                value={valuationData.annualRateOfReturn}
                onChange={handleChange('annualRateOfReturn')}
                fullWidth
                margin="normal"
                required
                type="number"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                  inputProps: { step: 0.1 }
                }}
              />
            </Grid>
          )}
          
          {/* Calculated value preview and toggle */}
          {(valuationData.depreciationMethod !== 'none' || valuationData.appreciationType !== 'none') && (
            <Grid item xs={12}>
              <Box p={2} bgcolor="background.default" borderRadius={1}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs>
                    <Typography variant="subtitle2">
                      Calculated Value: {displayCurrency(previewValue)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Based on your {valuationData.depreciationMethod !== 'none' ? 'depreciation' : 'appreciation'} settings
                    </Typography>
                  </Grid>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={valuationData.useCalculatedValue}
                          onChange={(e) => {
                            setValuationData({
                              ...valuationData,
                              useCalculatedValue: e.target.checked,
                              currentValue: e.target.checked ? 
                                previewValue.toFixed(2) : valuationData.currentValue
                            });
                          }}
                        />
                      }
                      label="Use calculated value"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
          
          {/* Valuation scheduling */}
          <Grid item xs={12}>
            <Divider>
              <Typography variant="subtitle2" color="textSecondary">
                Valuation Schedule
              </Typography>
            </Divider>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Valuation Method</InputLabel>
              <Select
                value={valuationData.valuationMethod}
                onChange={handleChange('valuationMethod')}
                label="Valuation Method"
              >
                <MenuItem value="manual">Manual Updates</MenuItem>
                <MenuItem value="scheduled">Scheduled Updates</MenuItem>
                <MenuItem value="automatic">Automatic (Market-Based)</MenuItem>
              </Select>
              <FormHelperText>
                How this asset's value should be updated over time
              </FormHelperText>
            </FormControl>
          </Grid>
          
          {valuationData.valuationMethod === 'scheduled' && (
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Next Valuation Date"
                  value={valuationData.nextValuationDate}
                  onChange={handleNextValuationDateChange}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" required />
                  )}
                  minDate={new Date()} // Can't schedule in the past
                />
              </LocalizationProvider>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 'Update Valuation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ValuationUpdateDialog;
