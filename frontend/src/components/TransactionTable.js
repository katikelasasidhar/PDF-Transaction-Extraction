import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TransactionTable.css';

const TransactionTable = ({ transactions: initialTransactions, loading, filters }) => {
  const [transactions, setTransactions] = useState(initialTransactions || []);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (initialTransactions) {
      setTransactions(initialTransactions);
    }
  }, [initialTransactions]);

  useEffect(() => {
    if (Object.keys(filters).length > 0) {
      searchTransactions();
    }
    // eslint-disable-next-line
  }, [filters]);

  const searchTransactions = async () => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/api/transactions?${params}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatValue = (value) => {
    if (!value) return 'N/A';
    return `₹${parseInt(value).toLocaleString()}`;
  };

  if (loading || searchLoading) {
    return (
      <div className="table-container">
        <div className="loading">Processing transactions...</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <h3>Transaction Results ({transactions.length} records)</h3>
      
      {transactions.length === 0 ? (
        <div className="no-data">
          No transactions found. Upload a PDF to get started.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Document No.</th>
                <th>Buyer</th>
                <th>Seller</th>
                <th>House No.</th>
                <th>Survey No.</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={transaction.id || index}>
                  <td>{formatDate(transaction.transaction_date || transaction.date)}</td>
                  <td>{transaction.document_no || transaction.documentNo || 'N/A'}</td>
                  <td>{transaction.buyer || 'N/A'}</td>
                  <td>{transaction.seller || 'N/A'}</td>
                  <td>{transaction.house_no || transaction.houseNo || 'N/A'}</td>
                  <td>{transaction.survey_no || transaction.surveyNo || 'N/A'}</td>
                  <td>{formatValue(transaction.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;