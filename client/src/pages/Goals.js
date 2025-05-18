import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchGoals, 
  fetchGoal,
  createGoal, 
  updateGoal, 
  deleteGoal,
  addContribution,
  deleteContribution,
  clearCurrentGoal
} from '../redux/slices/goalSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Progress, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  Table,
  Statistic,
  Divider,
  Popconfirm,
  Empty,
  Tag,
  Tabs,
  Space,
  message
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  FlagOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  LineChartOutlined,
  BankOutlined,
  HomeOutlined,
  CarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const goalTypeIcons = {
  saving: <BankOutlined />,
  debt: <DollarOutlined />,
  investment: <LineChartOutlined />,
  expense: <HomeOutlined />,
  other: <CarOutlined />
};

const priorityColors = {
  low: 'blue',
  medium: 'orange',
  high: 'red'
};

const statusColors = {
  in_progress: 'processing',
  completed: 'success',
  abandoned: 'default'
};

const Goals = () => {
  const dispatch = useDispatch();
  const { goals, currentGoal, loading, error } = useSelector(state => state.goals);
  const { categories } = useSelector(state => state.categories);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [contributionModalVisible, setContributionModalVisible] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [form] = Form.useForm();
  const [contributionForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchCategories());
  }, [dispatch]);
  
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);
  
  const showModal = (goal = null) => {
    if (goal) {
      setEditingGoalId(goal.id);
      form.setFieldsValue({
        name: goal.name,
        description: goal.description,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate ? moment(goal.targetDate) : null,
        type: goal.type,
        categoryId: goal.categoryId,
        priority: goal.priority,
        color: goal.color,
        icon: goal.icon,
        notes: goal.notes
      });
    } else {
      setEditingGoalId(null);
      form.resetFields();
      form.setFieldsValue({
        type: 'saving',
        priority: 'medium',
        currentAmount: 0
      });
    }
    setModalVisible(true);
  };
  
  const showDetailModal = (goalId) => {
    setSelectedGoalId(goalId);
    dispatch(fetchGoal(goalId));
    setDetailModalVisible(true);
  };
  
  const showContributionModal = (goalId) => {
    setSelectedGoalId(goalId);
    contributionForm.resetFields();
    contributionForm.setFieldsValue({
      date: moment(),
    });
    setContributionModalVisible(true);
  };
  
  const handleCancel = () => {
    setModalVisible(false);
    setEditingGoalId(null);
    form.resetFields();
  };
  
  const handleDetailModalCancel = () => {
    setDetailModalVisible(false);
    setSelectedGoalId(null);
    dispatch(clearCurrentGoal());
  };
  
  const handleContributionModalCancel = () => {
    setContributionModalVisible(false);
    contributionForm.resetFields();
  };
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const goalData = {
        name: values.name,
        description: values.description,
        targetAmount: values.targetAmount,
        currentAmount: values.currentAmount,
        targetDate: values.targetDate ? values.targetDate.format() : null,
        type: values.type,
        categoryId: values.categoryId,
        priority: values.priority,
        color: values.color,
        icon: values.icon,
        notes: values.notes
      };
      
      if (editingGoalId) {
        await dispatch(updateGoal({ id: editingGoalId, goalData })).unwrap();
        message.success('Goal updated successfully');
      } else {
        await dispatch(createGoal(goalData)).unwrap();
        message.success('Goal created successfully');
      }
      
      setModalVisible(false);
      setEditingGoalId(null);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await dispatch(deleteGoal(id)).unwrap();
      message.success('Goal deleted successfully');
      
      if (selectedGoalId === id) {
        setDetailModalVisible(false);
        setSelectedGoalId(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };
  
  const handleContributionSubmit = async () => {
    try {
      const values = await contributionForm.validateFields();
      const contributionData = {
        amount: values.amount,
        date: values.date.format(),
        description: values.description
      };
      
      await dispatch(addContribution({ 
        id: selectedGoalId, 
        contributionData 
      })).unwrap();
      
      message.success('Contribution added successfully');
      setContributionModalVisible(false);
      
      // Refresh the goal details if the detail modal is open
      if (detailModalVisible && selectedGoalId) {
        dispatch(fetchGoal(selectedGoalId));
      }
    } catch (error) {
      console.error('Contribution error:', error);
    }
  };
  
  const handleDeleteContribution = async (goalId, contributionId) => {
    try {
      await dispatch(deleteContribution({ goalId, contributionId })).unwrap();
      message.success('Contribution deleted successfully');
      
      // Refresh the goal details if the detail modal is open
      if (detailModalVisible && selectedGoalId === goalId) {
        dispatch(fetchGoal(selectedGoalId));
      }
    } catch (error) {
      console.error('Delete contribution error:', error);
    }
  };
  
  const filteredGoals = activeTab === 'all' 
    ? goals 
    : goals.filter(goal => {
        if (activeTab === 'completed') return goal.status === 'completed';
        if (activeTab === 'in_progress') return goal.status === 'in_progress';
        if (activeTab === 'saving') return goal.type === 'saving';
        if (activeTab === 'debt') return goal.type === 'debt';
        if (activeTab === 'investment') return goal.type === 'investment';
        return true;
      });
  
  const contributionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: date => moment(date).format('MMM DD, YYYY')
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: amount => `$${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to delete this contribution?"
          onConfirm={() => handleDeleteContribution(record.goalId, record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            icon={<DeleteOutlined />} 
            danger
            size="small"
          />
        </Popconfirm>
      )
    }
  ];
  
  const renderGoalCard = (goal) => {
    const deadline = goal.targetDate ? moment(goal.targetDate) : null;
    const daysLeft = deadline ? deadline.diff(moment(), 'days') : null;
    
    return (
      <Col xs={24} sm={12} lg={8} xl={6} key={goal.id} style={{ marginBottom: '16px' }}>
        <Card 
          hoverable
          style={{ 
            height: '100%',
            borderTop: `2px solid ${goal.color || '#1677ff'}`
          }}
          actions={[
            <Button 
              type="text" 
              icon={<DollarOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                showContributionModal(goal.id);
              }}
            >
              Add
            </Button>,
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={(e) => {
                e.stopPropagation();
                showModal(goal);
              }}
            >
              Edit
            </Button>,
            <Popconfirm
              title="Are you sure you want to delete this goal?"
              onConfirm={(e) => {
                e.stopPropagation();
                handleDelete(goal.id);
              }}
              okText="Yes"
              cancelText="No"
              onCancel={(e) => e.stopPropagation()}
            >
              <Button 
                type="text" 
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
                danger
              >
                Delete
              </Button>
            </Popconfirm>
          ]}
          onClick={() => showDetailModal(goal.id)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {goal.icon ? (
                <span style={{ marginRight: '8px', fontSize: '16px' }}>{goal.icon}</span>
              ) : (
                <span style={{ marginRight: '8px', fontSize: '16px' }}>
                  {goalTypeIcons[goal.type] || <TrophyOutlined />}
                </span>
              )}
              <Text strong style={{ fontSize: '16px' }}>{goal.name}</Text>
            </div>
            <div>
              <Tag color={priorityColors[goal.priority] || 'blue'}>
                {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
              </Tag>
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {goal.category ? goal.category.name : 'General'}
            </Text>
          </div>
          
          <Progress 
            percent={Math.round(goal.percentComplete)} 
            status={goal.percentComplete >= 100 ? 'success' : 'active'} 
            size="small"
          />
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '16px',
            marginBottom: '8px'
          }}>
            <Statistic 
              title="Target" 
              value={goal.targetAmount} 
              precision={2} 
              prefix="$" 
              valueStyle={{ fontSize: '16px' }}
            />
            <Statistic 
              title="Current" 
              value={goal.currentAmount} 
              precision={2} 
              prefix="$" 
              valueStyle={{ fontSize: '16px' }}
            />
          </div>
          
          {daysLeft !== null && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <Tag 
                icon={<ClockCircleOutlined />} 
                color={daysLeft <= 0 ? 'red' : daysLeft <= 30 ? 'orange' : 'green'}
              >
                {daysLeft <= 0 
                  ? 'Overdue' 
                  : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
              </Tag>
            </div>
          )}
          
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <Tag color={statusColors[goal.status]}>
              {goal.status === 'in_progress' ? 'In Progress' : 
                goal.status === 'completed' ? 'Completed' : 'Abandoned'}
            </Tag>
          </div>
        </Card>
      </Col>
    );
  };
  
  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Title level={2}>Financial Goals</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Create Goal
        </Button>
      </div>
      
      <Tabs defaultActiveKey="all" onChange={setActiveTab} style={{ marginBottom: '16px' }}>
        <TabPane tab="All Goals" key="all" />
        <TabPane tab="In Progress" key="in_progress" />
        <TabPane tab="Completed" key="completed" />
        <TabPane tab="Savings" key="saving" />
        <TabPane tab="Debt Payoff" key="debt" />
        <TabPane tab="Investments" key="investment" />
      </Tabs>
      
      {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading goals...</div>}
      
      {!loading && filteredGoals.length === 0 ? (
        <Empty 
          description={
            <span>
              No goals found. Click "Create Goal" to get started!
            </span>
          }
        />
      ) : (
        <Row gutter={16}>
          {filteredGoals.map(renderGoalCard)}
        </Row>
      )}
      
      {/* Goal Form Modal */}
      <Modal
        title={editingGoalId ? 'Edit Goal' : 'Create Goal'}
        open={modalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingGoalId ? 'Update' : 'Create'}
        width={600}
      >
        <Form 
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Goal Name"
                rules={[{ required: true, message: 'Please enter a goal name' }]}
              >
                <Input placeholder="e.g., Emergency Fund, New Car, Pay Off Credit Card" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="type"
                label="Goal Type"
                rules={[{ required: true, message: 'Please select a goal type' }]}
              >
                <Select>
                  <Option value="saving">Saving</Option>
                  <Option value="debt">Debt Payoff</Option>
                  <Option value="investment">Investment</Option>
                  <Option value="expense">Major Expense</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input placeholder="Brief description of your goal" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="targetAmount"
                label="Target Amount"
                rules={[{ required: true, message: 'Please enter a target amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                  placeholder="Enter target amount"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="currentAmount"
                label="Current Amount"
                rules={[{ required: true, message: 'Please enter the current amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                  placeholder="Enter current amount"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="targetDate"
                label="Target Date"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
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
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="priority"
                label="Priority"
              >
                <Select>
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="color"
                label="Color"
              >
                <Input type="color" />
              </Form.Item>
            </Col>
            
            <Col span={8}>
              <Form.Item
                name="icon"
                label="Icon"
              >
                <Input placeholder="Icon name" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea 
              rows={4} 
              placeholder="Additional notes about your goal (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Goal Detail Modal */}
      <Modal
        title={currentGoal?.name || 'Goal Details'}
        open={detailModalVisible}
        onCancel={handleDetailModalCancel}
        footer={[
          <Button 
            key="contribute" 
            type="primary" 
            icon={<DollarOutlined />}
            onClick={() => {
              handleDetailModalCancel();
              showContributionModal(selectedGoalId);
            }}
          >
            Add Contribution
          </Button>,
          <Button 
            key="edit" 
            icon={<EditOutlined />}
            onClick={() => {
              handleDetailModalCancel();
              if (currentGoal) showModal(currentGoal);
            }}
          >
            Edit Goal
          </Button>,
          <Button key="close" onClick={handleDetailModalCancel}>
            Close
          </Button>
        ]}
        width={800}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading goal details...</div>
        ) : currentGoal ? (
          <>
            <div style={{ marginBottom: '24px' }}>
              <Row gutter={16}>
                <Col span={16}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    {currentGoal.icon ? (
                      <span style={{ marginRight: '8px', fontSize: '20px' }}>{currentGoal.icon}</span>
                    ) : (
                      <span style={{ marginRight: '8px', fontSize: '20px' }}>
                        {goalTypeIcons[currentGoal.type] || <TrophyOutlined />}
                      </span>
                    )}
                    <Title level={3} style={{ margin: 0 }}>{currentGoal.name}</Title>
                  </div>
                  
                  <Space size="middle">
                    <Tag color={priorityColors[currentGoal.priority] || 'blue'}>
                      {currentGoal.priority.charAt(0).toUpperCase() + currentGoal.priority.slice(1)} Priority
                    </Tag>
                    
                    <Tag color={statusColors[currentGoal.status]}>
                      {currentGoal.status === 'in_progress' ? 'In Progress' : 
                        currentGoal.status === 'completed' ? 'Completed' : 'Abandoned'}
                    </Tag>
                    
                    <Tag color="purple">
                      {currentGoal.type.charAt(0).toUpperCase() + currentGoal.type.slice(1)}
                    </Tag>
                    
                    {currentGoal.category && (
                      <Tag color="cyan">
                        {currentGoal.category.name}
                      </Tag>
                    )}
                  </Space>
                  
                  {currentGoal.description && (
                    <Paragraph style={{ marginTop: '16px' }}>
                      {currentGoal.description}
                    </Paragraph>
                  )}
                </Col>
                
                <Col span={8}>
                  <Card style={{ backgroundColor: '#f5f5f5' }}>
                    <Progress 
                      type="circle" 
                      percent={Math.round(currentGoal.percentComplete)} 
                      status={currentGoal.percentComplete >= 100 ? 'success' : 'active'} 
                      width={100}
                    />
                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                      <Text strong>
                        {`$${parseFloat(currentGoal.currentAmount).toFixed(2)} of $${parseFloat(currentGoal.targetAmount).toFixed(2)}`}
                      </Text>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
            
            <Row gutter={16}>
              <Col span={8}>
                <Statistic 
                  title="Remaining" 
                  value={currentGoal.remainingAmount} 
                  precision={2} 
                  prefix="$"
                  valueStyle={{ color: currentGoal.remainingAmount > 0 ? '#cf1322' : '#3f8600' }}
                />
              </Col>
              
              {currentGoal.requiredMonthlyContribution && (
                <Col span={8}>
                  <Statistic 
                    title="Monthly Needed" 
                    value={currentGoal.requiredMonthlyContribution} 
                    precision={2} 
                    prefix="$"
                  />
                </Col>
              )}
              
              {currentGoal.daysRemaining !== null && (
                <Col span={8}>
                  <Statistic 
                    title="Days Remaining" 
                    value={currentGoal.daysRemaining}
                    suffix="days"
                    valueStyle={{ 
                      color: currentGoal.daysRemaining <= 0 ? '#cf1322' : 
                        currentGoal.daysRemaining <= 30 ? '#faad14' : '#3f8600' 
                    }}
                  />
                </Col>
              )}
            </Row>
            
            {currentGoal.targetDate && (
              <div style={{ margin: '16px 0' }}>
                <Text>Target Date: {moment(currentGoal.targetDate).format('MMMM D, YYYY')}</Text>
                {currentGoal.timeProgress !== null && (
                  <div style={{ marginTop: '8px' }}>
                    <Text>Time Progress:</Text>
                    <Progress 
                      percent={Math.round(currentGoal.timeProgress)}
                      status={
                        currentGoal.timeProgress >= 100 && currentGoal.percentComplete < 100 
                          ? 'exception' 
                          : 'active'
                      }
                      size="small"
                    />
                  </div>
                )}
              </div>
            )}
            
            {currentGoal.notes && (
              <div style={{ margin: '16px 0' }}>
                <Title level={5}>Notes</Title>
                <Paragraph>{currentGoal.notes}</Paragraph>
              </div>
            )}
            
            <Divider orientation="left">Contributions</Divider>
            
            {currentGoal.contributions && currentGoal.contributions.length > 0 ? (
              <Table 
                dataSource={currentGoal.contributions.map(c => ({ ...c, key: c.id }))} 
                columns={contributionColumns} 
                pagination={{ pageSize: 5 }}
                size="small"
              />
            ) : (
              <Empty description="No contributions yet" />
            )}
          </>
        ) : (
          <Empty description="Goal not found" />
        )}
      </Modal>
      
      {/* Contribution Modal */}
      <Modal
        title="Add Contribution"
        open={contributionModalVisible}
        onCancel={handleContributionModalCancel}
        onOk={handleContributionSubmit}
        okText="Add"
      >
        <Form 
          form={contributionForm}
          layout="vertical"
        >
          <Form.Item
            name="amount"
            label="Contribution Amount"
            rules={[
              { required: true, message: 'Please enter an amount' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={0.01}
              step={10}
              placeholder="Enter contribution amount"
            />
          </Form.Item>
          
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input placeholder="e.g., Monthly deposit, Bonus, Gift, etc." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Goals;
