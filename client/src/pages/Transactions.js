import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTransactions, 
  deleteTransaction,
  updateTransaction 
} from '../redux/slices/transactionSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, loading, totalPages, currentPage } = useSelector(state => state.transactions);
  const { categories } = useSelector(state => state.categories);
  
  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  
  // For editing transactions
  const [editMode, setEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  useEffect(() => {
    // Fetch transactions and categories on component mount
    dispatch(fetchTransactions({ page, filters }));
    dispatch(fetchCategories());
  }, [dispatch, page]);

  // Apply filters
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    setPage(1); // Reset to first page
    dispatch(fetchTransactions({ page: 1, filters }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      category: ''
    });
    setPage(1);
    dispatch(fetchTransactions({ page: 1, filters: {} }));
  };

  // Pagination controls
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      dispatch(fetchTransactions({ page: newPage, filters }));
    }
  };

  // Delete transaction
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      dispatch(deleteTransaction(id));
    }
  };

  // Edit transaction
  const handleEdit = (transaction) => {
    setEditingTransaction({
      ...transaction,
      date: transaction.date.substring(0, 10) // Format to YYYY-MM-DD
    });
    setEditMode(true);
  };

  const handleEditChange = (e) => {
    setEditingTransaction({
      ...editingTransaction,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    dispatch(updateTransaction({
      id: editingTransaction.id,
      transactionData: editingTransaction
    }))
    .then(() => {
      setEditMode(false);
      setEditingTransaction(null);
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="transactions-page">
      <h1>Transactions</h1>
      
      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3>Filters</h3>
        </div>
        <div className="row">
          <div className="col">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
          </div>
          
          <div className="col">
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
          </div>
          
          <div className="col">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="form-control"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="filter-buttons">
          <button onClick={applyFilters} className="btn">
            Apply Filters
          </button>
          <button onClick={resetFilters} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </div>
      
      {/* Edit Modal */}
      {editMode && (
        <div className="edit-modal">
          <div className="edit-modal-content card">
            <h3>Edit Transaction</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={editingTransaction.date}
                  onChange={handleEditChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  name="description"
                  value={editingTransaction.description}
                  onChange={handleEditChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={editingTransaction.amount}
                  onChange={handleEditChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="categoryId"
                  value={editingTransaction.categoryId || ''}
                  onChange={handleEditChange}
                  className="form-control"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  name="isExpense"
                  value={editingTransaction.isExpense}
                  onChange={handleEditChange}
                  className="form-control"
                >
                  <option value={true}>Expense</option>
                  <option value={false}>Income</option>
                </select>
              </div>
              
              <div className="edit-modal-buttons">
                <button type="submit" className="btn">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditMode(false);
                    setEditingTransaction(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Transactions Table */}
      <div className="card">
        <div className="transactions-table">
          {loading ? (
            <div className="loading">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="no-data">No transactions found</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>{transaction.description}</td>
                    <td>
                      {transaction.category ? transaction.category.name : 'Uncategorized'}
                    </td>
                    <td className={transaction.isExpense ? 'negative' : 'positive'}>
                      {transaction.isExpense ? '-' : '+'}
                      ${parseFloat(transaction.amount).toFixed(2)}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="btn btn-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="btn btn-sm"
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="btn btn-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
