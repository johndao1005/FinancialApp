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
} from '../../redux/slices/goalSlice';
import { fetchCategories } from '../../redux/slices/categorySlice';
import { 
  Card, 
  Button, 
  Modal, 
  Form,
  Row,
  Col,
  Typography,
  message
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

// Import components
import GoalForm from './component/GoalForm';
import GoalCards from './component/GoalCards';
import GoalDetails from './component/GoalDetails';
import ContributionForm from './component/ContributionForm';
import GoalStatusTabs from './component/GoalStatusTabs';

const { Title } = Typography;

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
      message.error('Failed to delete goal');
    }
  };
    const handleContributionSubmit = async () => {
    try {
      const values = await contributionForm.validateFields();
      
      // Make sure amount is a number and properly formatted
      const amount = typeof values.amount === 'string' 
        ? parseFloat(values.amount.replace(/[^\d.-]/g, '')) 
        : values.amount;
        
      const contributionData = {
        amount,
        date: values.date.format('YYYY-MM-DD'),
        notes: values.notes
      };
      
      await dispatch(addContribution({ id: selectedGoalId, contributionData })).unwrap();
      message.success('Contribution added successfully');
      setContributionModalVisible(false);
      
      // Refresh the goal details
      if (detailModalVisible) {
        dispatch(fetchGoal(selectedGoalId));
      }
        contributionForm.resetFields();
    } catch (error) {
      console.error('Contribution error:', error);
      // Display appropriate error message
      if (typeof error === 'string') {
        message.error(error);
      } else if (error.message) {
        message.error(error.message);
      } else {
        message.error('Failed to add contribution. Please check your input and try again.');
      }
    }
  };
  
  const handleDeleteContribution = async (contributionId) => {
    try {
      await dispatch(deleteContribution({ goalId: selectedGoalId, contributionId })).unwrap();
      message.success('Contribution deleted successfully');
      
      // Refresh the goal details
      dispatch(fetchGoal(selectedGoalId));
    } catch (error) {
      message.error('Failed to delete contribution');
    }
  };
  
  const handleTabChange = (key) => {
    setActiveTab(key);
  };
  
  // Filter goals based on selected tab
  const filteredGoals = goals?.filter(goal => {
    if (activeTab === 'all') {
      return true;
    }
    if (activeTab === 'in_progress') {
      return !goal.status || goal.status === 'in_progress';
    }
    return goal.status === activeTab;
  });

  return (
    <div className="goals-page">
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2}>Financial Goals</Title>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()}
            >
              New Goal
            </Button>
          </Col>
        </Row>
        
        <GoalStatusTabs 
          goals={goals} 
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        
        <GoalCards 
          goals={filteredGoals}
          onEditGoal={showModal}
          onDeleteGoal={handleDelete}
          onShowDetails={showDetailModal}
          onAddContribution={showContributionModal}
        />
      </Card>
      
      {/* Goal Form Modal */}
      <Modal
        title={editingGoalId ? "Edit Goal" : "Create New Goal"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <GoalForm
          form={form}
          categories={categories}
          onFinish={handleSubmit}
          onCancel={handleCancel}
        />
      </Modal>
      
      {/* Goal Detail Modal */}
      <Modal
        title="Goal Details"
        open={detailModalVisible}
        onCancel={handleDetailModalCancel}
        footer={[
          <Button key="close" onClick={handleDetailModalCancel}>
            Close
          </Button>
        ]}
        width={800}
      >
        <GoalDetails
          currentGoal={currentGoal}
          loading={loading}
          onDeleteContribution={handleDeleteContribution}
        />
      </Modal>
      
      {/* Contribution Form Modal */}
      <Modal
        title="Add Contribution"
        open={contributionModalVisible}
        onCancel={handleContributionModalCancel}
        footer={null}
      >
        <ContributionForm
          form={contributionForm}
          onFinish={handleContributionSubmit}
          onCancel={handleContributionModalCancel}
        />
      </Modal>
    </div>
  );
};

export default Goals;
