/**
 * QuickTransactionEntry component test
 * 
 * Tests the QuickTransactionEntry component's functionality:
 * - Opening the modal
 * - Form validation and submission
 * - Handling different transaction types
 * - Handling recurring transactions
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import QuickTransactionEntry from '../components/QuickTransactionEntry';

// Create mock store
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// Mock success callback
const mockOnSuccess = jest.fn();

describe('QuickTransactionEntry Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      transactions: {
        loading: false,
        error: null
      }
    });
    
    // Mock the dispatch function
    store.dispatch = jest.fn().mockImplementation(() => {
      return Promise.resolve({ unwrap: () => Promise.resolve() });
    });
    
    jest.clearAllMocks();
  });

  test('renders the Quick Add button', () => {
    render(
      <Provider store={store}>
        <QuickTransactionEntry onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    expect(screen.getByText('Quick Add')).toBeInTheDocument();
  });
  
  test('opens modal when button is clicked', () => {
    render(
      <Provider store={store}>
        <QuickTransactionEntry onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    // Click the Quick Add button
    fireEvent.click(screen.getByText('Quick Add'));
    
    // Check that modal opened
    expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
  });
  
  test('switches between expense and income types', () => {
    render(
      <Provider store={store}>
        <QuickTransactionEntry onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Quick Add'));
    
    // Check default is expense (merchant field exists)
    expect(screen.getByLabelText('Merchant')).toBeInTheDocument();
    
    // Switch to income
    const typeSwitch = screen.getByRole('switch');
    fireEvent.click(typeSwitch);
    
    // Check that merchant field is gone
    expect(screen.queryByLabelText('Merchant')).not.toBeInTheDocument();
    
    // Check income categories appear
    fireEvent.mouseDown(screen.getByLabelText('Category'));
    expect(screen.getByText('Salary')).toBeInTheDocument();
  });
  
  test('handles recurring transaction options', () => {
    render(
      <Provider store={store}>
        <QuickTransactionEntry onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Quick Add'));
    
    // Default is one-off (no end date field)
    expect(screen.queryByLabelText('End Date (Optional)')).not.toBeInTheDocument();
    
    // Switch to monthly
    fireEvent.click(screen.getByLabelText('Monthly'));
    
    // End date field should appear
    expect(screen.getByLabelText('End Date (Optional)')).toBeInTheDocument();
  });
  
  test('submits a valid transaction', async () => {
    render(
      <Provider store={store}>
        <QuickTransactionEntry onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Quick Add'));
    
    // Fill out form
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '42.99' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Test Purchase' } });
    fireEvent.change(screen.getByLabelText('Merchant'), { target: { value: 'Test Store' } });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Check that store.dispatch was called
    await waitFor(() => {
      expect(store.dispatch).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
  
  test('validates required fields', async () => {
    render(
      <Provider store={store}>
        <QuickTransactionEntry onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Quick Add'));
    
    // Try to submit without filling required fields
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Check that validation messages appear
    await waitFor(() => {
      expect(screen.getByText('Please enter an amount!')).toBeInTheDocument();
    });
    
    // store.dispatch should not have been called
    expect(store.dispatch).not.toHaveBeenCalled();
  });
  
  test('closes modal when Cancel is clicked', () => {
    render(
      <Provider store={store}>
        <QuickTransactionEntry onSuccess={mockOnSuccess} />
      </Provider>
    );
    
    // Open the modal
    fireEvent.click(screen.getByText('Quick Add'));
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Modal should be closed
    expect(screen.queryByText('Add New Transaction')).not.toBeInTheDocument();
  });
});
