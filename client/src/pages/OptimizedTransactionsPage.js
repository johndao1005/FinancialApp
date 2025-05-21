/**
 * OptimizedTransactionsPage - Example implementation of all optimized transaction components
 * 
 * This page demonstrates how to use:
 * - useTransactions hook for optimized data fetching
 * - VirtualizedTransactionList for efficient rendering
 * - TransactionFilterBar for optimized filtering
 * - TransactionItem with optimistic updates
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionListContainer from '../components/TransactionListContainer';
import TransactionItem from '../components/TransactionItem';
import '../styles/transactionComponents.css';

const OptimizedTransactionsPage = () => {
  // Get transactions from custom hook
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError
  } = useTransactions();
  
  // Local state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit', 'delete'
  
  // Load initial data
  useEffect(() => {
    fetchTransactions(1, 20);
  }, [fetchTransactions]);
  
  // Handle transaction selection
  const handleSelectTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
  }, []);
  
  // Handle transaction edit
  const handleEditTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setModalType('edit');
    setShowModal(true);
  }, []);
  
  // Handle transaction delete
  const handleDeleteTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setModalType('delete');
    setShowModal(true);
  }, []);
  
  // Handle add new transaction
  const handleAddTransaction = useCallback(() => {
    setSelectedTransaction(null);
    setModalType('create');
    setShowModal(true);
  }, []);
  
  // Render transaction item for the virtualized list
  const renderTransactionItem = useCallback(({ transaction, index, onSelect }) => {
    return (
      <TransactionItem
        transaction={transaction}
        onSelect={handleSelectTransaction}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        isSelected={selectedTransaction?.id === transaction.id}
      />
    );
  }, [selectedTransaction, handleSelectTransaction, handleEditTransaction, handleDeleteTransaction]);
  
  // Handle modal confirm action
  const handleModalConfirm = useCallback(async (formData) => {
    try {
      if (modalType === 'create') {
        await createTransaction(formData);
      } else if (modalType === 'edit' && selectedTransaction) {
        // Use optimistic updates for edit operations
        await updateTransaction(selectedTransaction.id, formData, true);
      } else if (modalType === 'delete' && selectedTransaction) {
        await deleteTransaction(selectedTransaction.id);
      }
      
      setShowModal(false);
      setSelectedTransaction(null);
    } catch (err) {
      console.error('Transaction operation failed:', err);
      // Error will be handled by the hook and shown in the UI
    }
  }, [modalType, selectedTransaction, createTransaction, updateTransaction, deleteTransaction]);
  
  // Handle modal cancel
  const handleModalCancel = useCallback(() => {
    setShowModal(false);
    setSelectedTransaction(null);
  }, []);
  
  // Show error notification if there is an error
  useEffect(() => {
    if (error) {
      // Show error notification
      const timeout = setTimeout(() => {
        clearError();
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [error, clearError]);
  
  return (
    <div className="optimized-transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <button 
          className="add-transaction-btn"
          onClick={handleAddTransaction}
        >
          <i className="fas fa-plus"></i> Add Transaction
        </button>
      </div>
      
      {/* Error notification */}
      {error && (
        <div className="error-notification">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      
      {/* Main transaction list container */}
      <div className="transactions-container">
        <TransactionListContainer
          renderTransactionItem={renderTransactionItem}
          showFilters={true}
          defaultSortField="date"
          defaultSortDirection="desc"
          onTransactionSelect={handleSelectTransaction}
        />
      </div>
      
      {/* Transaction modal would go here (create/edit/delete) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {modalType === 'create' && 'Add Transaction'}
                {modalType === 'edit' && 'Edit Transaction'}
                {modalType === 'delete' && 'Delete Transaction'}
              </h2>
              <button className="close-btn" onClick={handleModalCancel}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* Modal content would be implemented here */}
              {/* This would include forms for create/edit and confirmation for delete */}
              <p>
                {modalType === 'delete' 
                  ? `Are you sure you want to delete "${selectedTransaction?.description}"?` 
                  : 'Transaction form would go here'}
              </p>
            </div>
            
            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleModalCancel}>Cancel</button>
              <button 
                className={`confirm-btn ${modalType === 'delete' ? 'delete-btn' : 'save-btn'}`}
                onClick={() => handleModalConfirm({})}
              >
                {modalType === 'create' && 'Create Transaction'}
                {modalType === 'edit' && 'Save Changes'}
                {modalType === 'delete' && 'Delete Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedTransactionsPage;
