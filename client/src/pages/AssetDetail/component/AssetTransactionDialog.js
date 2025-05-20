/**
 * AssetTransactionDialog Component
 * 
 * Dialog for adding new transactions to an asset.
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
  MenuItem,
  InputAdornment
} from '@mui/material';

const AssetTransactionDialog = ({ 
  open, 
  onClose, 
  transactionData, 
  onChange, 
  onAdd,
  assetHasQuantity 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add Transaction</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Transaction Type"
              name="transactionType"
              value={transactionData.transactionType}
              onChange={onChange}
            >
              <MenuItem value="valuation_update">Value Update</MenuItem>
              <MenuItem value="purchase">Purchase/Acquisition</MenuItem>
              <MenuItem value="sale">Sale</MenuItem>
              <MenuItem value="contribution">Contribution</MenuItem>
              <MenuItem value="withdrawal">Withdrawal</MenuItem>
              <MenuItem value="dividend">Dividend</MenuItem>
              <MenuItem value="interest">Interest</MenuItem>
              <MenuItem value="fee">Fee</MenuItem>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={transactionData.date}
              onChange={onChange}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={transactionData.transactionType === 'valuation_update' ? 'New Total Value' : 'Amount'}
              name="amount"
              type="number"
              value={transactionData.amount}
              onChange={onChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              helperText={
                transactionData.transactionType === 'valuation_update' 
                  ? 'Enter the new total value of the asset' 
                  : transactionData.transactionType === 'sale' || transactionData.transactionType === 'withdrawal' || transactionData.transactionType === 'fee'
                  ? 'Enter a negative amount'
                  : 'Enter a positive amount'
              }
            />
          </Grid>
          
          {['purchase', 'sale', 'split'].includes(transactionData.transactionType) && assetHasQuantity && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                value={transactionData.quantity}
                onChange={onChange}
              />
            </Grid>
          )}
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              name="notes"
              value={transactionData.notes}
              onChange={onChange}
              multiline
              rows={2}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={onAdd}
          disabled={!transactionData.amount}
        >
          Add Transaction
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetTransactionDialog;
