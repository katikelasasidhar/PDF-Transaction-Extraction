const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfService = require('../services/pdfService');
const transactionService = require('../services/transactionService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

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

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload and process PDF
router.post('/', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const userId = req.user.id;

    console.log(`Processing PDF: ${fileName} for user: ${userId}`);

    // Process the PDF
    const processedResult = await pdfService.processPDF(filePath);

    // Save to database
    const savedTransaction = await transactionService.saveTransaction({
      userId,
      fileName,
      filePath,
      originalText: processedResult.originalText,
      translatedText: processedResult.translatedText,
      extractedData: {
        segments: processedResult.segments,
        tamilSegmentsCount: processedResult.tamilSegmentsCount,
        metadata: processedResult.metadata
      }
    });

    res.json({
      success: true,
      message: 'PDF processed successfully',
      data: {
        transactionId: savedTransaction.id,
        fileName: fileName,
        originalText: processedResult.originalText,
        translatedText: processedResult.translatedText,
        tamilSegmentsFound: processedResult.tamilSegmentsCount,
        processedAt: savedTransaction.processed_at
      }
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    
    // Clean up uploaded file if processing failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process PDF',
      error: error.message
    });
  }
});

// Get uploaded PDF file
router.get('/pdf/:filename', authenticateToken, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      res.sendFile(path.resolve(filePath));
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('File retrieval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file'
    });
  }
});

module.exports = router;