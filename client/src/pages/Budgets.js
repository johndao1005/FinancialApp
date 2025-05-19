import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget,
  fetchBudgetProgress
} from '../redux/slices/budgetSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  Progress,
  Card,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Typography,
  Divider,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const Budgets = () => {
  const dispatch = useDispatch();
  const { budgets, currentBudget, budgetProgress, loading, error } = useSelector(state => state.budgets);
  const { categories } = useSelector(state => state.categories);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  
  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchCategories());
  }, [dispatch]);
  
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);
  
  const showModal = (budget = null) => {
    if (budget) {
      setEditingBudgetId(budget.id);
      form.setFieldsValue({
        name: budget.name,
        amount: budget.amount,
        period: budget.period,
        categoryId: budget.categoryId,
        dateRange: budget.endDate 
          ? [moment(budget.startDate), moment(budget.endDate)]
          : [moment(budget.startDate), null],
        notes: budget.notes
      });
    } else {
      setEditingBudgetId(null);
      form.resetFields();
      form.setFieldsValue({
        period: 'monthly',
        dateRange: [moment(), null]
      });
    }
    setModalVisible(true);
  };
  
  const showProgressModal = (budget) => {
    dispatch(fetchBudgetProgress(budget.id));
    setProgressModalVisible(true);
  };
  
  const handleCancel = () => {
    setModalVisible(false);
    setEditingBudgetId(null);
    form.resetFields();
  };
  
  const handleProgressModalCancel = () => {
    setProgressModalVisible(false);
  };
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const budgetData = {
        name: values.name,
        amount: values.amount,
        period: values.period,
        startDate: values.dateRange[0].format(),
        endDate: values.dateRange[1] ? values.dateRange[1].format() : null,
        categoryId: values.categoryId,
        notes: values.notes
      };
      
      if (editingBudgetId) {
        await dispatch(updateBudget({ id: editingBudgetId, budgetData })).unwrap();
        message.success('Budget updated successfully');
      } else {
        await dispatch(createBudget(budgetData)).unwrap();
        message.success('Budget created successfully');
      }
      
      setModalVisible(false);
      setEditingBudgetId(null);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteBudget(id)).unwrap();
      message.success('Budget deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
    }
  };
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (_, record) => record.category?.name || 'All Categories'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period) => period.charAt(0).toUpperCase() + period.slice(1)
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => moment(date).format('MMM DD, YYYY')
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => date ? moment(date).format('MMM DD, YYYY') : 'Ongoing'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button 
            type="primary" 
            icon={<DollarOutlined />} 
            onClick={() => showProgressModal(record)}
            style={{ marginRight: '8px' }}
          >
            Progress
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
            style={{ marginRight: '8px' }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this budget?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      )
    }
  ];
  
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 }
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2}>Budgets</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Create Budget
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={budgets} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      
      <Modal
        title={editingBudgetId ? 'Edit Budget' : 'Create Budget'}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingBudgetId ? 'Update' : 'Create'}
        width={600}
      >
        <Form 
          form={form}
          {...formItemLayout}
          layout="horizontal"
        >
          <Form.Item
            name="name"
            label="Budget Name"
            rules={[{ required: true, message: 'Please enter a budget name' }]}
          >
            <Input placeholder="e.g., Monthly Expenses, Groceries Budget" />
          </Form.Item>
          
          <Form.Item
            name="amount"
            label="Budget Amount"
            rules={[{ required: true, message: 'Please enter a budget amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={0}
              step={10}
              placeholder="Enter budget amount"
            />
          </Form.Item>
          
          <Form.Item
            name="period"
            label="Budget Period"
            rules={[{ required: true, message: 'Please select a budget period' }]}
          >
            <Select placeholder="Select budget period">
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="yearly">Yearly</Option>
              <Option value="custom">Custom</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: 'Please select a date range' }]}
          >
            <RangePicker 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              allowEmpty={[false, true]}
            />
          </Form.Item>
          
          <Form.Item
            name="categoryId"
            label="Category"
          >
            <Select 
              placeholder="Select a category (optional)"
              allowClear
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea 
              rows={4} 
              placeholder="Add any notes or details about this budget (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title="Budget Progress"
        open={progressModalVisible}
        onCancel={handleProgressModalCancel}
        footer={[
          <Button key="back" onClick={handleProgressModalCancel}>
            Close
          </Button>
        ]}
        width={700}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            Loading budget progress...
          </div>
        ) : (
          budgetProgress && (
            <>
              <Title level={3}>{budgetProgress.budget.name}</Title>
              <Text type="secondary">
                {budgetProgress.budget.category ? 
                  `Category: ${budgetProgress.budget.category.name}` : 
                  'All Categories'}
              </Text>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Budget Amount"
                      value={budgetProgress.budget.amount}
                      precision={2}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Spent So Far"
                      value={budgetProgress.totalSpent}
                      precision={2}
                      prefix="$"
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Remaining"
                      value={budgetProgress.remaining}
                      precision={2}
                      prefix="$"
                      valueStyle={{ color: budgetProgress.remaining > 0 ? '#3f8600' : '#cf1322' }}
                    />
                  </Card>
                </Col>
              </Row>
              
              <div style={{ margin: '24px 0' }}>
                <Text>Progress:</Text>
                <Progress 
                  percent={Math.round(budgetProgress.percentUsed)} 
                  status={budgetProgress.percentUsed >= 100 ? 'exception' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': budgetProgress.percentUsed >= 100 ? '#ff4d4f' : '#87d068',
                  }}
                />
              </div>
              
              <Divider>Recent Transactions</Divider>
              
              <Table 
                dataSource={budgetProgress.transactions.slice(0, 5)}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: 'Date',
                    dataIndex: 'date',
                    key: 'date',
                    render: (date) => moment(date).format('MMM DD, YYYY')
                  },
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description'
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'amount',
                    key: 'amount',
                    render: (amount) => `$${Math.abs(parseFloat(amount)).toFixed(2)}`
                  },
                  {
                    title: 'Category',
                    dataIndex: 'categoryId',
                    key: 'categoryId',
                    render: (_, record) => record.category?.name || 'Uncategorized'
                  }
                ]}
              />
              
              {budgetProgress.transactions.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Text type="secondary">
                    Showing 5 of {budgetProgress.transactions.length} transactions
                  </Text>
                </div>
              )}
            </>
          )
        )}
      </Modal>
    </div>
  );
};

export default Budgets;
