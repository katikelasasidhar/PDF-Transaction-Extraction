const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const transactionService = require('../services/transactionService');

const router = express.Router();

// Get all transactions for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      search: req.query.search,
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const transactions = await transactionService.getTransactions(userId, filters);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get specific transaction
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user.id;

    const transaction = await transactionService.getTransactionById(transactionId, userId);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user.id;

    const deleted = await transactionService.deleteTransaction(transactionId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;