const pdf = require('pdf-parse');
const fs = require('fs');
const translationService = require('./translationService');

class PDFService {
  async extractTextFromPDF(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
      }

      const dataBuffer = fs.readFileSync(filePath);
      
      if (dataBuffer.length === 0) {
        throw new Error('PDF file is empty');
      }

      const data = await pdf(dataBuffer);
      
      if (!data.text || data.text.trim().length === 0) {
        throw new Error('No text content found in PDF');
      }

      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async processPDF(filePath) {
    try {
      console.log(`Starting PDF processing for: ${filePath}`);

      const extractedText = await this.extractTextFromPDF(filePath);
      console.log(`Extracted ${extractedText.length} characters from PDF`);

      const processedResult = await translationService.processDocument(extractedText);
      console.log(`Translation completed. Tamil segments found: ${processedResult.tamilSegmentsCount}`);

      return {
        success: true,
        ...processedResult,
        metadata: {
          fileSize: fs.statSync(filePath).size,
          extractedLength: extractedText.length,
          translatedLength: processedResult.translatedText.length,
          filePath: filePath
        }
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw error;
    }
  }
}

module.exports = new PDFService();