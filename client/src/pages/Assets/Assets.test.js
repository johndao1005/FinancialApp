/**
 * Assets Page Tests
 * 
 * Integration tests for the Asset Management feature
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Assets from './index';
import AssetDetail from './AssetDetail';
import { fetchAssets, fetchNetWorth, fetchPortfolioPerformance } from '../../redux/slices/assetSlice';

// Mock chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
  Bar: () => <div data-testid="bar-chart" />
}));

// Setup store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Assets Pages', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      assets: {
        assets: [
          {
            id: '1',
            name: 'Primary Residence',
            assetType: 'property',
            initialValue: 400000,
            currentValue: 450000,
            isActive: true,
            acquisitionDate: '2020-01-15',
            location: '123 Main St, Anytown, USA'
          },
          {
            id: '2',
            name: 'Tesla Stock',
            assetType: 'stock',
            initialValue: 10000,
            currentValue: 15000,
            isActive: true,
            acquisitionDate: '2021-05-10',
            symbol: 'TSLA',
            quantity: 20
          }
        ],
        assetsByType: {
          property: [{
            id: '1',
            name: 'Primary Residence',
            assetType: 'property',
            initialValue: 400000,
            currentValue: 450000,
            isActive: true
          }],
          stock: [{
            id: '2',
            name: 'Tesla Stock',
            assetType: 'stock',
            initialValue: 10000,
            currentValue: 15000,
            isActive: true
          }]
        },
        currentAsset: null,
        transactions: [],
        netWorth: {
          current: 465000,
          historical: [
            { month: '2023-01', value: 440000 },
            { month: '2023-02', value: 445000 },
            { month: '2023-03', value: 455000 },
            { month: '2023-04', value: 465000 }
          ],
          allocation: {
            property: 450000,
            stock: 15000
          }
        },
        portfolio: {
          performance: {
            totalReturnAmount: 55000,
            totalReturnPercentage: 13.41,
            annualizedReturn: 8.2
          },
          breakdown: {
            property: { value: 450000, return: 12.5 },
            stock: { value: 15000, return: 50 }
          },
          returns: {
            '1M': 2.2,
            '3M': 5.7,
            '6M': 8.3,
            '1Y': 13.41,
            'YTD': 11.0
          }
        },
        loading: false,
        transactionLoading: false,
        netWorthLoading: false,
        portfolioLoading: false,
        error: null
      }
    });
    
    // Mock the dispatch method
    store.dispatch = jest.fn();
  });
  
  describe('Assets Main Page', () => {
    it('renders the Assets page with summary information', () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Assets />
          </MemoryRouter>
        </Provider>
      );
      
      // Check page title
      expect(screen.getByText('Asset Management')).toBeInTheDocument();
      
      // Check that data is fetched
      expect(store.dispatch).toHaveBeenCalledWith(expect.any(Function)); // fetchAssets thunk
      
      // Check summary statistics
      expect(screen.getByText('Net Worth')).toBeInTheDocument();
      expect(screen.getByText('$465,000')).toBeInTheDocument();
      
      // Check tabs
      expect(screen.getByText('All Assets')).toBeInTheDocument();
      expect(screen.getByText('Net Worth')).toBeInTheDocument();
      expect(screen.getByText('Investment Portfolio')).toBeInTheDocument();
      
      // Check asset types in list
      expect(screen.getByText('Real Estate')).toBeInTheDocument();
      expect(screen.getByText('Stocks & Shares')).toBeInTheDocument();
      
      // Check asset names
      expect(screen.getByText('Primary Residence')).toBeInTheDocument();
      expect(screen.getByText('Tesla Stock')).toBeInTheDocument();
    });
    
    it('should switch between tabs', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Assets />
          </MemoryRouter>
        </Provider>
      );
      
      // Switch to Net Worth tab
      fireEvent.click(screen.getByText('Net Worth'));
      
      // Charts should be visible
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
      });
      
      // Switch to Investment Portfolio tab
      fireEvent.click(screen.getByText('Investment Portfolio'));
      
      await waitFor(() => {
        expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
        expect(screen.getByText('13.41%')).toBeInTheDocument();
      });
    });
    
    it('should navigate to asset detail when clicking on an asset', () => {
      const mockNavigate = jest.fn();
      
      // Create a mock navigate function
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));
      
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Assets />
          </MemoryRouter>
        </Provider>
      );
      
      // Find the Primary Residence asset and click it
      fireEvent.click(screen.getByText('Primary Residence'));
      
      // Check if navigation was triggered
      expect(mockNavigate).toHaveBeenCalledWith('/assets/1');
    });
  });
  
  describe('Asset Detail Page', () => {
    beforeEach(() => {
      // Update the store with current asset data
      store = mockStore({
        assets: {
          assets: [
            {
              id: '1',
              name: 'Primary Residence',
              assetType: 'property',
              initialValue: 400000,
              currentValue: 450000,
              isActive: true,
              acquisitionDate: '2020-01-15',
              location: '123 Main St, Anytown, USA'
            }
          ],
          currentAsset: {
            id: '1',
            name: 'Primary Residence',
            assetType: 'property',
            initialValue: 400000,
            currentValue: 450000,
            isActive: true,
            acquisitionDate: '2020-01-15',
            location: '123 Main St, Anytown, USA'
          },
          transactions: [
            {
              id: '101',
              assetId: '1',
              date: '2022-06-15',
              transactionType: 'valuation_update',
              amount: 25000,
              notes: 'Annual property valuation update'
            },
            {
              id: '102',
              assetId: '1',
              date: '2023-01-10',
              transactionType: 'valuation_update',
              amount: 25000,
              notes: 'Annual property valuation update'
            }
          ],
          assetHistory: {
            valueHistory: [
              { date: '2020-01-15', value: 400000 },
              { date: '2022-06-15', value: 425000 },
              { date: '2023-01-10', value: 450000 }
            ],
            performance: {
              totalReturn: 50000,
              totalReturnPercentage: 12.5,
              annualizedReturn: 6.27
            }
          },
          loading: false,
          transactionLoading: false,
          historyLoading: false,
          error: null
        }
      });
      
      // Mock the dispatch method
      store.dispatch = jest.fn();
    });
    
    it('renders the Asset Detail page with asset information', async () => {
      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/assets/1']}>
            <Routes>
              <Route path="/assets/:assetId" element={<Assets />} />
            </Routes>
          </MemoryRouter>
        </Provider>
      );
      
      // Check that the asset is fetched
      expect(store.dispatch).toHaveBeenCalled();
      
      // Wait for the component to render with data
      await waitFor(() => {
        // Check asset name in header
        expect(screen.getByText('Primary Residence')).toBeInTheDocument();
        
        // Check asset type badge
        expect(screen.getByText('Real Estate Property')).toBeInTheDocument();
        
        // Check value statistics
        expect(screen.getByText('Initial Value')).toBeInTheDocument();
        expect(screen.getByText('$400,000')).toBeInTheDocument();
        expect(screen.getByText('Current Value')).toBeInTheDocument();
        expect(screen.getByText('$450,000')).toBeInTheDocument();
        
        // Check that transaction history is displayed
        expect(screen.getByText('Transaction History')).toBeInTheDocument();
        expect(screen.getByText('Annual property valuation update')).toBeInTheDocument();
      });
    });
  });
});
