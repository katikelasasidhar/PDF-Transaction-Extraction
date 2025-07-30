const express = require('express');
const { upload, uploadPDF } = require('../controllers/uploadController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', authMiddleware, upload, uploadPDF);

module.exports = router;