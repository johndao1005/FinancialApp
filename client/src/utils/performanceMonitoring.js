/**
 * Performance monitoring utilities
 * 
 * Provides tools for:
 * - Measuring component render performance
 * - Tracking API call timing
 * - Memory leak detection
 * - Performance metrics logging
 */
import { useEffect, useRef } from 'react';

// Performance measurement history
const performanceMetrics = {
  components: {},
  apiCalls: {},
  renders: {},
  memory: []
};

// Track component render counts for debugging
export const useRenderCount = (componentName) => {
  const renderCount = useRef(0);
  
  // Increment render count
  renderCount.current += 1;
  
  // Update metrics
  if (!performanceMetrics.renders[componentName]) {
    performanceMetrics.renders[componentName] = 0;
  }
  performanceMetrics.renders[componentName] += 1;
  
  return renderCount.current;
};

/**
 * Track component render time
 * 
 * @param {string} componentName - Name of the component to track
 * @returns {Object} Timing information
 */
export const useRenderTiming = (componentName) => {
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(0);
  
  // Initialize metrics storage
  if (!performanceMetrics.components[componentName]) {
    performanceMetrics.components[componentName] = {
      counts: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0,
      lastTime: 0
    };
  }
  
  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    lastRenderTime.current = renderTime;
    
    // Update metrics
    const metrics = performanceMetrics.components[componentName];
    metrics.counts += 1;
    metrics.totalTime += renderTime;
    metrics.averageTime = metrics.totalTime / metrics.counts;
    metrics.minTime = Math.min(metrics.minTime, renderTime);
    metrics.maxTime = Math.max(metrics.maxTime, renderTime);
    metrics.lastTime = renderTime;
    
    // Reset start time for next render
    startTime.current = performance.now();
  });
  
  return {
    lastRenderTime: lastRenderTime.current,
    getMetrics: () => performanceMetrics.components[componentName]
  };
};

/**
 * Track API call performance
 * 
 * @param {string} apiName - Name or URL of the API
 * @param {Function} apiFn - Function that makes the API call
 * @returns {Function} Wrapped API function with timing
 */
export const trackApiPerformance = (apiName, apiFn) => {
  // Initialize metrics storage
  if (!performanceMetrics.apiCalls[apiName]) {
    performanceMetrics.apiCalls[apiName] = {
      counts: 0,
      totalTime: 0,
      averageTime: 0,
      minTime: Infinity,
      maxTime: 0,
      lastTime: 0,
      successCount: 0,
      errorCount: 0
    };
  }
  
  // Return wrapped function
  return async (...args) => {
    const startTime = performance.now();
    let success = false;
    
    try {
      const result = await apiFn(...args);
      success = true;
      return result;
    } catch (error) {
      throw error;
    } finally {
      const endTime = performance.now();
      const callTime = endTime - startTime;
      
      // Update metrics
      const metrics = performanceMetrics.apiCalls[apiName];
      metrics.counts += 1;
      metrics.totalTime += callTime;
      metrics.averageTime = metrics.totalTime / metrics.counts;
      metrics.minTime = Math.min(metrics.minTime, callTime);
      metrics.maxTime = Math.max(metrics.maxTime, callTime);
      metrics.lastTime = callTime;
      
      if (success) {
        metrics.successCount += 1;
      } else {
        metrics.errorCount += 1;
      }
    }
  };
};

/**
 * Track memory usage over time
 * 
 * @param {number} interval - Tracking interval in ms (default: 10000)
 * @returns {Function} Function to stop tracking
 */
export const trackMemoryUsage = (interval = 10000) => {
  if (!performance.memory) {
    console.warn('Memory API not available in this browser');
    return () => {};
  }
  
  const intervalId = setInterval(() => {
    performanceMetrics.memory.push({
      timestamp: Date.now(),
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    });
    
    // Keep only the last 100 measurements
    if (performanceMetrics.memory.length > 100) {
      performanceMetrics.memory.shift();
    }
  }, interval);
  
  return () => clearInterval(intervalId);
};

/**
 * Hook to detect potential memory leaks
 * 
 * @param {string} componentName - Name of the component to track
 */
export const useMemoryLeakDetection = (componentName) => {
  useEffect(() => {
    // Track component mount
    const mountCount = performanceMetrics.components[componentName]?.mountCount || 0;
    performanceMetrics.components[componentName] = {
      ...(performanceMetrics.components[componentName] || {}),
      mountCount: mountCount + 1
    };
    
    // Clean up on unmount
    return () => {
      const metrics = performanceMetrics.components[componentName] || {};
      const unmountCount = metrics.unmountCount || 0;
      performanceMetrics.components[componentName] = {
        ...metrics,
        unmountCount: unmountCount + 1
      };
      
      // Check for potential memory leaks
      if ((metrics.mountCount || 0) > (metrics.unmountCount + 1)) {
        console.warn(
          `Potential memory leak detected: ${componentName} mounted ${metrics.mountCount} times but only unmounted ${metrics.unmountCount} times`
        );
      }
    };
  }, [componentName]);
};

/**
 * Get all performance metrics
 * @returns {Object} All collected performance metrics
 */
export const getPerformanceMetrics = () => {
  return { ...performanceMetrics };
};

/**
 * Reset all performance metrics
 */
export const resetPerformanceMetrics = () => {
  Object.keys(performanceMetrics).forEach(key => {
    if (Array.isArray(performanceMetrics[key])) {
      performanceMetrics[key] = [];
    } else {
      performanceMetrics[key] = {};
    }
  });
};

/**
 * Log performance metrics to console
 */
export const logPerformanceMetrics = () => {
  console.group('Performance Metrics');
  
  console.group('Component Render Times');
  Object.entries(performanceMetrics.components).forEach(([name, metrics]) => {
    console.log(`${name}:`, {
      averageRenderTime: `${metrics.averageTime.toFixed(2)} ms`,
      totalRenders: metrics.counts,
      minTime: `${metrics.minTime.toFixed(2)} ms`,
      maxTime: `${metrics.maxTime.toFixed(2)} ms`
    });
  });
  console.groupEnd();
  
  console.group('API Call Performance');
  Object.entries(performanceMetrics.apiCalls).forEach(([name, metrics]) => {
    console.log(`${name}:`, {
      averageCallTime: `${metrics.averageTime.toFixed(2)} ms`,
      totalCalls: metrics.counts,
      successRate: `${((metrics.successCount / metrics.counts) * 100).toFixed(1)}%`,
      minTime: `${metrics.minTime.toFixed(2)} ms`,
      maxTime: `${metrics.maxTime.toFixed(2)} ms`
    });
  });
  console.groupEnd();
  
  console.group('Component Render Counts');
  Object.entries(performanceMetrics.renders).forEach(([name, count]) => {
    console.log(`${name}: ${count} renders`);
  });
  console.groupEnd();
  
  if (performanceMetrics.memory.length > 0) {
    console.group('Memory Usage');
    const latest = performanceMetrics.memory[performanceMetrics.memory.length - 1];
    console.log('Current Memory Usage:', {
      used: `${(latest.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(latest.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(latest.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      utilization: `${((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100).toFixed(1)}%`
    });
    console.groupEnd();
  }
  
  console.groupEnd();
};

// Debug component that can be used to inspect render performance
export const withPerformanceTracking = (WrappedComponent, componentName) => {
  // Return a new component
  return props => {
    // Use render count hook
    const renderCount = useRenderCount(componentName);
    
    // Use render timing hook
    const { lastRenderTime } = useRenderTiming(componentName);
    
    // Use memory leak detection
    useMemoryLeakDetection(componentName);
    
    // Log render in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Rendering ${componentName} (${renderCount}), took ${lastRenderTime.toFixed(2)}ms`);
    }
    
    // Render the wrapped component
    return <WrappedComponent {...props} />;
  };
};
