import React from 'react';
import { 
  Upload, 
  Progress, 
  Alert, 
  Button, 
  Typography, 
  Space 
} from 'antd';
import { 
  InboxOutlined, 
  UploadOutlined 
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Dragger } = Upload;

const FileUploader = ({ 
  file, 
  fileError, 
  uploadProgress, 
  isUploading, 
  onFileChange,
  onUpload
}) => {
  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      onFileChange(file);
      return false; // Prevent automatic upload
    },
    onDrop: (e) => {
      const file = e.dataTransfer.files[0];
      onFileChange(file);
    }
  };

  return (
    <div className="file-uploader">
      <Space direction="vertical" style={{ width: '100%' }}>
        {fileError && (
          <Alert 
            message="Upload Error" 
            description={fileError} 
            type="error" 
            showIcon 
          />
        )}
        
        <Dragger 
          {...uploadProps}
          disabled={isUploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag CSV file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single CSV file upload from your bank or financial institution.
          </p>
        </Dragger>
        
        {file && (
          <div className="file-info">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Selected File:</Text>
              <Paragraph>
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </Paragraph>
              
              {isUploading && (
                <Progress 
                  percent={uploadProgress} 
                  status={uploadProgress < 100 ? "active" : "success"} 
                />
              )}
              
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={onUpload}
                loading={isUploading}
                disabled={!file || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload and Process'}
              </Button>
            </Space>
          </div>
        )}
      </Space>
    </div>
  );
};

export default FileUploader;
