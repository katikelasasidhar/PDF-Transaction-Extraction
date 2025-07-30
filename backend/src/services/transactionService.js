const { pool } = require('../models/database');

class TransactionService {
  async saveTransaction(transactionData) {
    const {
      userId,
      fileName,
      filePath,
      originalText,
      translatedText,
      extractedData
    } = transactionData;

    try {
      const query = `
        INSERT INTO transactions 
        (user_id, file_name, file_path, original_text, translated_text, transaction_data)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const values = [
        userId,
        fileName,
        filePath,
        originalText,
        translatedText,
        JSON.stringify(extractedData)
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database save error:', error);
      throw new Error('Failed to save transaction: ' + error.message);
    }
  }

  async getTransactions(userId, filters = {}) {
    try {
      let query = `
        SELECT 
          id,
          file_name,
          translated_text,
          transaction_data,
          processed_at,
          created_at
        FROM transactions 
        WHERE user_id = $1
      `;
      
      const values = [userId];
      let paramCount = 1;

      if (filters.startDate) {
        paramCount++;
        query += ` AND created_at >= $${paramCount}`;
        values.push(filters.startDate);
      }

      if (filters.endDate) {
        paramCount++;
        query += ` AND created_at <= $${paramCount}`;
        values.push(filters.endDate);
      }

      if (filters.search) {
        paramCount++;
        query += ` AND (file_name ILIKE $${paramCount} OR translated_text ILIKE $${paramCount})`;
        values.push(`%${filters.search}%`);
      }

      query += ` ORDER BY created_at DESC`;

      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        values.push(filters.limit);
      }

      if (filters.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(filters.offset);
      }

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Database fetch error:', error);
      throw new Error('Failed to fetch transactions: ' + error.message);
    }
  }

  async getTransactionById(transactionId, userId) {
    try {
      const query = `
        SELECT * FROM transactions 
        WHERE id = $1 AND user_id = $2
      `;
      
      const result = await pool.query(query, [transactionId, userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Database fetch error:', error);
      throw new Error('Failed to fetch transaction: ' + error.message);
    }
  }

  async deleteTransaction(transactionId, userId) {
    try {
      const query = `
        DELETE FROM transactions 
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;
      
      const result = await pool.query(query, [transactionId, userId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database delete error:', error);
      throw new Error('Failed to delete transaction: ' + error.message);
    }
  }
}

module.exports = new TransactionService();