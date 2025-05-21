/**
 * VirtualizedTransactionList - A virtualized list for efficient transaction rendering
 * 
 * Key features:
 * - Only renders visible items, improving performance for large lists
 * - Handles window scrolling and container scrolling
 * - Supports dynamic item heights
 * - Efficient rendering for mobile devices
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useInView } from 'react-intersection-observer';
import { useTransactions } from '../hooks/useTransactions';

// Default row height estimation
const DEFAULT_ROW_HEIGHT = 72; // px

/**
 * Calculate visible range based on scroll position and container dimensions
 * 
 * @param {number} scrollTop - Current scroll position
 * @param {number} viewportHeight - Height of the viewport
 * @param {number} itemHeight - Height of each item
 * @param {number} totalItems - Total number of items
 * @param {number} overscanCount - Number of items to render outside visible area
 * @returns {Object} Start and end indices of visible items
 */
const getVisibleRange = (scrollTop, viewportHeight, itemHeight, totalItems, overscanCount) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscanCount
  );
  
  return { startIndex, endIndex };
};

/**
 * Virtualized Transaction List Component
 */
const VirtualizedTransactionList = ({
  items,
  renderItem,
  itemHeight = DEFAULT_ROW_HEIGHT,
  overscanCount = 5,
  onEndReached,
  onEndReachedThreshold = 200,
  loadingMore = false,
  header,
  footer,
  className,
  style,
  emptyComponent
}) => {
  // Element refs
  const containerRef = useRef(null);
  
  // Get last transactions hook
  const { throttledFetchTransactions } = useTransactions();
  
  // State
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  
  // InView for infinite loading
  const { ref: endRef, inView: isEndVisible } = useInView({
    threshold: 0.1
  });
  
  // Initialize container dimensions
  useEffect(() => {
    if (containerRef.current) {
      setViewportHeight(containerRef.current.clientHeight);
    }
    
    const updateDimensions = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight);
      }
    };
    
    // Debounced resize handler
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  
  // Calculate visible range based on current scroll position
  const { startIndex, endIndex } = useMemo(() => {
    return getVisibleRange(
      scrollTop,
      viewportHeight,
      itemHeight,
      items.length,
      overscanCount
    );
  }, [scrollTop, viewportHeight, itemHeight, items.length, overscanCount]);
  
  // Handle scrolling inside the container
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    
    // Check if we need to load more data
    if (
      !loadingMore &&
      onEndReached &&
      e.target.scrollHeight - newScrollTop - e.target.clientHeight < onEndReachedThreshold
    ) {
      onEndReached();
    }
  }, [loadingMore, onEndReached, onEndReachedThreshold]);
  
  // Handle end reached
  useEffect(() => {
    if (isEndVisible && !loadingMore && onEndReached) {
      onEndReached();
    }
  }, [isEndVisible, loadingMore, onEndReached]);
  
  // Create styles for container and spacers
  const containerStyle = useMemo(() => ({
    overflow: 'auto',
    position: 'relative',
    height: '100%',
    ...style
  }), [style]);
  
  const totalHeight = items.length * itemHeight;
  
  const topSpacerHeight = startIndex * itemHeight;
  const bottomSpacerHeight = Math.max(0, totalHeight - (endIndex + 1) * itemHeight);
  
  // Check if list is empty
  const isEmpty = items.length === 0;
  
  // Slice only the visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [items, startIndex, endIndex]);
  
  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      onScroll={handleScroll}
    >
      {header}
      
      {isEmpty ? (
        emptyComponent || <div className="empty-list">No transactions found</div>
      ) : (
        <>
          {/* Top spacer to maintain scroll position */}
          <div style={{ height: topSpacerHeight }} />
          
          {/* Visible items */}
          {visibleItems.map((item, index) => (
            <div key={item.id || index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
          
          {/* Bottom spacer to maintain scroll position */}
          <div style={{ height: bottomSpacerHeight }} />
        </>
      )}
      
      {/* End detection reference */}
      <div ref={endRef} style={{ height: 1 }} />
      
      {/* Loading indicator */}
      {loadingMore && (
        <div className="loading-more">
          <div className="spinner"></div>
          <span>Loading more transactions...</span>
        </div>
      )}
      
      {footer}
    </div>
  );
};

VirtualizedTransactionList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  overscanCount: PropTypes.number,
  onEndReached: PropTypes.func,
  onEndReachedThreshold: PropTypes.number,
  loadingMore: PropTypes.bool,
  header: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  emptyComponent: PropTypes.node
};

export default React.memo(VirtualizedTransactionList);
