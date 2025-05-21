import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Progress, 
  Button, 
  Statistic,
  Table,
  Divider,
  Popconfirm,
  Space, 
  Tag,
  Empty
} from 'antd';
import { 
  DeleteOutlined,
  DollarOutlined,
  CalendarOutlined,  BankOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const GoalDetails = ({ 
  currentGoal, 
  loading, 
  onDeleteContribution 
}) => {
  // Contribution columns for the table
  const contributionColumns = [    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('MMM D, YYYY')
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${parseFloat(amount).toLocaleString()}`
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Delete this contribution?"
          onConfirm={() => onDeleteContribution(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            danger
            icon={<DeleteOutlined />}
            size="small" 
            type="text"
          >
            Delete
          </Button>
        </Popconfirm>
      )
    }
  ];
  
  if (!currentGoal) {
    return <Empty description="Select a goal to view details" />;
  }
  
  // Calculate progress
  const progressPercent = Math.min(
    Math.round((currentGoal.currentAmount / currentGoal.targetAmount) * 100), 
    100
  );
  
  // Calculate remaining amount
  const remaining = Math.max(currentGoal.targetAmount - currentGoal.currentAmount, 0);
  
  // Time calculations
  let daysRemaining = null;
  let isOverdue = false;
  
  if (currentGoal.targetDate) {
    const targetDate = dayjs(currentGoal.targetDate);
    const today = dayjs();
    daysRemaining = targetDate.diff(today, 'days');
    isOverdue = daysRemaining < 0;
  }
  
  // Sort contributions by date (newest first)
  const sortedContributions = currentGoal.contributions 
    ? [...currentGoal.contributions].sort((a, b) => 
        dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
      )
    : [];
  
  return (
    <div className="goal-details">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card loading={loading}>
            <Title level={4}>{currentGoal.name}</Title>
            {currentGoal.description && (
              <Paragraph>{currentGoal.description}</Paragraph>
            )}
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={24} md={12}>
                <Progress 
                  type="dashboard" 
                  percent={progressPercent}
                  strokeColor={progressPercent === 100 ? '#52c41a' : '#1890ff'}
                  width={150}
                />
                <div style={{ marginTop: 16 }}>
                  <Space direction="vertical">
                    <Statistic 
                      title="Current Amount" 
                      value={currentGoal.currentAmount} 
                      precision={2} 
                      prefix="$" 
                      valueStyle={{ color: '#1890ff' }}
                    />
                    <Statistic 
                      title="Remaining" 
                      value={remaining} 
                      precision={2} 
                      prefix="$" 
                      valueStyle={{ color: remaining > 0 ? '#faad14' : '#52c41a' }}
                    />
                  </Space>
                </div>
              </Col>
              
              <Col span={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card size="small">
                    <Statistic 
                      title="Target Amount" 
                      value={currentGoal.targetAmount} 
                      precision={2} 
                      prefix="$" 
                    />
                  </Card>
                  
                  {currentGoal.targetDate && (
                    <Card size="small">                      <Statistic 
                        title="Target Date" 
                        value={dayjs(currentGoal.targetDate).format('MMM D, YYYY')}
                        prefix={<CalendarOutlined />}
                        valueStyle={{ color: isOverdue ? '#f5222d' : 'inherit' }}
                      />
                      {daysRemaining !== null && (
                        <Text type={isOverdue ? 'danger' : 'secondary'}>
                          {isOverdue 
                            ? `Overdue by ${Math.abs(daysRemaining)} days` 
                            : `${daysRemaining} days remaining`}
                        </Text>
                      )}
                    </Card>
                  )}
                  
                  <Card size="small">
                    <Statistic 
                      title="Type" 
                      value={
                        currentGoal.type?.charAt(0).toUpperCase() + 
                        currentGoal.type?.slice(1)
                      }
                      prefix={<BankOutlined />}
                    />
                  </Card>
                  
                  {currentGoal.priority && (
                    <Card size="small">
                      <Space>
                        <Text>Priority:</Text>
                        <Tag 
                          color={
                            currentGoal.priority === 'high' ? 'red' : 
                            currentGoal.priority === 'medium' ? 'orange' : 'blue'
                          }
                        >
                          {currentGoal.priority?.charAt(0).toUpperCase() + 
                           currentGoal.priority?.slice(1)}
                        </Tag>
                      </Space>
                    </Card>
                  )}
                  
                  {currentGoal.notes && (
                    <Card size="small" title="Notes">
                      <Paragraph>{currentGoal.notes}</Paragraph>
                    </Card>
                  )}
                </Space>
              </Col>
            </Row>
            
            <Divider orientation="left">Contributions</Divider>
            
            <Table 
              dataSource={sortedContributions}
              columns={contributionColumns}
              rowKey="id"
              pagination={sortedContributions.length > 10 ? { pageSize: 10 } : false}
              size="small"
              loading={loading}
              locale={{ emptyText: 'No contributions yet' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GoalDetails;
