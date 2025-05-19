import React from 'react';
import { Card, Table, Tag } from 'antd';

/**
 * RecentTransactionsTable Component
 * 
 * Displays a table of recent transactions
 */
const RecentTransactionsTable = ({ transactions }) => {
  // Columns for the recent transactions table
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => (
        <span style={{ color: record.isExpense ? '#f5222d' : '#52c41a' }}>
          {record.isExpense ? '-' : '+'} ${text}
        </span>
      )
    }
  ];

  return (
    <Card title="Recent Transactions">
      <Table 
        dataSource={transactions} 
        columns={columns} 
        pagination={false}
        rowKey="id"
      />
    </Card>
  );
};

export default RecentTransactionsTable;
