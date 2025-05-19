/**
 * QuickTransactionEntry Component
 * 
 * This component provides a quick way to add new transactions from the dashboard.
 * Features:
 * - Modal popup with a form for transaction details
 * - Support for both expense and income transactions
 * - Support for recurring transactions (one-off, weekly, bi-weekly, monthly)
 * - Optional end date for recurring transactions
 * - Different category options based on transaction type (expense/income)
 * 
 * Props:
 * - onSuccess: Callback function to execute after successfully adding a transaction
 */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  InputNumber, 
  Switch,
  message,
  Radio
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { createTransaction } from '../redux/slices/transactionSlice';
import moment from 'moment';

const { Option } = Select;

const QuickTransactionEntry = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpense, setIsExpense] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dispatch = useDispatch();

  // Common expense categories
  const expenseCategories = [
    'Uncategorized',
    'Dining', 
    'Groceries',
    'Transportation', 
    'Housing', 
    'Utilities', 
    'Entertainment', 
    'Shopping', 
    'Healthcare',
    'Personal Care',
    'Education',
    'Travel',
    'Other'
  ];

  // Common income categories
  const incomeCategories = [
    'Uncategorized',
    'Salary', 
    'Freelance', 
    'Investments', 
    'Gifts', 
    'Refunds',
    'Other'
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  /**
   * Handle form submission to create a new transaction
   * 
   * This function:
   * 1. Formats the transaction data from form values
   * 2. Handles both one-time and recurring transactions
   * 3. Includes end date for recurring transactions if provided
   * 4. Dispatches the createTransaction action to the Redux store
   * 5. Shows success or error messages
   * 6. Calls the onSuccess callback if provided
   * 
   * @param {Object} values - Form values from Ant Design form
   */
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const transactionData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        isExpense,
        amount: parseFloat(values.amount).toFixed(2),
        isRecurring: values.recurringFrequency !== 'one-off',
        recurringFrequency: values.recurringFrequency !== 'one-off' ? values.recurringFrequency : null
      };
      
      // Add end date for recurring transactions if provided
      if (values.recurringEndDate && values.recurringFrequency !== 'one-off') {
        transactionData.recurringEndDate = values.recurringEndDate.format('YYYY-MM-DD');
      }
      
      await dispatch(createTransaction(transactionData)).unwrap();
      message.success('Transaction added successfully!');
      setIsModalOpen(false);
      form.resetFields();
      
      // Call the success callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      message.error('Failed to add transaction: ' + (error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Quick Add Button to open the modal */}
      <Button 
        type="primary" 
        icon={<PlusOutlined />}
        onClick={showModal}
      >
        Quick Add
      </Button>
      
      {/* Transaction Entry Modal Form */}
      <Modal
        title="Add New Transaction"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            date: moment(),
            amount: '',
            isExpense: true,
            category: 'Uncategorized',
            description: '',
            merchant: '',
            recurringFrequency: 'one-off'
          }}
        >
          {/* Transaction Type Switch (Expense/Income) */}
          <Form.Item label="Transaction Type">
            <Switch
              checkedChildren="Expense"
              unCheckedChildren="Income"
              defaultChecked
              onChange={(checked) => {
                setIsExpense(checked);
                form.setFieldsValue({
                  category: 'Uncategorized'
                });
              }}
            />
          </Form.Item>
          
          {/* Transaction Date */}
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          {/* Transaction Amount */}
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter an amount!' }]}
          >
            <InputNumber 
              style={{ width: '100%' }} 
              prefix="$" 
              min={0.01} 
              step={0.01} 
              precision={2}
              placeholder="0.00"
            />
          </Form.Item>
          
          {/* Transaction Category */}
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select>
              {(isExpense ? expenseCategories : incomeCategories).map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* Transaction Description */}
          <Form.Item
            name="description"
            label="Description"
          >
            <Input placeholder="What is this transaction for?" />
          </Form.Item>
          
          {/* Merchant Field (only shown for expenses) */}
          {isExpense && (
            <Form.Item
              name="merchant"
              label="Merchant"
            >
              <Input placeholder="Where did you make this purchase?" />
            </Form.Item>
          )}
          
          {/* Recurring Transaction Options */}
          <Form.Item
            name="recurringFrequency"
            label="Repeat Transaction"
            rules={[{ required: true, message: 'Please select a frequency!' }]}
          >
            <Radio.Group onChange={(e) => setIsRecurring(e.target.value !== 'one-off')}>
              <Radio.Button value="one-off">One-off</Radio.Button>
              <Radio.Button value="weekly">Weekly</Radio.Button>
              <Radio.Button value="biweekly">Bi-weekly</Radio.Button>
              <Radio.Button value="monthly">Monthly</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          {/* End Date for Recurring Transactions */}
          {isRecurring && (
            <Form.Item
              name="recurringEndDate"
              label="End Date (Optional)"
              tooltip="Leave empty for indefinite recurring transactions"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          )}
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Transaction
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default QuickTransactionEntry;