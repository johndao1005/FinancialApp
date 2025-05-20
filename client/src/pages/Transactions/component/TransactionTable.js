import React from 'react';
import { 
  Table, 
  Tag, 
  Space, 
  Button, 
  Popconfirm 
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const TransactionTable = ({ 
  transactions, 
  loading, 
  totalPages, 
  currentPage,
  onPageChange,
  onEdit,
  onDelete
}) => {
  const columns = [
    {      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: date => dayjs(date).format('MMM D, YYYY')
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          {record.isRecurring && (
            <Tag color="blue">Recurring</Tag>
          )}
        </div>
      )
    },    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',      render: (category, record) => (
        <Tag 
          color="blue" 
          style={{ cursor: 'pointer' }}
          onClick={() => onEdit(record, 'category')}
          className="transaction-category"
        >
          {category?.name || 'Uncategorized'}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a, b) => a.amount - b.amount,
      render: (amount, record) => {
        // Format and color the amount based on transaction type
        const isExpense = amount < 0;
        const formattedAmount = `$${Math.abs(amount).toFixed(2)}`;
        return (
          <span style={{ color: isExpense ? '#f5222d' : '#52c41a' }}>
            {isExpense ? '-' : '+'}{formattedAmount}
          </span>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this transaction?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={transactions} 
      rowKey="id"
      loading={loading}
      pagination={{
        current: currentPage,
        total: totalPages * 10, // Assuming pageSize is 10
        onChange: onPageChange,
        showSizeChanger: false
      }}
    />
  );
};

export default TransactionTable;
