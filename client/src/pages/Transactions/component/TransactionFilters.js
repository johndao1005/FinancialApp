import React from 'react';
import { 
  Form, 
  DatePicker, 
  Select, 
  Button, 
  Space,
  Row,
  Col,
  Card,
  Typography
} from 'antd';
import { 
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionFilters = ({ 
  form,
  categories,
  onFilterChange,
  onReset
}) => {
  return (
    <Card className="filter-card">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={5}>Filter Transactions</Title>
        </Col>
      </Row>
      
      <Form
        form={form}
        layout="horizontal"
        onFinish={onFilterChange}
      >
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={10}>
            <Form.Item name="dateRange" label="Date Range">
              <RangePicker 
                style={{ width: '100%' }} 
                placeholder={['Start Date', 'End Date']}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={16} md={8} lg={8}>
            <Form.Item name="category" label="Category">
              <Select placeholder="Select category" allowClear>
                <Option value="">All Categories</Option>
                {categories?.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={8} md={4} lg={6}>
            <Form.Item label=" " colon={false}>
              <Space>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  htmlType="submit"
                >
                  Filter
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={onReset}
                >
                  Reset
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default TransactionFilters;
