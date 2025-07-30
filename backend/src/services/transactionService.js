const pool = require('../models/database');

class TransactionService {
  async saveTransactions(transactions, pdfFilename) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const savedTransactions = [];
      
      for (const transaction of transactions) {
        const query = `
          INSERT INTO transactions (
            serial_no, buyer, seller, house_no, survey_no, document_no, 
            transaction_date, value, market_value, property_extent, 
            property_type, village, nature, pdf_filename, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
          RETURNING *
        `;
        
        const values = [
          transaction.serialNo || null,
          transaction.buyer || null,
          transaction.seller || null,
          transaction.houseNo || null,
          transaction.surveyNo || null,
          transaction.documentNo || null,
          this.parseDate(transaction.date),
          transaction.value ? parseInt(transaction.value) : null,
          transaction.marketValue ? parseInt(transaction.marketValue) : null,
          transaction.propertyExtent || null,
          transaction.propertyType || null,
          transaction.village || null,
          transaction.nature || null,
          pdfFilename
        ];
        
        const result = await client.query(query, values);
        savedTransactions.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      console.log(`Saved ${savedTransactions.length} transactions to database`);
      return savedTransactions;
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error saving transactions:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  parseDate(dateString) {
    if (!dateString) return null;
    
    try {
      // Handle DD-MMM-YYYY format (e.g., "06-Feb-2013")
      const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      
      const match = dateString.match(/(\d{2})-([A-Za-z]{3})-(\d{4})/);
      if (match) {
        const [, day, monthName, year] = match;
        const month = months[monthName];
        if (month) {
          return new Date(`${year}-${month}-${day}`);
        }
      }
      
      // Fallback to regular date parsing
      return new Date(dateString);
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return null;
    }
  }

  async getTransactions(filters = {}) {
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.buyerName) {
      query += ` AND buyer ILIKE $${paramCount}`;
      values.push(`%${filters.buyerName}%`);
      paramCount++;
    }

    if (filters.sellerName) {
      query += ` AND seller ILIKE $${paramCount}`;
      values.push(`%${filters.sellerName}%`);
      paramCount++;
    }

    if (filters.houseNumber) {
      query += ` AND house_no ILIKE $${paramCount}`;
      values.push(`%${filters.houseNumber}%`);
      paramCount++;
    }

    if (filters.surveyNumber) {
      query += ` AND survey_no ILIKE $${paramCount}`;
      values.push(`%${filters.surveyNumber}%`);
      paramCount++;
    }

    if (filters.documentNumber) {
      query += ` AND document_no ILIKE $${paramCount}`;
      values.push(`%${filters.documentNumber}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = new TransactionService();