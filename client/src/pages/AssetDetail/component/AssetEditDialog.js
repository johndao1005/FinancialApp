/**
 * AssetEditDialog Component
 * 
 * Dialog for editing asset details.
 */
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Checkbox,
  InputAdornment
} from '@mui/material';

const AssetEditDialog = ({ 
  open, 
  onClose, 
  assetData, 
  onChange, 
  onSave 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Asset</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Asset Name"
              name="name"
              value={assetData.name}
              onChange={onChange}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Current Value"
              name="currentValue"
              type="number"
              value={assetData.currentValue}
              onChange={onChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
          </Grid>

          {assetData.isInvestment && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Annual Rate of Return (%)"
                name="annualRateOfReturn"
                type="number"
                value={assetData.annualRateOfReturn}
                onChange={onChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
          )}

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={assetData.isInvestment}
                  onChange={onChange}
                  name="isInvestment"
                />
              }
              label="This is an investment asset"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={assetData.isActive}
                  onChange={onChange}
                  name="isActive"
                />
              }
              label="Asset is active"
            />
          </Grid>

          {!assetData.isActive && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sale Date"
                  name="soldDate"
                  type="date"
                  value={assetData.soldDate}
                  onChange={onChange}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sale Value"
                  name="saleValue"
                  type="number"
                  value={assetData.saleValue}
                  onChange={onChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={assetData.notes}
              onChange={onChange}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="primary" onClick={onSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetEditDialog;
