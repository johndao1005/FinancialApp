import React from 'react';
import { Tabs, Badge } from 'antd';
import { 
  FlagOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const GoalStatusTabs = ({ 
  goals, 
  activeTab, 
  onTabChange 
}) => {
  // Filter goals by status
  const inProgressGoals = goals?.filter(goal => 
    !goal.status || goal.status === 'in_progress'
  ) || [];
  
  const completedGoals = goals?.filter(goal => 
    goal.status === 'completed'
  ) || [];
  
  const abandonedGoals = goals?.filter(goal => 
    goal.status === 'abandoned'
  ) || [];
  
  return (
    <Tabs 
      activeKey={activeTab} 
      onChange={onTabChange}
      type="card"
      className="goal-status-tabs"
    >
      <TabPane 
        tab={
          <span>
            <FlagOutlined />
            All Goals
            <Badge 
              count={goals?.length || 0} 
              style={{ 
                marginLeft: 8,
                backgroundColor: '#1890ff'
              }} 
              overflowCount={99}
            />
          </span>
        } 
        key="all"
      />
      
      <TabPane 
        tab={
          <span>
            <ClockCircleOutlined />
            In Progress
            <Badge 
              count={inProgressGoals.length} 
              style={{ 
                marginLeft: 8,
                backgroundColor: '#faad14'
              }} 
              overflowCount={99}
            />
          </span>
        }
        key="in_progress"
      />
      
      <TabPane 
        tab={
          <span>
            <CheckCircleOutlined />
            Completed
            <Badge 
              count={completedGoals.length} 
              style={{ 
                marginLeft: 8,
                backgroundColor: '#52c41a'
              }} 
              overflowCount={99}
            />
          </span>
        }
        key="completed"
      />
      
      <TabPane 
        tab={
          <span>
            Abandoned
            <Badge 
              count={abandonedGoals.length} 
              style={{ 
                marginLeft: 8,
              }} 
              overflowCount={99}
            />
          </span>
        }
        key="abandoned"
      />
    </Tabs>
  );
};

export default GoalStatusTabs;
