import React, { useState } from 'react';
import '../styles/SearchFilters.css';

const SearchFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    buyerName: '',
    sellerName: '',
    houseNumber: '',
    surveyNumber: '',
    documentNumber: ''
  });

  const handleInputChange = (e) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      buyerName: '',
      sellerName: '',
      houseNumber: '',
      surveyNumber: '',
      documentNumber: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="search-filters">
      <h3>Search Transactions</h3>
      
      <div className="filters-grid">
        <div className="filter-item">
          <label htmlFor="search-buyer">Buyer Name</label>
          <input
            type="text"
            id="search-buyer"
            name="buyerName"
            value={filters.buyerName}
            onChange={handleInputChange}
            placeholder="Search by buyer name"
          />
        </div>

        <div className="filter-item">
          <label htmlFor="search-seller">Seller Name</label>
          <input
            type="text"
            id="search-seller"
            name="sellerName"
            value={filters.sellerName}
            onChange={handleInputChange}
            placeholder="Search by seller name"
          />
        </div>

        <div className="filter-item">
          <label htmlFor="search-house">House Number</label>
          <input
            type="text"
            id="search-house"
            name="houseNumber"
            value={filters.houseNumber}
            onChange={handleInputChange}
            placeholder="Search by house number"
          />
        </div>

        <div className="filter-item">
          <label htmlFor="search-survey">Survey Number</label>
          <input
            type="text"
            id="search-survey"
            name="surveyNumber"
            value={filters.surveyNumber}
            onChange={handleInputChange}
            placeholder="Search by survey number"
          />
        </div>

        <div className="filter-item">
          <label htmlFor="search-document">Document Number</label>
          <input
            type="text"
            id="search-document"
            name="documentNumber"
            value={filters.documentNumber}
            onChange={handleInputChange}
            placeholder="Search by document number"
          />
        </div>

        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-button">
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;