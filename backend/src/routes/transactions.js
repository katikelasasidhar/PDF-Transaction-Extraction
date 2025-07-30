const express = require('express');
const transactionService = require('../services/transactionService');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const filters = {
      buyerName: req.query.buyerName,
      sellerName: req.query.sellerName,
      houseNumber: req.query.houseNumber,
      surveyNumber: req.query.surveyNumber,
      documentNumber: req.query.documentNumber
    };

    const transactions = await transactionService.getTransactions(filters);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;