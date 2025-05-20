/**
 * Asset Component Tests
 * 
 * Tests for the asset management components including:
 * - AssetList
 * - AddAssetDialog
 * - NetWorthChart
 * - AssetAllocationChart
 * - PortfolioPerformance
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import AssetList from './AssetList';
import AddAssetDialog from './AddAssetDialog';
import NetWorthChart from './NetWorthChart';
import AssetAllocationChart from './AssetAllocationChart';
import PortfolioPerformance from './PortfolioPerformance';

// Mock chart.js to prevent testing errors
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
  Bar: () => <div data-testid="bar-chart" />
}));

// Setup mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Asset Components', () => {
  const mockAssets = [
    {
      id: '1',
      name: 'Primary Residence',
      assetType: 'property',
      initialValue: 400000,
      currentValue: 450000,
      isActive: true
    },
    {
      id: '2',
      name: 'Apple Stocks',
      assetType: 'stock',
      initialValue: 10000,
      currentValue: 15000,
      isActive: true
    },
    {
      id: '3',
      name: 'Bitcoin',
      assetType: 'crypto',
      initialValue: 5000,
      currentValue: 4000,
      isActive: true
    }
  ];
  
  const mockAssetsByType = {
    property: [mockAssets[0]],
    stock: [mockAssets[1]],
    crypto: [mockAssets[2]]
  };
  
  describe('AssetList', () => {
    it('renders asset list by type', () => {
      const handleClick = jest.fn();
      
      render(
        <MemoryRouter>
          <AssetList 
            assets={mockAssets}
            assetsByType={mockAssetsByType}
            onAssetClick={handleClick}
          />
        </MemoryRouter>
      );
      
      // Check asset type headings
      expect(screen.getByText('Real Estate')).toBeInTheDocument();
      expect(screen.getByText('Stocks & Shares')).toBeInTheDocument();
      expect(screen.getByText('Cryptocurrency')).toBeInTheDocument();
      
      // Check asset names
      expect(screen.getByText('Primary Residence')).toBeInTheDocument();
      expect(screen.getByText('Apple Stocks')).toBeInTheDocument();
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      
      // Test click handler
      fireEvent.click(screen.getByText('Primary Residence'));
      expect(handleClick).toHaveBeenCalledWith('1');
    });
  });
  
  describe('AddAssetDialog', () => {
    let store;
    
    beforeEach(() => {
      store = mockStore({
        assets: {
          loading: false,
          error: null,
          success: null
        }
      });
    });
    
    it('renders the dialog with form fields', () => {
      render(
        <Provider store={store}>
          <AddAssetDialog open={true} onClose={jest.fn()} />
        </Provider>
      );
      
      // Check for form elements
      expect(screen.getByLabelText(/Asset Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Asset Type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Initial Value/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Acquisition Date/i)).toBeInTheDocument();
    });
  });
  
  describe('NetWorthChart', () => {
    const mockHistoricalData = [
      { month: '2023-01', value: 450000 },
      { month: '2023-02', value: 460000 },
      { month: '2023-03', value: 470000 }
    ];
    
    it('renders the net worth chart', () => {
      render(<NetWorthChart historicalData={mockHistoricalData} />);
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
  
  describe('AssetAllocationChart', () => {
    const mockAllocation = {
      property: 450000,
      stock: 15000,
      crypto: 4000
    };
    
    it('renders the asset allocation chart', () => {
      render(<AssetAllocationChart allocation={mockAllocation} />);
      
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });
  
  describe('PortfolioPerformance', () => {
    const mockPerformance = {
      totalReturnAmount: 9000,
      totalReturnPercentage: 12.5,
      annualizedReturn: 8.2
    };
    
    const mockBreakdown = {
      property: { value: 450000, return: 12.5 },
      stock: { value: 15000, return: 50 },
      crypto: { value: 4000, return: -20 }
    };
    
    const mockReturns = {
      '1M': 1.2,
      '3M': 3.5,
      '6M': 5.8,
      '1Y': 12.5,
      'YTD': 8.2
    };
    
    it('renders the portfolio performance component', () => {
      render(
        <PortfolioPerformance 
          performance={mockPerformance}
          breakdown={mockBreakdown}
          returns={mockReturns}
        />
      );
      
      expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
      expect(screen.getByText('12.5%')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });
});
