const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfService = require('../services/pdfService');
const transactionService = require('../services/transactionService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

class UploadController {
  async uploadPDF(req, res) {
    try {
        
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      const filePath = req.file.path;
      const { buyerName, sellerName, houseNumber, surveyNumber, documentNumber } = req.body;

      // Extract transactions from PDF
      console.log('Extracting transactions from PDF...');
      const transactions = await pdfService.extractTransactions(filePath);

      // Filter transactions based on query parameters
      const filteredTransactions = this.filterTransactions(transactions, {
        buyerName,
        sellerName,
        houseNumber,
        surveyNumber,
        documentNumber
      });

      // Save transactions to database
      console.log('Saving transactions to database...');
      const savedTransactions = await transactionService.saveTransactions(
        filteredTransactions,
        req.file.filename
      );

      // Clean up uploaded file (optional)
      // fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: `Successfully processed ${savedTransactions.length} transactions`,
        transactions: savedTransactions,
        pdfPath: `/uploads/${req.file.filename}`
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        error: 'Failed to process PDF',
        message: error.message
      });
    }
  }

  filterTransactions(transactions, filters) {
    return transactions.filter(transaction => {
      if (filters.buyerName && transaction.buyer && 
          !transaction.buyer.toLowerCase().includes(filters.buyerName.toLowerCase())) {
        return false;
      }
      
      if (filters.sellerName && transaction.seller && 
          !transaction.seller.toLowerCase().includes(filters.sellerName.toLowerCase())) {
        return false;
      }
      
      if (filters.houseNumber && transaction.houseNo && 
          transaction.houseNo !== filters.houseNumber) {
        return false;
      }
      
      if (filters.surveyNumber && transaction.surveyNo && 
          transaction.surveyNo !== filters.surveyNumber) {
        return false;
      }
      
      if (filters.documentNumber && transaction.documentNo && 
          transaction.documentNo !== filters.documentNumber) {
        return false;
      }
      
      return true;
    });
  }
}

const uploadController = new UploadController();

module.exports = {
  upload: upload.single('pdf'),
  uploadPDF: uploadController.uploadPDF.bind(uploadController)
};