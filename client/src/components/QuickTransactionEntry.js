import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, Button, DatePicker, Select, message, Modal, Radio } from 'antd';
import { PlusOutlined, MinusOutlined, DollarOutlined, SaveOutlined } from '@ant-design/icons';
import moment from 'moment';
import { fetchCategories } from '../redux/slices/categorySlice';
import { quickAddTransaction, quickAddExpense, quickAddIncome } from '../utils/transactionUtils';

const { Option } = Select;

/**
 * Quick Transaction Entry Component
 * 
 * This component provides a simple form for quickly adding transactions.
 * Can be used anywhere in the application.
 * 
 * @param {Object} props
 * @param {Function} props.onSuccess - Callback function when transaction is added successfully
 * @param {string} props.initialType - Initial transaction type ('expense' or 'income')
 * @param {boolean} props.inModal - Whether to render as a button that opens a modal (true) or inline form (false)
 */
const QuickTransactionEntry = ({ onSuccess, initialType = 'expense', inModal = true }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.categories);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [transactionType, setTransactionType] = useState(initialType);

  useEffect(() => {
    // Fetch categories if not already loaded
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  const handleTypeChange = e => {
    setTransactionType(e.target.value);
  };

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        setLoading(true);
        
        const transactionData = {
          description: values.description,
          amount: transactionType === 'expense' ? -Math.abs(values.amount) : Math.abs(values.amount),
          date: values.date.format('YYYY-MM-DD'),
          categoryId: values.categoryId,
          merchant: values.merchant || '',
          notes: values.notes || '',
          isRecurring: values.isRecurring || false
        };
        
        // Add recurring payment details if applicable
        if (transactionData.isRecurring) {
          transactionData.recurringFrequency = values.recurringFrequency;
          transactionData.recurringEndDate = values.recurringEndDate ? 
            values.recurringEndDate.format('YYYY-MM-DD') : null;
        }
        
        quickAddTransaction(transactionData)
          .then(() => {
            setLoading(false);
            message.success('Transaction added successfully');
            form.resetFields();
            
            if (inModal) {
              setVisible(false);
            }
            
            if (onSuccess) {
              onSuccess(transactionData);
            }
          })
          .catch(error => {
            setLoading(false);
            message.error('Failed to add transaction: ' + error);
          });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const openModal = () => {
    form.setFieldsValue({
      date: moment(),
      amount: '',
      description: '',
      categoryId: undefined,
      merchant: '',
      notes: '',
      isRecurring: false,
      recurringFrequency: undefined,
      recurringEndDate: undefined
    });
    setVisible(true);
  };

  const renderForm = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        date: moment(),
        type: transactionType
      }}
    >
      <Form.Item name="type" label="Transaction Type">
        <Radio.Group onChange={handleTypeChange} value={transactionType}>
          <Radio.Button value="expense">
            <MinusOutlined /> Expense
          </Radio.Button>
          <Radio.Button value="income">
            <PlusOutlined /> Income
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      
      <Form.Item
        name="date"
        label="Date"
        rules={[{ required: true, message: 'Date is required' }]}
      >
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      
      <Form.Item
        name="description"
        label="Description"
      >
        <Input placeholder="What is this transaction for?" />
      </Form.Item>
      
      <Form.Item
        name="amount"
        label="Amount"
        rules={[
          { required: true, message: 'Amount is required' },
          { 
            validator: (_, value) => {
              if (isNaN(value) || parseFloat(value) <= 0) {
                return Promise.reject('Please enter a valid positive amount');
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <Input 
          type="number" 
          step="0.01" 
          min="0.01" 
          prefix={<DollarOutlined />} 
          placeholder="0.00" 
        />
      </Form.Item>
      
      <Form.Item
        name="categoryId"
        label="Category"
      >
        <Select placeholder="Select a category">
          {categories.map(category => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
      </Form.Item>
      
      <Form.Item
        name="isRecurring"
        label="Recurring Payment"
        initialValue={false}
      >
        <Select>
          <Option value={false}>No</Option>
          <Option value={true}>Yes</Option>
        </Select>
      </Form.Item>
      
      <Form.Item
        noStyle
        shouldUpdate={(prevValues, currentValues) => prevValues.isRecurring !== currentValues.isRecurring}
      >
        {({ getFieldValue }) => 
          getFieldValue('isRecurring') === true ? (
            <>
              <Form.Item
                name="recurringFrequency"
                label="Frequency"
                rules={[{ required: getFieldValue('isRecurring'), message: 'Please select frequency!' }]}
              >
                <Select placeholder="Select frequency">
                  <Option value="daily">Daily</Option>
                  <Option value="weekly">Weekly</Option>
                  <Option value="biweekly">Bi-weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="annually">Annually</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="recurringEndDate"
                label="End Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </>
          ) : null
        }
      </Form.Item>
      
      <Form.Item
        name="merchant"
        label="Merchant"
      >
        <Input placeholder="Where did you make this transaction? (optional)" />
      </Form.Item>
      
      <Form.Item
        name="notes"
        label="Notes"
      >
        <Input.TextArea placeholder="Additional notes (optional)" rows={3} />
      </Form.Item>
    </Form>
  );

  if (inModal) {
    return (
      <>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={openModal}
        >
          Quick Add Transaction
        </Button>
        
        <Modal
          title={`Add New ${transactionType === 'expense' ? 'Expense' : 'Income'}`}
          visible={visible}
          onOk={handleSubmit}
          onCancel={() => setVisible(false)}
          okText="Add"
          confirmLoading={loading}
          okButtonProps={{ icon: <SaveOutlined /> }}
        >
          {renderForm()}
        </Modal>
      </>
    );
  }

  return (
    <div className="quick-transaction-form">
      {renderForm()}
      <Button 
        type="primary" 
        onClick={handleSubmit} 
        loading={loading}
        icon={<SaveOutlined />}
      >
        Add {transactionType === 'expense' ? 'Expense' : 'Income'}
      </Button>
    </div>
  );
};

export default QuickTransactionEntry;
