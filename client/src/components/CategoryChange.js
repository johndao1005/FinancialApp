/**
 * CategoryChange Component
 * 
 * A component that allows users to change the category of a transaction
 * and optionally create a rule to apply this category to similar transactions
 * in the future.
 * 
 * Features:
 * - Select a new category from dropdown
 * - Option to create a pattern-matching rule for automatic categorization
 * - Choose which field to match (merchant or description)
 * - Choose match type (exact or contains)
 */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Modal, 
  Select, 
  Form, 
  Switch, 
  Radio, 
  Input, 
  message 
} from 'antd';
import { updateTransaction } from '../redux/slices/transactionSlice';

const { Option } = Select;

const CategoryChange = ({ 
  visible, 
  transaction, 
  categories,
  onCancel,
  onSave
}) => {
  const [form] = Form.useForm();
  const [createRule, setCreateRule] = useState(false);
  const dispatch = useDispatch();
  
  // If there's no transaction, don't render the component
  if (!transaction) return null;

  const initialValues = {
    categoryId: transaction.category?.id,
    createRule: false,
    matchField: 'merchant',
    matchType: 'exact',
    pattern: transaction.merchant || transaction.description
  };

  const handleSave = async (values) => {
    try {
      // First update the transaction with the new category
      const transactionData = {
        ...transaction,
        categoryId: values.categoryId
      };
      
      await dispatch(updateTransaction({
        id: transaction.id,
        transactionData
      })).unwrap();
      
      // If user wants to create a rule, call the API to create it
      if (values.createRule) {
        // The API call to create the rule will be implemented in onSave
        // which will be passed from the parent component
        const categoryRule = {
          categoryId: values.categoryId,
          pattern: values.pattern,
          matchField: values.matchField,
          matchType: values.matchType,
          // If matching on amount, include it, otherwise set to null
          amount: values.matchField === 'amount' ? Math.abs(transaction.amount) : null
        };
        
        await onSave(categoryRule);
      } else {
        // Just notify the parent that we saved without creating a rule
        onSave();
      }
      
      // Show success message
      message.success(
        values.createRule 
          ? 'Category updated and rule created for future transactions' 
          : 'Category updated'
      );
      
      // Reset form
      form.resetFields();
    } catch (error) {
      message.error('Failed to update: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <Modal
      title="Change Transaction Category"
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Save"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSave}
      >
        <Form.Item
          name="categoryId"
          label="Category"
          rules={[{ required: true, message: 'Please select a category' }]}
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
          name="createRule" 
          label="Create rule for future transactions"
          valuePropName="checked"
        >
          <Switch onChange={setCreateRule} />
        </Form.Item>
        
        {createRule && (
          <>
            <Form.Item
              name="matchField"
              label="Match on field"
            >
              <Radio.Group>
                <Radio value="merchant">Merchant</Radio>
                <Radio value="description">Description</Radio>
                <Radio value="amount">Amount</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="matchType"
              label="Match type"
            >
              <Radio.Group>
                <Radio value="exact">Exact match</Radio>
                <Radio value="pattern">Contains pattern</Radio>
              </Radio.Group>
            </Form.Item>
            
            <Form.Item
              name="pattern"
              label="Pattern to match"
              rules={[{ required: true, message: 'Please enter a pattern' }]}
            >
              <Input placeholder="Enter text to match" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default CategoryChange;