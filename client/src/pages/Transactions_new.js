import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Table, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Form, 
  DatePicker, 
  Select, 
  Input, 
  Modal, 
  Tag, 
  Popconfirm,
  Divider,
  Row,
  Col
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  fetchTransactions, 
  deleteTransaction,
  updateTransaction 
} from '../redux/slices/transactionSlice';
import { fetchCategories } from '../redux/slices/categorySlice';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, loading, totalPages, currentPage } = useSelector(state => state.transactions);
  const { categories } = useSelector(state => state.categories);
  
  // Pagination and filtering state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: ''
  });
  
  // For editing transactions
  const [editMode, setEditMode] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [form] = Form.useForm();
  
  useEffect(() => {
    // Fetch transactions and categories on component mount
    dispatch(fetchTransactions({ page, filters }));
    dispatch(fetchCategories());
  }, [dispatch, page]);

  // Apply filters
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

  // Delete transaction
  const handleDelete = (id) => {
    dispatch(deleteTransaction(id));
  };

  // Edit transaction
  const handleEdit = (transaction) => {
    setEditingTransaction({
      ...transaction,
      date: transaction.date.substring(0, 10) // Format to YYYY-MM-DD
    });
    setEditMode(true);
  };

  const handleEditChange = (changedValues, allValues) => {
    // If isRecurring changed to false, remove the recurring fields
    let updatedTransaction = {...editingTransaction};
    
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

  const handleEditSubmit = () => {
    // Format recurring end date if it exists
    let transactionData = {...editingTransaction};
    
    // Format the dates if they exist
    if (transactionData.date && typeof transactionData.date !== 'string') {
      transactionData.date = transactionData.date.format('YYYY-MM-DD');
    }
    
    if (transactionData.recurringEndDate && typeof transactionData.recurringEndDate !== 'string') {
      transactionData.recurringEndDate = transactionData.recurringEndDate.format('YYYY-MM-DD');
    }
    
    // Make sure recurringFrequency is only included when isRecurring is true
    if (!transactionData.isRecurring) {
      delete transactionData.recurringFrequency;
      delete transactionData.recurringEndDate;
    }
    
    dispatch(updateTransaction({
      id: editingTransaction.id,
      transactionData
    }))
    .then(() => {
      setEditMode(false);
      setEditingTransaction(null);
    });
  };

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize);
    dispatch(fetchTransactions({ 
      page: newPage, 
      pageSize: newPageSize, 
      filters 
    }));
  };

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: text => moment(text).format('MMM DD, YYYY'),
      sorter: (a, b) => new Date(a.date) - new Date(b.date)
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: category => (
        <Tag color="blue">{category.name}</Tag>
      )
    },
    {
      title: 'Recurring',
      dataIndex: 'isRecurring',
      key: 'isRecurring',
      render: (isRecurring, record) => {
        if (!isRecurring) return '';
        return (
          <Tag color="purple">
            {record.recurringFrequency ? record.recurringFrequency.charAt(0).toUpperCase() + record.recurringFrequency.slice(1) : 'Yes'}
          </Tag>
        );
      },
      filters: [
        { text: 'One-time', value: false },
        { text: 'Recurring', value: true }
      ],
      onFilter: (value, record) => record.isRecurring === value
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => (
        <span style={{ 
          color: amount < 0 ? '#f5222d' : '#52c41a',
          fontWeight: 'bold'
        }}>
          ${Math.abs(amount).toFixed(2)}
        </span>
      ),
      sorter: (a, b) => a.amount - b.amount
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this transaction?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Transactions</Title>
      
      <Card title="Filters" extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={resetFilters}
        >
          Reset
        </Button>
      }>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFilterChange}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item 
                name="dateRange" 
                label="Date Range"
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item 
                name="category" 
                label="Category"
              >
                <Select
                  placeholder="Select Category"
                  allowClear
                  style={{ width: '100%' }}
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item label=" " colon={false}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<FilterOutlined />}
                  block
                >
                  Apply Filters
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      
      <Divider />
      
      <Card>
        <Table
          columns={columns}
          dataSource={transactions.map(tx => ({ ...tx, key: tx.id }))}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalPages * pageSize, // Approximate if you don't have exact count
            onChange: handlePageChange,
            showSizeChanger: true
          }}
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      
      {/* Edit Transaction Modal */}
      <Modal
        title="Edit Transaction"
        visible={editMode}
        onOk={handleEditSubmit}
        onCancel={() => setEditMode(false)}
        okText="Save"
        confirmLoading={loading}
      >
        {editingTransaction && (
          <Form
            initialValues={{
              date: moment(editingTransaction.date),
              description: editingTransaction.description,
              amount: editingTransaction.amount,
              categoryId: editingTransaction.category.id
            }}
            onValuesChange={handleEditChange}
            layout="vertical"
          >
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: 'Please select date!' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Description"
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: 'Please enter amount!' }]}
            >
              <Input type="number" step="0.01" />
            </Form.Item>
            
            <Form.Item
              name="categoryId"
              label="Category"
            >
              <Select>
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
              valuePropName="checked"
            >
              <Select>
                <Option value={false}>No</Option>
                <Option value={true}>Yes</Option>
              </Select>
            </Form.Item>
            
            {editingTransaction?.isRecurring && (
              <>
                <Form.Item
                  name="recurringFrequency"
                  label="Frequency"
                  rules={[{ required: editingTransaction?.isRecurring, message: 'Please select frequency!' }]}
                >
                  <Select>
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="biweekly">Bi-weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="quarterly">Quarterly</Option>
                    <Option value="annually">Annually</Option>
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="recurringDuration"
                  label="Duration"
                  tooltip="Number of occurrences (e.g., 12 for a yearly subscription that renews for 12 years)"
                >
                  <Input type="number" min="1" step="1" placeholder="Number of occurrences" />
                </Form.Item>
                
                <Form.Item
                  name="recurringEndDate"
                  label="End Date"
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Transactions;
