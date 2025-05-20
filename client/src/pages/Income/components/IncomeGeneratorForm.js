/**
 * Income Generator Form Component
 * 
 * Form for generating income predictions based on historical data
 */
import React from 'react';
import { Form, Input, Button, Select, InputNumber, Space, Divider, Row, Col, Alert } from 'antd';
import { RocketOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const IncomeGeneratorForm = ({ onSubmit, onCancel, sources = [], loading = false }) => {
  const [form] = Form.useForm();
  
  // Handle form submission
  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        onSubmit(values);
      });
  };
  
  return (
    <div className="income-generator-form">
      <Alert
        message="Generate Income Predictions"
        description="This will analyze your historical income data and create predictions for your future income. The more consistent income history you have, the more accurate the predictions will be."
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 20 }}
      />
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          months: 3,
          sources: []
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="months"
              label="Prediction Months"
              rules={[{ required: true, message: 'Please select how many months to predict' }]}
              extra="Number of future months to generate predictions for"
            >
              <Select>
                <Option value={1}>1 month</Option>
                <Option value={3}>3 months</Option>
                <Option value={6}>6 months</Option>
                <Option value={12}>12 months</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              name="sources"
              label="Income Sources"
              extra="Optional: Select specific income sources to predict (leave empty for all sources)"
            >
              <Select 
                mode="multiple" 
                placeholder="Select income sources"
                optionFilterProp="children"
                allowClear
              >
                {sources.map(source => (
                  <Option key={source.name} value={source.name}>
                    {source.name} (${source.totalAmount.toFixed(2)})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Divider />
        
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button 
              type="primary" 
              onClick={handleSubmit}
              loading={loading}
              icon={<RocketOutlined />}
            >
              Generate Predictions
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default IncomeGeneratorForm;
