import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Typography, 
  Upload, 
  Button, 
  Progress, 
  Alert, 
  Space, 
  Divider,
  List
} from 'antd';
import { 
  InboxOutlined, 
  FileTextOutlined, 
  UploadOutlined, 
  BankOutlined 
} from '@ant-design/icons';
import { importTransactions } from '../redux/slices/transactionSlice';

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

const UploadStatement = () => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const dispatch = useDispatch();
  const { error, loading } = useSelector(state => state.transactions);

  const validateFile = (file) => {
    // Clear previous errors
    setFileError('');
    
    // Validate file type (CSV only)
    if (file && file.type !== 'text/csv') {
      setFileError('Please upload a CSV file');
      return false;
    }
    
    // Validate file size (max 10MB)
    if (file && file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB');
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }
    
    if (!validateFile(file)) {
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Simulate upload progress
    setIsUploading(true);
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      // Dispatch import action
      await dispatch(importTransactions(formData));
      
      // Set progress to complete
      setUploadProgress(100);
      setTimeout(() => {
        setUploadProgress(0);
        setFile(null);
        setIsUploading(false);
      }, 1000);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const customRequest = ({ file, onSuccess }) => {
    // This prevents the default upload behavior
    // and allows us to handle the file manually
    setFile(file);
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.csv',
    customRequest,
    disabled: isUploading || loading,
    onRemove: () => {
      setFile(null);
      setFileError('');
    },
    beforeUpload: (file) => {
      const isValid = validateFile(file);
      if (!isValid) {
        return Upload.LIST_IGNORE;
      }
      setFile(file);
      return false;
    },
    fileList: file ? [file] : []
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Upload Bank Statement</Title>
      
      <Card>
        <Title level={4}>Import Transactions</Title>
        <Divider />
        
        {error && (
          <Alert
            message="Upload Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )}
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={5}>Instructions:</Title>
            <Paragraph>
              Upload a CSV file from your bank to import transactions automatically.
              The system will attempt to categorize your expenses.
            </Paragraph>
            <Paragraph>
              <strong>Supported Banks:</strong> Most major banks are supported, including
              Chase, Bank of America, Wells Fargo, and many more.
            </Paragraph>
            <Paragraph>
              <strong>Important:</strong> Make sure your CSV file includes transaction date,
              description, and amount columns.
            </Paragraph>
          </div>
          
          <Dragger {...uploadProps} style={{ padding: '20px' }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag CSV file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single CSV file upload. Strictly prohibit from uploading company data or other
              band files.
            </p>
          </Dragger>
          
          {fileError && (
            <Alert message={fileError} type="error" showIcon />
          )}
          
          {uploadProgress > 0 && (
            <Progress 
              percent={uploadProgress} 
              status={uploadProgress < 100 ? "active" : "success"} 
            />
          )}
          
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={handleUpload}
            disabled={!file || isUploading || loading}
            loading={isUploading || loading}
            size="large"
            block
          >
            {isUploading || loading ? 'Uploading...' : 'Upload and Process'}
          </Button>
          
          <Divider />
          
          <div>
            <Title level={5}>Tips for Better Categorization:</Title>
            <List
              itemLayout="horizontal"
              dataSource={[
                'Use the most detailed export option from your bank',
                'Include transaction descriptions if available',
                'After import, review categories and make adjustments if needed'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={item}
                  />
                </List.Item>
              )}
            />
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default UploadStatement;
