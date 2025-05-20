/**
 * CategoryChange component test
 * 
 * Tests the CategoryChange component's functionality:
 * - Rendering category selection correctly
 * - Creating category rules
 * - Handling form submission and cancellation
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryChange from '../components/CategoryChange';

// Mock categories for testing
const mockCategories = [
  { id: 1, name: 'Uncategorized' },
  { id: 2, name: 'Groceries' },
  { id: 3, name: 'Dining' },
  { id: 4, name: 'Entertainment' }
];

// Mock transaction for testing
const mockTransaction = {
  id: '1',
  description: 'Grocery Store',
  amount: '50.00',
  date: '2023-06-01',
  isExpense: true,
  categoryId: 1,
  category: { id: 1, name: 'Uncategorized' },
  merchant: 'Local Market'
};

// Mock function handlers
const mockHandlers = {
  onSave: jest.fn(),
  onCancel: jest.fn()
};

describe('CategoryChange Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly with transaction data', () => {
    render(
      <CategoryChange
        visible={true}
        transaction={mockTransaction}
        categories={mockCategories}
        {...mockHandlers}
      />
    );
    
    // Check modal title
    expect(screen.getByText('Change Category')).toBeInTheDocument();
    
    // Check transaction info is displayed
    expect(screen.getByText('Local Market')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    
    // Check category selector has the right options
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Dining')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });
  
  test('changes category without creating rule', async () => {
    render(
      <CategoryChange
        visible={true}
        transaction={mockTransaction}
        categories={mockCategories}
        {...mockHandlers}
      />
    );
    
    // Select a different category
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getByText('Groceries'));
    
    // Don't check "Create rule"
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify onSave was called without a rule
    await waitFor(() => {
      expect(mockHandlers.onSave).toHaveBeenCalledWith(undefined);
    });
  });
  
  test('creates a category rule when checkbox is checked', async () => {
    render(
      <CategoryChange
        visible={true}
        transaction={mockTransaction}
        categories={mockCategories}
        {...mockHandlers}
      />
    );
    
    // Select a different category
    const categorySelect = screen.getByLabelText('Category');
    fireEvent.mouseDown(categorySelect);
    fireEvent.click(screen.getByText('Groceries'));
    
    // Check "Create rule"
    const createRuleCheckbox = screen.getByLabelText('Create rule for future transactions');
    fireEvent.click(createRuleCheckbox);
    
    // Select merchant field and pattern match
    const matchFieldSelect = screen.getByLabelText('Match Field');
    fireEvent.mouseDown(matchFieldSelect);
    fireEvent.click(screen.getByText('Merchant'));
    
    // Save changes
    fireEvent.click(screen.getByText('Save Changes'));
    
    // Verify onSave was called with a rule
    await waitFor(() => {
      expect(mockHandlers.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: 2,
          matchField: 'merchant',
          pattern: 'Local Market'
        })
      );
    });
  });
  
  test('cancels category change when Cancel is clicked', () => {
    render(
      <CategoryChange
        visible={true}
        transaction={mockTransaction}
        categories={mockCategories}
        {...mockHandlers}
      />
    );
    
    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Verify onCancel was called
    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });
  
  test('shows different rule options based on match field selection', async () => {
    render(
      <CategoryChange
        visible={true}
        transaction={mockTransaction}
        categories={mockCategories}
        {...mockHandlers}
      />
    );
    
    // Check "Create rule"
    const createRuleCheckbox = screen.getByLabelText('Create rule for future transactions');
    fireEvent.click(createRuleCheckbox);
    
    // Select description field
    const matchFieldSelect = screen.getByLabelText('Match Field');
    fireEvent.mouseDown(matchFieldSelect);
    fireEvent.click(screen.getByText('Description'));
    
    // Check that match type selector is visible
    expect(screen.getByLabelText('Match Type')).toBeInTheDocument();
    
    // Select amount field
    fireEvent.mouseDown(matchFieldSelect);
    fireEvent.click(screen.getByText('Amount'));
    
    // Check that match type selector is not needed for amount matches
    expect(screen.queryByLabelText('Match Type')).not.toBeInTheDocument();
  });
});
