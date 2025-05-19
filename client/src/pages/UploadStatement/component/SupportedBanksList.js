import React from 'react';
import { List, Card, Typography, Space } from 'antd';
import { 
  BankOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;

const SupportedBanksList = () => {
  // List of supported banks and financial institutions
  const supportedBanks = [
    {
      name: 'Chase Bank',
      fileFormat: 'CSV with date, description, amount columns',
      instructions: 'Export from Chase Online Banking > Activity > Download transactions as CSV'
    },
    {
      name: 'Bank of America',
      fileFormat: 'CSV with transaction date, description, amount columns',
      instructions: 'Export from Accounts > Activity > Download > Select CSV format'
    },
    {
      name: 'Wells Fargo',
      fileFormat: 'CSV with date, description, amount columns',
      instructions: 'Export from Account Activity > Download to Spreadsheet > CSV format'
    },
    {
      name: 'Citibank',
      fileFormat: 'CSV with date, description, debit, credit columns',
      instructions: 'Export from Accounts > Recent Transactions > Download as CSV'
    },
    {
      name: 'Capital One',
      fileFormat: 'CSV with transaction date, posted date, description, amount columns',
      instructions: 'Export from Transactions > Download > CSV format'
    }
  ];

  return (
    <Card title={<Title level={5}>Supported Banks and File Formats</Title>}>
      <List
        itemLayout="horizontal"
        dataSource={supportedBanks}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              avatar={<BankOutlined style={{ fontSize: '24px' }} />}
              title={item.name}
              description={
                <Space direction="vertical">
                  <Text strong><FileTextOutlined /> File Format:</Text>
                  <Text>{item.fileFormat}</Text>
                  <Text strong>Instructions:</Text>
                  <Text>{item.instructions}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default SupportedBanksList;
