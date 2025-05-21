import React from 'react';
import { 
  Form, 
  Input, 
  Select,   DatePicker, 
  InputNumber,
  Button, 
  Row, 
  Col
} from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const GoalForm = ({ form, categories, onFinish, onCancel }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name="name"
            label="Goal Name"
            rules={[{ required: true, message: 'Please enter a goal name' }]}
          >
            <Input placeholder="What are you saving for?" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="type"
            label="Goal Type"
            rules={[{ required: true, message: 'Please select a goal type' }]}
          >
            <Select>
              <Option value="saving">Saving</Option>
              <Option value="debt">Debt Repayment</Option>
              <Option value="investment">Investment</Option>
              <Option value="expense">Major Expense</Option>
              <Option value="other">Other</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="targetAmount"
            label="Target Amount"
            rules={[{ required: true, message: 'Please enter a target amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="0.00"
              min={0}
              step={1}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="currentAmount"
            label="Current Amount"
            rules={[{ required: true, message: 'Please enter current amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="0.00"
              min={0}
              step={1}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="targetDate"
            label="Target Date"          >
            <DatePicker 
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Please select a priority' }]}
          >
            <Select>
              <Option value="low">Low</Option>
              <Option value="medium">Medium</Option>
              <Option value="high">High</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="categoryId"
        label="Category"
      >
        <Select placeholder="Select a category">
          <Option value={null}>None</Option>
          {categories?.map(category => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
      >
        <TextArea 
          placeholder="Describe your goal..."
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Form.Item>

      <Form.Item
        name="notes"
        label="Notes"
      >
        <TextArea 
          placeholder="Additional notes..."
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>

      <Form.Item>
        <Row justify="end" gutter={8}>
          <Col>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Col>
          <Col>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default GoalForm;
