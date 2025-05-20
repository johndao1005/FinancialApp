/**
 * OnboardingTooltip Component
 * 
 * Provides guided tooltips for first-time users to help them navigate
 * and understand the app's features. These tooltips are shown based on
 * the user's progress and can be dismissed permanently.
 */
import React, { useState, useEffect } from 'react';
import { Tour, Button } from 'antd';
import { useSelector } from 'react-redux';

const OnboardingTooltip = () => {
  const { user } = useSelector(state => state.auth);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    // Check if this is the user's first time (this would typically
    // be stored in user preferences or localStorage)
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    
    if (!hasSeenTour && user) {
      // Delay starting the tour to allow the page to fully render
      const timer = setTimeout(() => {
        setOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  const steps = [
    {
      title: 'Welcome to SmartSpend!',
      description: 'Let\'s take a quick tour to help you get started with tracking your finances.',
      target: () => document.querySelector('.ant-layout-header'),
    },
    {
      title: 'Quick Add Transactions',
      description: 'Use this button to quickly add new income or expenses.',
      target: () => document.querySelector('.quick-add-btn'),
    },
    {
      title: 'Transaction Categories',
      description: 'Click on any transaction category to change it. You can also create rules to automatically categorize similar transactions in the future.',
      target: () => document.querySelector('.transaction-category'),
    },
    {
      title: 'Apply Category Rules',
      description: 'This will apply your category rules to all transactions, helping organize your finances automatically.',
      target: () => document.querySelector('.apply-rules-btn'),
    },
    {
      title: 'Transaction Filters',
      description: 'Filter transactions by date range, category, and more to find exactly what you\'re looking for.',
      target: () => document.querySelector('.filter-card'),
    },
  ];
  
  const handleFinish = () => {
    setOpen(false);
    localStorage.setItem('hasSeenTour', 'true');
  };
  
  return (
    <Tour
      open={open}
      onClose={() => setOpen(false)}
      steps={steps}
      current={currentStep}
      onChange={setCurrentStep}
      onFinish={handleFinish}
    />
  );
};

export default OnboardingTooltip;
