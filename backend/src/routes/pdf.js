const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { extractTransactionsFromPDF } = require('../pdfService');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const transactions = await extractTransactionsFromPDF(pdfBuffer);
    // Optionally, save transactions to DB here
    res.json({ transactions, pdfFileName: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

module.exports = router;