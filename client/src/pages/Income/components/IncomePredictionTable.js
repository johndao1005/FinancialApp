/**
 * Income Prediction Table Component
 * 
 * Displays a table of income predictions for future months
 * with options to update predictions with actual values
 */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Table, 
  Tag, 
  Button, 
  Space, 
  Tooltip, 
  Modal, 
  Form, 
  InputNumber,
  Typography
} from 'antd';
import { 
  CheckOutlined, 
  EditOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';
import { updatePredictionActuals } from '../../../redux/slices/incomePredictionSlice';

const { Title, Text } = Typography;

const IncomePredictionTable = ({ predictions = [], loading = false }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState(null);
  
  // Format date display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };
  
  // Get confidence tag color
  const getConfidenceColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'processing';
    if (score >= 40) return 'warning';
    return 'error';
  };
  
  // Show accuracy tag
  const renderAccuracyTag = (record) => {
    if (record.actualAmount === null) return null;
    
    const accuracy = record.accuracyPercentage;
    let color = 'default';
    
    if (accuracy >= 90) color = 'success';
    else if (accuracy >= 70) color = 'processing';
    else if (accuracy >= 50) color = 'warning';
    else color = 'error';
    
    return (
      <Tag color={color}>
        Accuracy: {accuracy.toFixed(1)}%
      </Tag>
    );
  };
  
  // Open edit modal
  const handleEdit = (record) => {
    setCurrentPrediction(record);
    setEditModalVisible(true);
    
    form.setFieldsValue({
      actualAmount: record.actualAmount || record.predictedAmount
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        dispatch(updatePredictionActuals({
          predictionId: currentPrediction.id,
          actualAmount: values.actualAmount
        }));
        
        setEditModalVisible(false);
      });
  };
  
  // Table columns
  const columns = [
    {
      title: 'Month',
      dataIndex: 'predictionForDate',
      key: 'predictionForDate',
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.predictionForDate) - new Date(b.predictionForDate)
    },
    {
      title: 'Income Source',
      dataIndex: 'incomeSource',
      key: 'incomeSource'
    },
    {
      title: 'Predicted Amount',
      dataIndex: 'predictedAmount',
      key: 'predictedAmount',
      render: (amount) => `$${parseFloat(amount).toFixed(2)}`
    },
    {
      title: 'Actual Amount',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      render: (amount) => amount ? `$${parseFloat(amount).toFixed(2)}` : '-'
    },
    {
      title: 'Confidence',
      dataIndex: 'confidenceScore',
      key: 'confidenceScore',
      render: (score) => (
        <Tag color={getConfidenceColor(score)}>
          {score}%
        </Tag>
      )
    },
    {
      title: 'Method',
      dataIndex: 'predictionMethod',
      key: 'predictionMethod',
      render: (method) => {
        let displayText = method;
        let title = '';
        
        if (method === 'average') {
          displayText = 'Average';
          title = 'Prediction based on average of past income';
        } else if (method === 'linearRegression') {
          displayText = 'Trend-based';
          title = 'Prediction based on linear regression of past income trend';
        }
        
        return (
          <Tooltip title={title}>
            <span>{displayText}</span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const isPast = new Date(record.predictionForDate) < new Date();
        const hasActual = record.actualAmount !== null;
        
        if (hasActual) {
          return renderAccuracyTag(record);
        }
        
        return (
          <Tag color={isPast ? 'warning' : 'processing'}>
            {isPast ? 'Awaiting actual' : 'Future prediction'}
          </Tag>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isPast = new Date(record.predictionForDate) < new Date();
        
        if (!isPast) {
          return (
            <Tooltip title="Future prediction cannot be updated yet">
              <Button type="link" disabled>
                <EditOutlined /> Update
              </Button>
            </Tooltip>
          );
        }
        
        return (
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            icon={<EditOutlined />}
          >
            Update actual
          </Button>
        );
      }
    }
  ];
  
  // Group predictions by month for display
  const groupedPredictions = {};
  predictions.forEach(prediction => {
    const month = formatDate(prediction.predictionForDate);
    if (!groupedPredictions[month]) {
      groupedPredictions[month] = [];
    }
    groupedPredictions[month].push(prediction);
  });
  
  return (
    <>
      <Table
        dataSource={predictions}
        columns={columns}
        rowKey="id"
        loading={loading}
        expandable={{
          expandedRowRender: record => (
            <div style={{ margin: 0, padding: '10px 0' }}>
              <p><strong>Notes:</strong> {record.notes || 'No notes available'}</p>
              <p><strong>Data points used:</strong> {record.historicalDataPoints} month(s)</p>
              {record.actualRecordedDate && (
                <p>
                  <strong>Actual recorded on:</strong> {' '}
                  {new Date(record.actualRecordedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50']
        }}
      />
      
      <Modal
        title="Update with Actual Income"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleSubmit}
        okText="Save"
      >
        {currentPrediction && (
          <>
            <div style={{ marginBottom: 20 }}>
              <Title level={5}>{formatDate(currentPrediction.predictionForDate)}</Title>
              <Text>Source: {currentPrediction.incomeSource}</Text>
              <br />
              <Text>Predicted: ${parseFloat(currentPrediction.predictedAmount).toFixed(2)}</Text>
            </div>
            
            <Form form={form} layout="vertical">
              <Form.Item
                label="Actual Amount"
                name="actualAmount"
                rules={[{ required: true, message: 'Please enter the actual amount' }]}
                extra="Enter the actual income amount received for this period"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  precision={2}
                  prefix="$"
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
};

export default IncomePredictionTable;
