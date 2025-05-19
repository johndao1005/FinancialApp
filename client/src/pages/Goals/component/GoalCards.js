import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Progress, 
  Button, 
  Space,
  Tag,
  Popconfirm 
} from 'antd';
import { 
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

const { Title, Text } = Typography;

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

const GoalCards = ({ 
  goals, 
  onEditGoal, 
  onDeleteGoal, 
  onShowDetails, 
  onAddContribution 
}) => {
  return (
    <Row gutter={[16, 16]}>
      {goals?.length > 0 ? (
        goals.map(goal => {
          // Calculate progress percentage
          let progressPercent = Math.min(
            Math.round((goal.currentAmount / goal.targetAmount) * 100), 
            100
          );
          
          // Determine status color
          let statusColor = 'blue';
          if (progressPercent === 100) {
            statusColor = 'green';
          } else if (goal.targetDate && moment(goal.targetDate).isBefore(moment())) {
            statusColor = 'red';
          }

          return (
            <Col xs={24} sm={12} md={8} lg={8} xl={6} key={goal.id}>
              <Card
                hoverable
                className="goal-card"
                title={
                  <Space>
                    {goalTypeIcons[goal.type] || <TrophyOutlined />}
                    <Text ellipsis style={{ maxWidth: 150 }}>
                      {goal.name}
                    </Text>
                  </Space>
                }
                extra={
                  <Tag color={priorityColors[goal.priority] || 'blue'}>
                    {goal.priority?.charAt(0).toUpperCase() + goal.priority?.slice(1)}
                  </Tag>
                }
                actions={[
                  <Button 
                    type="text" 
                    key="contribute" 
                    icon={<DollarOutlined />} 
                    onClick={() => onAddContribution(goal.id)}
                  />,
                  <Button 
                    type="text" 
                    key="edit" 
                    icon={<EditOutlined />} 
                    onClick={() => onEditGoal(goal)}
                  />,
                  <Popconfirm
                    title="Are you sure you want to delete this goal?"
                    onConfirm={() => onDeleteGoal(goal.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" key="delete" icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
                onClick={() => onShowDetails(goal.id)}
              >
                <div className="goal-card-content">
                  <Row align="middle" gutter={16}>
                    <Col span={24}>
                      <Progress 
                        percent={progressPercent} 
                        strokeColor={statusColor}
                        format={percent => `${percent}%`}
                      />
                    </Col>
                  </Row>
                  
                  <Row style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Text type="secondary">
                        <DollarOutlined /> Target
                      </Text>
                      <div>
                        <Text strong>
                          ${goal.targetAmount?.toLocaleString()}
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">
                        <DollarOutlined /> Current
                      </Text>
                      <div>
                        <Text strong>
                          ${goal.currentAmount?.toLocaleString()}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                  
                  {goal.targetDate && (
                    <Row style={{ marginTop: 12 }}>
                      <Col span={24}>
                        <Text type="secondary">
                          <ClockCircleOutlined /> Target Date
                        </Text>
                        <div>
                          <Text 
                            strong
                            type={moment(goal.targetDate).isBefore(moment()) ? 'danger' : ''}
                          >
                            {moment(goal.targetDate).format('MMM D, YYYY')}
                          </Text>
                        </div>
                      </Col>
                    </Row>
                  )}
                  
                  {goal.status && (
                    <Row style={{ marginTop: 12 }}>
                      <Col span={24}>
                        <Tag 
                          color={statusColors[goal.status]} 
                          icon={goal.status === 'completed' ? <CheckCircleOutlined /> : <FlagOutlined />}
                        >
                          {goal.status.replace('_', ' ').charAt(0).toUpperCase() + goal.status.replace('_', ' ').slice(1)}
                        </Tag>
                      </Col>
                    </Row>
                  )}
                </div>
              </Card>
            </Col>
          );
        })
      ) : (
        <Col span={24}>
          <Card>
            <Text>No goals found. Create a new goal to get started.</Text>
          </Card>
        </Col>
      )}
    </Row>
  );
};

export default GoalCards;
