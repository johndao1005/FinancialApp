/**
 * Transactions Component
 * 
 * Main page for managing financial transactions. This component provides:
 * 1. A filterable and sortable table of all transactions
 * 2. Date range and category filtering
 * 3. Editing capabilities for existing transactions
 * 4. Support for recurring transaction management
 * 5. Pagination for handling large transaction histories
 * 6. Smart category assignment with user preferences
 */
import React, { useEffect, useState, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Typography,
  Modal,
  Form,
  Row,
  Col,
  Space,
  Divider,
  Button,
  message
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import moment from 'moment';
import {
  fetchTransactions,
  deleteTransaction,
  updateTransaction
} from '../../redux/slices/transactionSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { 
  createCategoryOverride, 
  applyCategoryRules,
  generateRulesFromPatterns
} from '../../redux/slices/categoryOverrideSlice';

import TopMerchantsChart from '../../components/TopMerchantsChart';
// Import components
import TransactionTable from './component/TransactionTable';
import TransactionFilters from './component/TransactionFilters';
import TransactionEditForm from './component/TransactionEditForm';
import TransactionStats from './component/TransactionStats';
import SkeletonLoader from '../../components/SkeletonLoader';
import OnboardingTooltip from '../../components/OnboardingTooltip';

const { Title } = Typography;

const Transactions = () => {
  const dispatch = useDispatch();
  // Redux state selectors
  const { transactions, loading, totalPages, currentPage } = useSelector(state => state.transactions);
  const { categories } = useSelector(state => state.categories);
  const { loading: categoryOverrideLoading, generatedRules } = useSelector(state => state.categoryOverride);

  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  // For time frame selection for charts
  const [timeFrame, setTimeFrame] = useState('month'); // 'week', 'month', 'year'

  // For editing transactions
  const [editMode, setEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  
  // For category change modal
  const [categoryChangeVisible, setCategoryChangeVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // For applying and generating category rules
  const [applyingRules, setApplyingRules] = useState(false);
  const [generatingRules, setGeneratingRules] = useState(false);
  
  // For showing generated rules modal
  const [rulesModalVisible, setRulesModalVisible] = useState(false);
  
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch transactions and categories on component mount
    dispatch(fetchTransactions({ page, filters }));
    dispatch(fetchCategories());
  }, [dispatch, page]);
  
  useEffect(() => {
    // Show modal when rules are generated
    if (generatedRules && generatedRules.length > 0) {
      setRulesModalVisible(true);
    }
  }, [generatedRules]);
  
  /**
   * Apply filter criteria to transaction list
   * 
   * Handles date range and category filters and refreshes transaction list
   * with the new filter parameters. Also resets to the first page.
   * 
   * @param {Object} values - Form values containing filter parameters
   */
  const handleFilterChange = (values) => {
    const newFilters = {
      ...filters
    };

    if (values.dateRange) {
      newFilters.startDate = values.dateRange[0].format('YYYY-MM-DD');
      newFilters.endDate = values.dateRange[1].format('YYYY-MM-DD');
    } else {
      newFilters.startDate = '';
      newFilters.endDate = '';
    }

    if (values.category) {
      newFilters.category = values.category;
    } else {
      newFilters.category = '';
    }

    setFilters(newFilters);
    setPage(1); // Reset to first page
    dispatch(fetchTransactions({ page: 1, filters: newFilters }));
  };

  /**
   * Reset all filter criteria
   * 
   * Clears the filter form and fetches all transactions without filters
   */
  const resetFilters = () => {
    form.resetFields();
    setFilters({
      startDate: '',
      endDate: '',
      category: ''
    });
    setPage(1);
    dispatch(fetchTransactions({ page: 1, filters: {} }));
  };

  /**
   * Delete a transaction by ID
   * 
   * Dispatches the deleteTransaction action to remove a transaction
   * from the database and updates the UI.
   * 
   * @param {string} id - The unique ID of the transaction to delete
   */
  const handleDelete = (id) => {
    dispatch(deleteTransaction(id));
  };
  /**
   * Begin editing a transaction
   * 
   * Sets up the edit modal with the transaction's current values
   * or opens the category change modal if editType is 'category'
   * 
   * @param {Object} transaction - The transaction object to edit
   * @param {string} editType - Type of edit ('full' or 'category')
   */
  const handleEdit = (transaction, editType = 'full') => {
    if (editType === 'category') {
      // Open category change modal
      setSelectedTransaction(transaction);
      setCategoryChangeVisible(true);
    } else {
      // Open full transaction edit modal
      setEditingTransaction({
        ...transaction,
        date: transaction.date.substring(0, 10) // Format to YYYY-MM-DD
      });
      setEditMode(true);
    }
  };

  /**
   * Handle changes in the transaction edit form
   * 
   * Updates the editing transaction state and handles special logic
   * for recurring transaction fields (clearing recurring fields when
   * isRecurring is set to false).
   * 
   * @param {Object} changedValues - The form values that changed
   * @param {Object} allValues - All current form values
   */
  const handleEditChange = (changedValues, allValues) => {
    // If isRecurring changed to false, remove the recurring fields
    let updatedTransaction = { ...editingTransaction };

    // Update all values
    Object.keys(allValues).forEach(key => {
      updatedTransaction[key] = allValues[key];
    });

    // Handle isRecurring toggle
    if ('isRecurring' in changedValues) {
      if (!changedValues.isRecurring) {
        // If turning off recurring, clear the related fields
        updatedTransaction.recurringFrequency = null;
        updatedTransaction.recurringEndDate = null;
      }
    }

    setEditingTransaction(updatedTransaction);
  };

  /**
   * Submit transaction edit form
   * 
   * Formats the edited transaction data, handles dates, and
   * dispatches the updateTransaction action. Cleans up the form
   * and state after successful update.
   */
  const handleEditSubmit = () => {
    // Format recurring end date if it exists
    let transactionData = { ...editingTransaction };

    // Format the dates if they exist
    if (transactionData.recurringEndDate && typeof transactionData.recurringEndDate !== 'string') {
      transactionData.recurringEndDate = transactionData.recurringEndDate.format('YYYY-MM-DD');
    }

    if (transactionData.date && typeof transactionData.date !== 'string') {
      transactionData.date = transactionData.date.format('YYYY-MM-DD');
    }

    dispatch(updateTransaction({
      id: editingTransaction.id,
      transactionData
    }));

    setEditMode(false);
    setEditingTransaction(null);
  };
  /**
   * Handle changing the selected time frame for statistics
   * 
   * @param {string} value - The new time frame ('week', 'month', 'year')
   */
  const handleTimeFrameChange = (value) => {
    setTimeFrame(value);

    // Could update transaction filters based on the time frame
    // to show relevant transaction data for the selected period
  };

  /**
   * Handle saving a category change, optionally creating a rule 
   * for future categorization
   * 
   * @param {Object} categoryRule - Data for creating a category rule (optional)
   */
  const handleCategorySave = async (categoryRule) => {
    try {
      // If we have a category rule, create it
      if (categoryRule) {
        await dispatch(createCategoryOverride(categoryRule)).unwrap();
      }
      
      // Reset the category change modal
      setCategoryChangeVisible(false);
      setSelectedTransaction(null);
      
      // Refresh transactions to show the updated category
      dispatch(fetchTransactions({ page, filters }));
    } catch (error) {
      message.error('Failed to save category changes');
    }
  };

  /**
   * Apply category rules to all current transactions
   */
  const handleApplyRules = async () => {
    try {
      setApplyingRules(true);
      const result = await dispatch(applyCategoryRules({ 
        transactionIds: null,
        skipExistingCategories: true
      })).unwrap();
      
      message.success(`${result.message} (Updated ${result.updatedCount} transactions)`);
      
      // Refresh transactions to show the updated categories
      dispatch(fetchTransactions({ page, filters }));
    } catch (error) {
      message.error('Failed to apply category rules: ' + (error || 'Unknown error'));
    } finally {
      setApplyingRules(false);
    }
  };
  
  /**
   * Auto-generate category rules based on transaction patterns
   * 
   * @param {string} type - Type of rules to generate (merchants, amounts, or both)
   */
  const handleGenerateRules = async (type) => {
    try {
      setGeneratingRules(true);
      
      const options = {
        minOccurrences: 3,
        findMerchants: type === 'merchants' || type === 'both',
        findAmounts: type === 'amounts' || type === 'both'
      };
      
      await dispatch(generateRulesFromPatterns(options)).unwrap();
    } catch (error) {
      message.error('Failed to generate category rules: ' + (error || 'Unknown error'));
    } finally {
      setGeneratingRules(false);
    }
  };

  // Get time frame label
  const getTimeFrameLabel = () => {
    switch (timeFrame) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Current Period';
    }
  };


  return (
    <div className="transactions-page">
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Transactions</Title>
          </Card>
        </Col>
      </Row>

      <Row gutter={[0, 16]}>
        <Col span={24}>
          <TransactionStats
            transactions={transactions}
            timeFrame={timeFrame}
            onTimeFrameChange={handleTimeFrameChange}
          />
        </Col>
      </Row>      <Row gutter={[0, 16]}>
        <Col span={24}>
          <TransactionFilters
            form={form}
            categories={categories}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            onApplyRules={handleApplyRules}
            onGenerateRules={handleGenerateRules}
            applyingRules={applyingRules}
            generatingRules={generatingRules}
          />
        </Col>
      </Row>

      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            {loading ? (
              <SkeletonLoader type="table" rows={10} />
            ) : (
              <TransactionTable
                transactions={transactions}
                loading={loading}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={setPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row  gutter={[0, 16]}>
        <Col span={24}>
          <TopMerchantsChart
            transactions={transactions}
            title={`Top Merchants (${getTimeFrameLabel()})`}
          />
        </Col>
      </Row>

      {/* Transaction Edit Modal */}
      <Modal
        title="Edit Transaction"
        open={editMode}
        onCancel={() => {
          setEditMode(false);
          setEditingTransaction(null);
        }}
        footer={null}
        width={700}
      >
        <TransactionEditForm
          transaction={editingTransaction}
          categories={categories}
          onChange={handleEditChange}
          onCancel={() => {
            setEditMode(false);
            setEditingTransaction(null);
          }}
          onSubmit={handleEditSubmit}
        />      </Modal>
      
      {/* Generated Rules Modal */}
      <Modal
        title="Generated Category Rules"
        open={rulesModalVisible}
        onCancel={() => setRulesModalVisible(false)}
        footer={[
          <Button key="apply" type="primary" onClick={() => {
            setRulesModalVisible(false);
            handleApplyRules();
          }}>
            Apply Rules Now
          </Button>,
          <Button key="close" onClick={() => setRulesModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
      >
        {generatedRules && generatedRules.length > 0 ? (
          <>
            <p>Successfully created {generatedRules.length} new category rules based on your transaction history:</p>
            <ul>
              {generatedRules.map((rule, index) => (
                <li key={index}>
                  {rule.matchField === 'merchant' ? (
                    <>Merchant <strong>"{rule.pattern}"</strong> will be categorized as </>
                  ) : (
                    <>Transactions of <strong>${rule.amount}</strong> will be categorized as </>
                  )}
                  <strong>{categories.find(c => c.id === rule.categoryId)?.name || 'Unknown'}</strong>
                  {rule.occurrences && <> (based on {rule.occurrences} transactions)</>}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No new category rules were generated. Try adding more transactions with consistent categories first.</p>
        )}
      </Modal>
      
      {/* User onboarding tour */}
      <OnboardingTooltip />
    </div>
  );
};

export default Transactions;
