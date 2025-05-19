import React from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Space
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  DollarOutlined
} from '@ant-design/icons';

const { Option } = Select;

const ProfileForm = ({ 
  initialValues, 
  loading, 
  onFinish, 
  onCancel 
}) => {
  return (
    <Form
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Your name" 
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Your email" 
              disabled 
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="currency"
            label="Preferred Currency"
            rules={[{ required: true, message: 'Please select your currency' }]}
          >
            <Select 
              prefix={<DollarOutlined />}
              placeholder="Select currency"
            >
              <Option value="USD">USD ($)</Option>
              <Option value="EUR">EUR (€)</Option>
              <Option value="GBP">GBP (£)</Option>
              <Option value="JPY">JPY (¥)</Option>
              <Option value="CAD">CAD (C$)</Option>
              <Option value="AUD">AUD (A$)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="language"
            label="Language"
            rules={[{ required: true, message: 'Please select your language' }]}
          >
            <Select placeholder="Select language">
              <Option value="en">English</Option>
              <Option value="es">Spanish</Option>
              <Option value="fr">French</Option>
              <Option value="de">German</Option>
              <Option value="zh">Chinese</Option>
              <Option value="ja">Japanese</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Row justify="end">
          <Space>
            <Button onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
            </Button>
          </Space>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default ProfileForm;
