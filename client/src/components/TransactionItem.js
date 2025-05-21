/**
 * TransactionItem - Optimized component for rendering individual transactions
 * 
 * Features:
 * - Memoized to prevent unnecessary re-renders
 * - Efficient formatting of dates and currency
 * - Responsive design for mobile and desktop
 * - Supports swipe actions on mobile
 * - Visual indicators for transaction types
 */
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Format a date string to a readable format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Format currency amount
 * @param {number|string} amount - Amount to format
 * @param {string} type - Transaction type (income or expense)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, type) => {
  const numAmount = parseFloat(amount);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  });
  
  // For display, make expenses negative 
  const displayAmount = type === 'expense' ? -Math.abs(numAmount) : numAmount;
  return formatter.format(displayAmount);
};

/**
 * Get color based on transaction type or category
 * @param {string} type - Transaction type (income or expense)
 * @param {string} category - Transaction category
 * @returns {string} Color code
 */
const getTypeColor = (type, category) => {
  if (type === 'income') return '#28a745'; // Green for income
  if (type === 'expense') {
    // Different red shades based on category for expenses
    switch (category) {
      case 'housing': return '#dc3545';
      case 'transportation': return '#e63946';
      case 'food': return '#f94144';
      case 'utilities': return '#cc2936';
      case 'debt': return '#d62828';
      default: return '#dc3545'; // Default red
    }
  }
  return '#6c757d'; // Default gray
};

/**
 * Get icon for transaction category
 * @param {string} category - Transaction category
 * @returns {string} Icon class name
 */
const getCategoryIcon = (category) => {
  switch (category) {
    case 'housing': return 'fa-home';
    case 'transportation': return 'fa-car';
    case 'food': return 'fa-utensils';
    case 'utilities': return 'fa-bolt';
    case 'entertainment': return 'fa-film';
    case 'health': return 'fa-medkit';
    case 'debt': return 'fa-credit-card';
    case 'savings': return 'fa-piggy-bank';
    case 'income': return 'fa-wallet';
    default: return 'fa-receipt';
  }
};

/**
 * TransactionItem Component
 */
const TransactionItem = ({ 
  transaction, 
  onSelect, 
  onDelete, 
  onEdit, 
  showActions = true,
  isSelected = false
}) => {
  // Memoized computed values
  const formattedDate = useMemo(() => 
    formatDate(transaction.date), 
    [transaction.date]
  );
  
  const formattedAmount = useMemo(() => 
    formatCurrency(transaction.amount, transaction.type), 
    [transaction.amount, transaction.type]
  );
  
  const typeColor = useMemo(() => 
    getTypeColor(transaction.type, transaction.category), 
    [transaction.type, transaction.category]
  );
  
  const categoryIcon = useMemo(() => 
    getCategoryIcon(transaction.category), 
    [transaction.category]
  );
  
  // Event handlers
  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(transaction);
    }
  }, [transaction, onSelect]);
  
  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(transaction);
    }
  }, [transaction, onEdit]);
  
  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(transaction);
    }
  }, [transaction, onDelete]);
  
  // Check if the transaction is optimistic (pending save)
  const isOptimistic = transaction._optimistic;
  
  return (
    <div 
      className={`transaction-item ${isSelected ? 'selected' : ''} ${isOptimistic ? 'optimistic' : ''}`}
      onClick={handleClick}
      style={{ borderLeftColor: typeColor }}
    >
      <div className="transaction-icon">
        <i className={`fas ${categoryIcon}`} style={{ color: typeColor }}></i>
      </div>
      
      <div className="transaction-date">
        {formattedDate}
      </div>
      
      <div className="transaction-description">
        <div className="transaction-title">{transaction.description}</div>
        <div className="transaction-category">{transaction.category}</div>
      </div>
      
      <div 
        className={`transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}
        style={{ color: typeColor }}
      >
        {formattedAmount}
        {isOptimistic && (
          <span className="pending-indicator" title="Saving...">⋯</span>
        )}
      </div>
      
      {showActions && (
        <div className="transaction-actions">
          <button 
            className="action-btn edit-btn"
            onClick={handleEdit}
            title="Edit transaction"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={handleDelete}
            title="Delete transaction"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      )}
    </div>
  );
};

TransactionItem.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    type: PropTypes.string.isRequired,
    _optimistic: PropTypes.bool
  }).isRequired,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  showActions: PropTypes.bool,
  isSelected: PropTypes.bool
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(TransactionItem, (prevProps, nextProps) => {
  // Custom comparison function for the memo
  // Only re-render if the transaction data actually changed
  // or if the selection state changed
  return prevProps.transaction.id === nextProps.transaction.id &&
         prevProps.transaction.amount === nextProps.transaction.amount &&
         prevProps.transaction.description === nextProps.transaction.description &&
         prevProps.transaction.date === nextProps.transaction.date &&
         prevProps.transaction.category === nextProps.transaction.category &&
         prevProps.transaction.type === nextProps.transaction.type &&
         prevProps.transaction._optimistic === nextProps.transaction._optimistic &&
         prevProps.isSelected === nextProps.isSelected;
});
