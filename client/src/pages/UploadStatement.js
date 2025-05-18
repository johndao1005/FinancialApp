import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importTransactions } from '../redux/slices/transactionSlice';

const UploadStatement = () => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const dispatch = useDispatch();
  const { error, loading } = useSelector(state => state.transactions);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Clear previous errors
    setFileError('');
    
    // Validate file type (CSV only)
    if (selectedFile && selectedFile.type !== 'text/csv') {
      setFileError('Please upload a CSV file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB');
      return;
    }
    
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a file to upload');
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

  return (
    <div className="upload-page">
      <h1>Upload Bank Statement</h1>
      
      <div className="card">
        <div className="card-header">
          <h3>Import Transactions</h3>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <div className="upload-instructions">
          <h4>Instructions:</h4>
          <p>
            Upload a CSV file from your bank to import transactions automatically.
            The system will attempt to categorize your expenses.
          </p>
          <p>
            <strong>Supported Banks:</strong> Most major banks are supported, including
            Chase, Bank of America, Wells Fargo, and many more.
          </p>
          <p>
            <strong>Important:</strong> Make sure your CSV file includes transaction date,
            description, and amount columns.
          </p>
        </div>
        
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label className="form-label">Choose CSV File</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv"
              className="form-control"
              disabled={isUploading || loading}
            />
            {fileError && (
              <div className="text-danger">{fileError}</div>
            )}
            {file && (
              <div className="file-info">
                <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
          
          {uploadProgress > 0 && (
            <div className="progress-container">
              <div 
                className="progress-bar"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="btn"
            disabled={!file || isUploading || loading}
          >
            {isUploading || loading ? 'Uploading...' : 'Upload and Process'}
          </button>
        </form>
        
        <div className="upload-tips">
          <h4>Tips for Better Categorization:</h4>
          <ul>
            <li>Use the most detailed export option from your bank</li>
            <li>Include transaction descriptions if available</li>
            <li>After import, review categories and make adjustments if needed</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadStatement;
