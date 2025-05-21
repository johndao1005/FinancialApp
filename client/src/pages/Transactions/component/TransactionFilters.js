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
  Typography,
  Divider,
  Tooltip,
  Dropdown
} from 'antd';
import { 
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  TagsOutlined,
  ThunderboltOutlined,
  DownOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionFilters = ({ 
  form,
  categories,
  onFilterChange,
  onReset,
  onApplyRules,
  onGenerateRules,
  applyingRules,
  generatingRules
}) => {
  // Rule generation menu items
  const ruleItems = [
    {
      key: 'merchants',
      label: 'Merchant Name Patterns',
    },
    {
      key: 'amounts',
      label: 'Recurring Amount Patterns',
    },
    {
      key: 'both',
      label: 'Both Patterns',
    },
  ];

  return (
    <Card className="filter-card">
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={5}>Filter Transactions</Title>
        </Col>
        
        <Col>
          <Space>
            <Tooltip title="Apply category rules to all transactions">
              <Button
                icon={<TagsOutlined />}
                loading={applyingRules}
                onClick={onApplyRules}
                className="apply-rules-btn"
              >
                Apply Rules
              </Button>
            </Tooltip>
            
            <Dropdown
              menu={{
                items: ruleItems,
                onClick: ({ key }) => onGenerateRules(key)
              }}
            >
              <Button 
                icon={<ThunderboltOutlined />}
                loading={generatingRules}
              >
                Auto-Generate Rules <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>
      
      <Form
        form={form}
        layout="horizontal"
        onFinish={onFilterChange}
      >
        <Row gutter={16}>
          <Col xs={24} sm={24} md={12} lg={10}>
            <Form.Item name="dateRange" label="Date Range">              <RangePicker 
                style={{ width: '100%' }} 
                placeholder={['Start Date', 'End Date']}
                inputReadOnly={true}
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
