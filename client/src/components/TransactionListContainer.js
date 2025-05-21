/**
 * TransactionListContainer - Integration component that combines:
 * - Optimized transaction fetching with useTransactions hook
 * - Filtering with TransactionFilterBar
 * - Virtualized rendering with VirtualizedTransactionList
 * - Lazy loading for mobile optimization
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import VirtualizedTransactionList from './VirtualizedTransactionList';
import TransactionFilterBar from './TransactionFilterBar';
import PropTypes from 'prop-types';

// Default items per page
const DEFAULT_PAGE_SIZE = 20;

/**
 * TransactionListContainer Component
 */
const TransactionListContainer = ({
  renderTransactionItem,
  showFilters = true,
  className,
  style,
  defaultSortField = 'date',
  defaultSortDirection = 'desc',
  itemHeight = 72,
  loadMoreThreshold = 300,
  emptyComponent,
  onTransactionSelect
}) => {
  // Get transactions from the custom hook
  const {
    transactions,
    loading,
    pagination,
    fetchTransactions,
    updateFilters,
    filters
  } = useTransactions();
  
  // Local state
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [page, setPage] = useState(1);
  
  // Load initial data
  useEffect(() => {
    fetchTransactions(1, DEFAULT_PAGE_SIZE);
  }, [fetchTransactions]);
  
  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    // Reset pagination when filters change
    setPage(1);
    updateFilters(newFilters);
  }, [updateFilters]);
  
  // Handle load more
  const handleLoadMore = useCallback(() => {
    // Don't load more if we're already at the last page
    if (page >= pagination.totalPages || loading || loadingMore) {
      return;
    }
    
    const nextPage = page + 1;
    
    setLoadingMore(true);
    fetchTransactions(nextPage, DEFAULT_PAGE_SIZE)
      .finally(() => {
        setLoadingMore(false);
        setPage(nextPage);
      });
  }, [page, pagination.totalPages, loading, loadingMore, fetchTransactions]);
  
  // Handle sort
  const handleSort = useCallback((field) => {
    // If clicking the same field, toggle direction
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection]);
  
  // Memoize sorted transactions to avoid unnecessary sorts
  const sortedTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    // Create a new array to avoid mutating the original
    return [...transactions].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'date') {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortField === 'amount') {
        comparison = parseFloat(a.amount) - parseFloat(b.amount);
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else {
        // Default sort by ID
        comparison = a.id.localeCompare(b.id);
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [transactions, sortField, sortDirection]);
  
  // Render the transaction item
  const renderItem = useCallback((transaction, index) => {
    return renderTransactionItem({
      transaction,
      index,
      onSelect: onTransactionSelect,
      sortField,
      sortDirection
    });
  }, [renderTransactionItem, onTransactionSelect, sortField, sortDirection]);
  
  // Render header with sort controls
  const renderHeader = useMemo(() => {
    if (!transactions.length) return null;
    
    return (
      <div className="transaction-list-header">
        <div 
          className={`header-cell date-cell ${sortField === 'date' ? `sorted-${sortDirection}` : ''}`}
          onClick={() => handleSort('date')}
        >
          Date
          {sortField === 'date' && <span className="sort-indicator">▲</span>}
        </div>
        <div 
          className={`header-cell description-cell`}
        >
          Description
        </div>
        <div 
          className={`header-cell category-cell ${sortField === 'category' ? `sorted-${sortDirection}` : ''}`}
          onClick={() => handleSort('category')}
        >
          Category
          {sortField === 'category' && <span className="sort-indicator">▲</span>}
        </div>
        <div 
          className={`header-cell amount-cell ${sortField === 'amount' ? `sorted-${sortDirection}` : ''}`}
          onClick={() => handleSort('amount')}
        >
          Amount
          {sortField === 'amount' && <span className="sort-indicator">▲</span>}
        </div>
      </div>
    );
  }, [transactions.length, sortField, sortDirection, handleSort]);
  
  // Render the list container with filters and virtualized list
  return (
    <div className={`transaction-list-container ${className || ''}`} style={style}>
      {/* Filter Bar */}
      {showFilters && (
        <TransactionFilterBar 
          onFilterChange={handleFilterChange}
          defaultCollapsed={true}
        />
      )}
      
      {/* Loading indicator */}
      {loading && !loadingMore && (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <span>Loading transactions...</span>
        </div>
      )}
      
      {/* Virtualized List */}
      <VirtualizedTransactionList
        items={sortedTransactions}
        renderItem={renderItem}
        itemHeight={itemHeight}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={loadMoreThreshold}
        loadingMore={loadingMore}
        header={renderHeader}
        emptyComponent={
          !loading ? (
            emptyComponent || (
              <div className="empty-transactions">
                <h3>No transactions found</h3>
                <p>Try adjusting your filters or add a new transaction.</p>
              </div>
            )
          ) : null
        }
        className="transactions-virtual-list"
      />
      
      {/* Pagination summary */}
      {!loading && transactions.length > 0 && (
        <div className="pagination-summary">
          Showing {transactions.length} of {pagination.totalCount} transactions
        </div>
      )}
    </div>
  );
};

TransactionListContainer.propTypes = {
  renderTransactionItem: PropTypes.func.isRequired,
  showFilters: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  defaultSortField: PropTypes.string,
  defaultSortDirection: PropTypes.string,
  itemHeight: PropTypes.number,
  loadMoreThreshold: PropTypes.number,
  emptyComponent: PropTypes.node,
  onTransactionSelect: PropTypes.func
};

export default React.memo(TransactionListContainer);
