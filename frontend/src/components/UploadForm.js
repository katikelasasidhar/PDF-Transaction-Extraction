import React, { useState } from 'react';
import axios from 'axios';
import '../styles/UploadForm.css';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [filters, setFilters] = useState({
    buyerName: '',
    sellerName: '',
    houseNumber: '',
    surveyNumber: '',
    documentNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid PDF file');
      setFile(null);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('pdf', file);
    
    // Add filter parameters
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        formData.append(key, filters[key]);
      }
    });

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadSuccess(response.data);
      
      // Reset form
      setFile(null);
      setFilters({
        buyerName: '',
        sellerName: '',
        houseNumber: '',
        surveyNumber: '',
        documentNumber: ''
      });
      
      // Reset file input
      const fileInput = document.getElementById('pdf-file');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setError(error.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <h3>Upload Tamil PDF Document</h3>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-input-section">
          <label htmlFor="pdf-file" className="file-label">
            Select PDF File
          </label>
          <input
            type="file"
            id="pdf-file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input"
          />
          {file && <span className="file-name">{file.name}</span>}
        </div>

        <div className="filters-section">
          <h4>Optional Filters</h4>
          <div className="filter-grid">
            <div className="filter-group">
              <label htmlFor="buyerName">Buyer Name</label>
              <input
                type="text"
                id="buyerName"
                name="buyerName"
                value={filters.buyerName}
                onChange={handleFilterChange}
                placeholder="Filter by buyer name"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="sellerName">Seller Name</label>
              <input
                type="text"
                id="sellerName"
                name="sellerName"
                value={filters.sellerName}
                onChange={handleFilterChange}
                placeholder="Filter by seller name"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="houseNumber">House Number</label>
              <input
                type="text"
                id="houseNumber"
                name="houseNumber"
                value={filters.houseNumber}
                onChange={handleFilterChange}
                placeholder="Filter by house number"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="surveyNumber">Survey Number</label>
              <input
                type="text"
                id="surveyNumber"
                name="surveyNumber"
                value={filters.surveyNumber}
                onChange={handleFilterChange}
                placeholder="Filter by survey number"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="documentNumber">Document Number</label>
              <input
                type="text"
                id="documentNumber"
                name="documentNumber"
                value={filters.documentNumber}
                onChange={handleFilterChange}
                placeholder="Filter by document number"
              />
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          disabled={loading || !file}
          className="upload-button"
        >
          {loading ? 'Processing...' : 'Upload & Process PDF'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;