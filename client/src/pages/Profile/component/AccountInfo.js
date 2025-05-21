import React from 'react';
import {
  Card,
  Descriptions,
  Badge,
  Tag,
  Space,
  Typography
} from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const AccountInfo = ({ user }) => {
  if (!user) {
    return null;
  }
  
  return (
    <Card>
      <Descriptions title="Account Information" bordered>
        <Descriptions.Item label="Account Type" span={3}>
          <Space>
            {user.isPremium ? (
              <>
                <Badge status="success" />
                <Tag color="gold">
                  <Space>
                    <CrownOutlined />
                    Premium
                  </Space>
                </Tag>
              </>
            ) : (
              <>
                <Badge status="default" />
                <Tag>Free</Tag>
              </>
            )}
          </Space>
        </Descriptions.Item>        <Descriptions.Item label="Member Since" span={3}>
          {user.createdAt ? dayjs(user.createdAt).format('MMMM D, YYYY') : 'N/A'}
        </Descriptions.Item>

        <Descriptions.Item label="Last Login" span={3}>
          {user.lastLogin ? dayjs(user.lastLogin).format('MMMM D, YYYY [at] h:mm A') : 'N/A'}
        </Descriptions.Item>

        <Descriptions.Item label="Account Status" span={3}>
          <Badge status="processing" text="Active" />
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default AccountInfo;
