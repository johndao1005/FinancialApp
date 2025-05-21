/**
 * Add Asset Dialog Component
 * 
 * Modal dialog for adding a new asset to the user's portfolio.
 * Supports different asset types with type-specific form fields.
 */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createAsset } from '../../../redux/slices/assetSlice';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';

const assetTypes = [
  { value: 'property', label: 'Real Estate Property' },
  { value: 'stock', label: 'Stocks & Shares' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'term_deposit', label: 'Term Deposit / Savings' },
  { value: 'other', label: 'Other Asset' }
];

const AddAssetDialog = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [assetData, setAssetData] = useState({
    name: '',
    assetType: 'property',
    initialValue: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    currency: 'USD',
    quantity: '',
    symbol: '',
    location: '',
    notes: '',
    isInvestment: false,
    annualRateOfReturn: ''
  });
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAssetData({
      ...assetData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  const validateStep = () => {
    const newErrors = {};
    
    if (activeStep === 0) {
      if (!assetData.name.trim()) {
        newErrors.name = 'Asset name is required';
      }
      if (!assetData.assetType) {
        newErrors.assetType = 'Asset type is required';
      }
    } else if (activeStep === 1) {
      if (!assetData.initialValue || isNaN(assetData.initialValue) || parseFloat(assetData.initialValue) <= 0) {
        newErrors.initialValue = 'A valid positive amount is required';
      }
      if (!assetData.acquisitionDate) {
        newErrors.acquisitionDate = 'Acquisition date is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  const handleSubmit = async () => {
    if (validateStep()) {
      setSubmitting(true);
      
      try {
        // Format data for API
        const formattedData = {
          ...assetData,
          initialValue: parseFloat(assetData.initialValue),
          quantity: assetData.quantity ? parseFloat(assetData.quantity) : null,
          annualRateOfReturn: assetData.annualRateOfReturn ? 
            parseFloat(assetData.annualRateOfReturn) : null
        };
        
        await dispatch(createAsset(formattedData)).unwrap();
        
        // Close dialog and reset form
        onClose();
        setAssetData({
          name: '',
          assetType: 'property',
          initialValue: '',
          acquisitionDate: new Date().toISOString().split('T')[0],
          currency: 'USD',
          quantity: '',
          symbol: '',
          location: '',
          notes: '',
          isInvestment: false,
          annualRateOfReturn: ''
        });
        setActiveStep(0);
      } catch (err) {
        console.error('Failed to create asset:', err);
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  const handleCancel = () => {
    onClose();
    setAssetData({
      name: '',
      assetType: 'property',
      initialValue: '',
      acquisitionDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
      quantity: '',
      symbol: '',
      location: '',
      notes: '',
      isInvestment: false,
      annualRateOfReturn: ''
    });
    setActiveStep(0);
    setErrors({});
  };
  
  // Step content components
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Asset Name"
                name="name"
                value={assetData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.assetType}>
                <InputLabel>Asset Type</InputLabel>
                <Select
                  name="assetType"
                  value={assetData.assetType}
                  onChange={handleInputChange}
                  label="Asset Type"
                  required
                >
                  {assetTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.assetType && <span className="MuiFormHelperText-root Mui-error">{errors.assetType}</span>}
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Initial Value"
                name="initialValue"
                type="number"
                value={assetData.initialValue}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                error={!!errors.initialValue}
                helperText={errors.initialValue}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Acquisition Date"
                name="acquisitionDate"
                type="date"
                value={assetData.acquisitionDate}
                onChange={handleInputChange}
                error={!!errors.acquisitionDate}
                helperText={errors.acquisitionDate}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Currency"
                name="currency"
                value={assetData.currency}
                onChange={handleInputChange}
                placeholder="USD"
              />
            </Grid>
            {(assetData.assetType === 'stock' || assetData.assetType === 'crypto') && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Quantity / Units"
                    name="quantity"
                    type="number"
                    value={assetData.quantity}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Symbol / Ticker"
                    name="symbol"
                    value={assetData.symbol}
                    onChange={handleInputChange}
                    placeholder="AAPL, BTC, etc."
                  />
                </Grid>
              </>
            )}
            {assetData.assetType === 'property' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Property Location"
                  name="location"
                  value={assetData.location}
                  onChange={handleInputChange}
                />
              </Grid>
            )}
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={assetData.isInvestment}
                    onChange={handleInputChange}
                    name="isInvestment"
                    color="primary"
                  />
                }
                label="This is an investment asset (include in portfolio performance)"
              />
            </Grid>
            {assetData.isInvestment && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expected Annual Rate of Return (%)"
                  name="annualRateOfReturn"
                  type="number"
                  value={assetData.annualRateOfReturn}
                  onChange={handleInputChange}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={assetData.notes}
                onChange={handleInputChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };
  
  const steps = ['Basic Info', 'Value & Details', 'Additional Info'];
  
  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add New Asset</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {getStepContent(activeStep)}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Add Asset'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddAssetDialog;
