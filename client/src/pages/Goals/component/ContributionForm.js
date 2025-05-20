import React from 'react';
import { 
  Form, 
  Input, 
  DatePicker, 
  InputNumber,
  Button, 
  Row, 
  Col 
} from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ContributionForm = ({ form, onFinish, onCancel }) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
    >
      <Row gutter={16}>
        <Col span={12}>          <Form.Item
            name="amount"
            label="Contribution Amount"
            rules={[
              { required: true, message: 'Please enter an amount' },
              { 
                type: 'number',
                min: 0.01, 
                message: 'Amount must be greater than zero' 
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="0.00"
              min={0.01}
              step={0.01}
              precision={2}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select a date' }]}
          >            <DatePicker 
              style={{ width: '100%' }}
              disabledDate={(current) => current && current > dayjs().endOf('day')}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="notes"
        label="Notes"
      >
        <TextArea 
          placeholder="Add any notes about this contribution..."
          autoSize={{ minRows: 3, maxRows: 5 }}
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
              Add Contribution
            </Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  );
};

export default ContributionForm;
