/**
 * TransactionTable component test
 * 
 * Tests the TransactionTable component's functionality:
 * - Rendering transaction data correctly
 * - Handling pagination
 * - Editing and deleting transactions
 * - Handling category changes
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionTable from '../pages/Transactions/component/TransactionTable';

// Mock categories for testing
const mockCategories = [
  { id: 1, name: 'Uncategorized' },
  { id: 2, name: 'Groceries' },
  { id: 3, name: 'Dining' }
];

// Mock transactions for testing
const mockTransactions = [
  {
    id: '1',
    description: 'Grocery Store',
    amount: '50.00',
    date: '2023-06-01',
    isExpense: true,
    categoryId: 2,
    category: { id: 2, name: 'Groceries' },
    merchant: 'Local Market'
  },
  {
    id: '2',
    description: 'Restaurant',
    amount: '35.50',
    date: '2023-06-02',
    isExpense: true,
    categoryId: 3,
    category: { id: 3, name: 'Dining' },
    merchant: 'Nice Restaurant'
  },
  {
    id: '3',
    description: 'Salary',
    amount: '2500.00',
    date: '2023-06-03',
    isExpense: false,
    categoryId: null,
    category: null,
    merchant: 'Employer Inc.'
  }
];

// Mock function handlers
const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onPageChange: jest.fn()
};

describe('TransactionTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders transactions correctly', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        loading={false}
        totalPages={1}
        currentPage={1}
        {...mockHandlers}
      />
    );
    
    // Check that transactions are rendered
    expect(screen.getByText('Grocery Store')).toBeInTheDocument();
    expect(screen.getByText('Restaurant')).toBeInTheDocument();
    expect(screen.getByText('Salary')).toBeInTheDocument();
    
    // Check amount formatting
    expect(screen.getByText('-$50.00')).toBeInTheDocument(); // Expenses are negative
    expect(screen.getByText('$2,500.00')).toBeInTheDocument(); // Income is positive
    
    // Check categories
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Dining')).toBeInTheDocument();
    expect(screen.getByText('Uncategorized')).toBeInTheDocument();
  });
  
  test('calls onEdit when category is clicked', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        loading={false}
        totalPages={1}
        currentPage={1}
        {...mockHandlers}
      />
    );
    
    // Find all category tags
    const categoryTags = screen.getAllByText(/Groceries|Dining|Uncategorized/);
    
    // Click the first category (Groceries)
    fireEvent.click(categoryTags[0]);
    
    // Check that onEdit was called with the right transaction and edit type
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' }),
      'category'
    );
  });
  
  test('calls onDelete when delete button is clicked', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        loading={false}
        totalPages={1}
        currentPage={1}
        {...mockHandlers}
      />
    );
    
    // Find and click the first delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Confirm the deletion in the modal
    fireEvent.click(screen.getByText('Yes'));
    
    // Check that onDelete was called with the right transaction ID
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });
  
  test('calls onPageChange when page is changed', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        loading={false}
        totalPages={3}
        currentPage={1}
        {...mockHandlers}
      />
    );
    
    // Find and click the "next page" button
    const nextButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextButton);
    
    // Check that onPageChange was called with page 2
    expect(mockHandlers.onPageChange).toHaveBeenCalledWith(2);
  });
  
  test('shows loading state correctly', () => {
    render(
      <TransactionTable
        transactions={[]}
        loading={true}
        totalPages={1}
        currentPage={1}
        {...mockHandlers}
      />
    );
    
    // Check for loading indicator
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  test('applies transaction type styles correctly', () => {
    render(
      <TransactionTable
        transactions={mockTransactions}
        loading={false}
        totalPages={1}
        currentPage={1}
        {...mockHandlers}
      />
    );
    
    // Check that expense amounts have the expense class
    const expenseAmount = screen.getByText('-$50.00');
    expect(expenseAmount.closest('.transaction-amount')).toHaveClass('expense');
    
    // Check that income amounts have the income class
    const incomeAmount = screen.getByText('$2,500.00');
    expect(incomeAmount.closest('.transaction-amount')).toHaveClass('income');
  });
});
