import React from 'react';
import {
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  Switch,
  Button,
  Row,
  Col,
  Divider
} from 'antd';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const TransactionEditForm = ({
  transaction,
  categories,
  onChange,
  onCancel,
  onSubmit
}) => {
  // Only show the form if there's a transaction to edit
  if (!transaction) return null;

  return (
    <Form
      layout="vertical"
      initialValues={{
        ...transaction,
        date: transaction.date ? moment(transaction.date) : moment(),
        recurringEndDate: transaction.recurringEndDate ? moment(transaction.recurringEndDate) : null
      }}
      onValuesChange={onChange}
      onFinish={onSubmit}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <Input placeholder="Transaction description" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter an amount' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="0.00"
              step={0.01}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
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
        </Col>
      </Row>

      <Form.Item name="notes" label="Notes">
        <TextArea
          placeholder="Additional notes about this transaction"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
      </Form.Item>

      <Form.Item
        name="isRecurring"
        label="Recurring Transaction"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>

      {transaction.isRecurring && (
        <>
          <Divider orientation="left">Recurring Details</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="recurringFrequency"
                label="Frequency"
                rules={[
                  { 
                    required: transaction.isRecurring, 
                    message: 'Please select a frequency' 
                  }
                ]}
              >
                <Select placeholder="Select frequency">
                  <Option value="weekly">Weekly</Option>
                  <Option value="biweekly">Bi-weekly</Option>
                  <Option value="monthly">Monthly</Option>
                  <Option value="quarterly">Quarterly</Option>
                  <Option value="yearly">Yearly</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recurringEndDate"
                label="End Date (Optional)"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < moment().endOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

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
    </Form>
  );
};

export default TransactionEditForm;
