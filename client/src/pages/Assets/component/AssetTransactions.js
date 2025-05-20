/**
 * Asset Transaction Component
 * 
 * This component displays transaction history for an asset
 * and provides functionality to add new transactions.
 */
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  Grid 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getTransactionColor } from '../../../constants/assetConstants';

const AssetTransactions = ({ assetId, transactions, assetType, onAddTransaction }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'valuation_update',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    // Reset form
    setNewTransaction({
      type: 'valuation_update',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: value
    });
  };

  const handleSubmit = () => {
    onAddTransaction({
      ...newTransaction,
      amount: parseFloat(newTransaction.amount),
      assetId
    });
    handleCloseDialog();
  };

  // Get appropriate transaction options based on asset type
  const getTransactionOptions = () => {
    const commonOptions = [
      { value: 'valuation_update', label: 'Valuation Update' }
    ];

    switch (assetType) {
      case 'property':
        return [
          ...commonOptions,
          { value: 'purchase', label: 'Purchase' },
          { value: 'sale', label: 'Sale' },
          { value: 'expense', label: 'Expense' },
          { value: 'rental_income', label: 'Rental Income' }
        ];
      case 'stock':
        return [
          ...commonOptions,
          { value: 'purchase', label: 'Buy Shares' },
          { value: 'sale', label: 'Sell Shares' },
          { value: 'dividend', label: 'Dividend' },
          { value: 'fee', label: 'Fee' }
        ];
      case 'crypto':
        return [
          ...commonOptions,
          { value: 'purchase', label: 'Buy' },
          { value: 'sale', label: 'Sell' },
          { value: 'fee', label: 'Fee' }
        ];
      case 'term_deposit':
        return [
          ...commonOptions,
          { value: 'contribution', label: 'Contribution' },
          { value: 'withdrawal', label: 'Withdrawal' },
          { value: 'interest', label: 'Interest' }
        ];
      default:
        return [
          ...commonOptions,
          { value: 'purchase', label: 'Purchase' },
          { value: 'sale', label: 'Sale' },
        ];
    }
  };

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Transaction History</Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Add Transaction
          </Button>
        </Grid>
      </Grid>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span style={{ 
                      color: getTransactionColor(transaction.type),
                      textTransform: 'capitalize'
                    }}>
                      {transaction.type.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">
                    {transaction.amount.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Transaction Type"
                name="type"
                value={newTransaction.type}
                onChange={handleInputChange}
              >
                {getTransactionOptions().map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                name="amount"
                value={newTransaction.amount}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <span>$</span>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="date"
                value={newTransaction.date}
                onChange={handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!newTransaction.amount || !newTransaction.date}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssetTransactions;
