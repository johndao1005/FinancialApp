/**
 * TransactionFilterBar - Optimized filter component for transactions
 * 
 * Features:
 * - Debounced search input
 * - Memoized filter options 
 * - Reset functionality
 * - Mobile-friendly design
 * - Integrates with useTransactions hook
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import PropTypes from 'prop-types';

// Constants
const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'housing', label: 'Housing' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Healthcare' },
  { value: 'debt', label: 'Debt Payments' },
  { value: 'savings', label: 'Savings & Investments' },
  { value: 'income', label: 'Income' },
  { value: 'other', label: 'Other' }
];

const TRANSACTION_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' }
];

/**
 * TransactionFilterBar Component
 */
const TransactionFilterBar = ({ 
  className,
  defaultCollapsed = false,
  onFilterChange,
  showMobileToggle = true
}) => {
  // Get transactions hook
  const { filters, updateFilters, clearFilters } = useTransactions();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Refs
  const searchTimeout = useRef(null);
  
  // Debounced search handler
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      updateFilters({ search: value });
      if (onFilterChange) onFilterChange({ ...filters, search: value });
    }, 300);
  }, [filters, updateFilters, onFilterChange]);
  
  // Category change handler
  const handleCategoryChange = useCallback((e) => {
    const category = e.target.value;
    updateFilters({ category });
    if (onFilterChange) onFilterChange({ ...filters, category });
  }, [filters, updateFilters, onFilterChange]);
  
  // Type change handler
  const handleTypeChange = useCallback((e) => {
    const type = e.target.value;
    updateFilters({ type });
    if (onFilterChange) onFilterChange({ ...filters, type });
  }, [filters, updateFilters, onFilterChange]);
  
  // Date range handlers
  const handleStartDateChange = useCallback((e) => {
    const startDate = e.target.value ? new Date(e.target.value) : null;
    updateFilters({ startDate });
    if (onFilterChange) onFilterChange({ ...filters, startDate });
  }, [filters, updateFilters, onFilterChange]);
  
  const handleEndDateChange = useCallback((e) => {
    const endDate = e.target.value ? new Date(e.target.value) : null;
    updateFilters({ endDate });
    if (onFilterChange) onFilterChange({ ...filters, endDate });
  }, [filters, updateFilters, onFilterChange]);
  
  // Reset filters
  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    clearFilters();
    if (onFilterChange) onFilterChange({
      startDate: null,
      endDate: null,
      category: '',
      type: '',
      search: ''
    });
  }, [clearFilters, onFilterChange]);
  
  // Toggle collapse state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-collapse on mobile
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };
    
    // Debounced resize handler
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [isCollapsed]);
  
  // Format dates for date inputs
  const formatDateForInput = useCallback((date) => {
    if (!date) return '';
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }, []);
  
  // Memoized date values
  const startDateValue = useMemo(() => 
    formatDateForInput(filters.startDate), 
    [filters.startDate, formatDateForInput]
  );
  
  const endDateValue = useMemo(() => 
    formatDateForInput(filters.endDate), 
    [filters.endDate, formatDateForInput]
  );
  
  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.search || 
           filters.category || 
           filters.type || 
           filters.startDate || 
           filters.endDate;
  }, [filters]);
  
  return (
    <div className={`transaction-filter-bar ${className || ''}`}>
      {/* Mobile toggle button */}
      {showMobileToggle && isMobile && (
        <button 
          className={`filter-toggle-btn ${hasActiveFilters ? 'has-filters' : ''}`}
          onClick={toggleCollapse}
        >
          {isCollapsed ? 'Show Filters' : 'Hide Filters'}
          {hasActiveFilters && <span className="filter-badge">●</span>}
        </button>
      )}
      
      {/* Filter form */}
      <div className={`filter-container ${isCollapsed && isMobile ? 'collapsed' : ''}`}>
        <div className="filter-row">
          {/* Search input */}
          <div className="filter-group search-group">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
          
          {/* Category filter */}
          <div className="filter-group">
            <select 
              value={filters.category} 
              onChange={handleCategoryChange}
              className="filter-select"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Transaction type filter */}
          <div className="filter-group">
            <select 
              value={filters.type} 
              onChange={handleTypeChange}
              className="filter-select"
            >
              {TRANSACTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="filter-row">
          {/* Date range filters */}
          <div className="filter-group date-group">
            <label>From:</label>
            <input
              type="date"
              value={startDateValue}
              onChange={handleStartDateChange}
              className="date-input"
            />
          </div>
          
          <div className="filter-group date-group">
            <label>To:</label>
            <input
              type="date"
              value={endDateValue}
              onChange={handleEndDateChange}
              className="date-input"
            />
          </div>
          
          {/* Reset button */}
          <div className="filter-group">
            <button 
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className={`reset-button ${!hasActiveFilters ? 'disabled' : ''}`}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TransactionFilterBar.propTypes = {
  className: PropTypes.string,
  defaultCollapsed: PropTypes.bool,
  onFilterChange: PropTypes.func,
  showMobileToggle: PropTypes.bool
};

export default React.memo(TransactionFilterBar);
