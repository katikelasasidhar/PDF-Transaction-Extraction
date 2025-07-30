import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import UploadForm from '../components/UploadForm';
import TransactionTable from '../components/TransactionTable';
import PDFPreview from '../components/PDFPreview';
import SearchFilters from '../components/SearchFilters';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [currentPdfPath, setCurrentPdfPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const handleUploadSuccess = (data) => {
    setTransactions(data.transactions);
    setCurrentPdfPath(data.pdfPath);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>PDF Transaction Extractor</h1>
        <div className="user-info">
          <span>Welcome, {user.username}</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="upload-section">
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        </div>

        <div className="search-section">
          <SearchFilters onFilterChange={handleFilterChange} />
        </div>

        <div className="content-section">
          <div className="results-panel">
            <TransactionTable 
              transactions={transactions} 
              loading={loading}
              filters={filters}
            />
          </div>
          
          {currentPdfPath && (
            <div className="preview-panel">
              <PDFPreview pdfPath={currentPdfPath} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;