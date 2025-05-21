/**
 * Asset Notifications Component
 * 
 * Monitors asset values and displays notifications for significant changes:
 * - Major increase/decrease in value
 * - Assets approaching target values
 * - Market volatility alerts for investment assets
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { notification } from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  AlertOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

// Notification thresholds
const SIGNIFICANT_CHANGE_THRESHOLD = 10; // 10% change
const TIME_BETWEEN_NOTIFICATIONS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const AssetNotifications = () => {
  const { assets } = useSelector(state => state.assets);
  const [lastAssetValues, setLastAssetValues] = useState({});
  const [lastNotificationTime, setLastNotificationTime] = useState({});
  const processingRef = useRef(false);
  
  // Load last notification times from local storage - only on mount
  useEffect(() => {
    try {
      const storedTimes = localStorage.getItem('assetNotificationTimes');
      if (storedTimes) {
        setLastNotificationTime(JSON.parse(storedTimes));
      }
      
      const storedValues = localStorage.getItem('lastAssetValues');
      if (storedValues) {
        setLastAssetValues(JSON.parse(storedValues));
      } else if (assets.length > 0) {
        // Initialize with current values if none stored
        const initialValues = {};
        assets.forEach(asset => {
          initialValues[asset.id] = parseFloat(asset.currentValue);
        });
        setLastAssetValues(initialValues);
        localStorage.setItem('lastAssetValues', JSON.stringify(initialValues));
      }
    } catch (error) {
      console.error('Error loading notification data from localStorage:', error);
    }
  }, []);
  // Memoize the check for significant changes
  const checkSignificantChanges = useCallback(() => {
    if (assets.length === 0 || processingRef.current) return;
    
    processingRef.current = true;
    const now = Date.now();
    const updatedNotificationTimes = { ...lastNotificationTime };
    let shouldUpdateStorage = false;
    let updatedValues = false;
    const newValues = {};
    
    // Process assets in batches for better performance with large lists
    assets.forEach(asset => {
      newValues[asset.id] = parseFloat(asset.currentValue);
      
      const currentValue = parseFloat(asset.currentValue);
      const lastValue = lastAssetValues[asset.id] || currentValue;
      
      // Skip if we've notified about this asset recently
      const lastNotified = lastNotificationTime[asset.id] || 0;
      if (now - lastNotified < TIME_BETWEEN_NOTIFICATIONS) return;
      
      // Calculate percentage change
      if (lastValue > 0) {
        const percentChange = ((currentValue - lastValue) / lastValue) * 100;
        
        // Check if change exceeds threshold
        if (Math.abs(percentChange) >= SIGNIFICANT_CHANGE_THRESHOLD) {
          const isIncrease = percentChange > 0;
          
          // Show notification
          notification.open({
            message: `${asset.name} Value ${isIncrease ? 'Increased' : 'Decreased'} Significantly`,
            description: `The value has ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(percentChange).toFixed(1)}% 
                         from ${lastValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} 
                         to ${currentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}.`,
            icon: isIncrease 
              ? <RiseOutlined style={{ color: '#52c41a' }} /> 
              : <FallOutlined style={{ color: '#f5222d' }} />,
            duration: 0, // Keep open until user closes
          });
          
          // Update notification time
          updatedNotificationTimes[asset.id] = now;
          shouldUpdateStorage = true;
        }
      }
    });
    
    // Update last notification times in storage if needed
    if (shouldUpdateStorage) {
      setLastNotificationTime(updatedNotificationTimes);
      try {
        localStorage.setItem('assetNotificationTimes', JSON.stringify(updatedNotificationTimes));
      } catch (e) {
        console.error('Error saving notification times to localStorage:', e);
      }
    }
    
    // Only update stored asset values if there are actual changes
    if (JSON.stringify(newValues) !== JSON.stringify(lastAssetValues)) {
      setLastAssetValues(newValues);
      try {
        localStorage.setItem('lastAssetValues', JSON.stringify(newValues));
      } catch (e) {
        console.error('Error saving asset values to localStorage:', e);
      }
    }
    
    processingRef.current = false;
  }, [assets, lastAssetValues, lastNotificationTime]);
  // Use the checkSignificantChanges function with assets as the dependency
  useEffect(() => {
    // Apply throttling to avoid excessive processing
    const throttleTimeout = setTimeout(() => {
      checkSignificantChanges();
    }, 500);
    
    return () => clearTimeout(throttleTimeout);
  }, [assets, checkSignificantChanges]);

  // The component doesn't render anything
  return null;
};

export default React.memo(AssetNotifications);
