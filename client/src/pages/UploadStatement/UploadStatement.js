import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Card, 
  Typography, 
  Space, 
  Divider,
  Row,
  Col,
  Alert
} from 'antd';
import { importTransactions } from '../../redux/slices/transactionSlice';

// Import components
import FileUploader from './component/FileUploader';
import SupportedBanksList from './component/SupportedBanksList';

const { Title, Paragraph } = Typography;

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

  const handleFileChange = (file) => {
    if (validateFile(file)) {
      setFile(file);
    } else {
      setFile(null);
    }
  };

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 300);
  };

  const handleUpload = async () => {
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    simulateProgress();

    const formData = new FormData();
    formData.append('statement', file);

    try {
      await dispatch(importTransactions(formData)).unwrap();
      setUploadProgress(100);
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (err) {
      setFileError(err.message || 'Failed to upload file');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-statement-page">
      <Row gutter={[0, 16]}>
        <Col span={24}>
          <Card>
            <Title level={2}>Upload Bank Statement</Title>
            <Paragraph>
              Upload your bank or credit card statement to automatically import transactions.
              We support CSV files from most major banks and financial institutions.
            </Paragraph>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>Upload Your Statement</Title>
              <Paragraph>
                Upload a CSV file exported from your bank. The file should contain
                transaction dates, descriptions, and amounts.
              </Paragraph>
              
              {error && (
                <Alert 
                  message="Import Error" 
                  description={error} 
                  type="error" 
                  showIcon 
                />
              )}
              
              <FileUploader
                file={file}
                fileError={fileError}
                uploadProgress={uploadProgress}
                isUploading={isUploading || loading}
                onFileChange={handleFileChange}
                onUpload={handleUpload}
              />
            </Space>
            
            <Divider />
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>Tips for Successful Import</Title>
              <ul>
                <li>Ensure your CSV file contains headers</li>
                <li>Check that transaction amounts use consistent formatting</li>
                <li>For credit card statements, expenses may appear as positive values</li>
                <li>Some banks require you to select "CSV" format when exporting</li>
                <li>Remove any summary rows or non-transaction data</li>
              </ul>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <SupportedBanksList />
        </Col>
      </Row>
    </div>
  );
};

export default UploadStatement;
