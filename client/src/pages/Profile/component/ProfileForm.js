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
import { CURRENCIES, LANGUAGES } from '../../../constants';

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
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Your first name" 
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Your last name" 
            />
          </Form.Item>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={24}>
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
              {CURRENCIES.map(currency => (
                <Option key={currency.value} value={currency.value}>
                  {currency.label}
                </Option>
              ))}
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
              {LANGUAGES.map(language => (
                <Option key={language.value} value={language.value}>
                  {language.label}
                </Option>
              ))}
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
