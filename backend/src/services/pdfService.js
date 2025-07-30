const fs = require('fs');
const pdf = require('pdf-parse');
const translationService = require('./translationService');

class PDFService {
  async extractTransactions(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      
      console.log('PDF text extracted, length:', pdfData.text.length);
      
      // Extract text content
      const text = pdfData.text;
      
      // Parse transactions from Tamil text
      const transactions = await this.parseTransactions(text);
      console.log('Parsed transactions:', transactions.length);
      
      // Translate to English
      const translatedTransactions = await this.translateTransactions(transactions);
      console.log('Translated transactions:', translatedTransactions.length);
      
      return translatedTransactions;
    } catch (error) {
      console.error('Error extracting transactions:', error);
      throw new Error('Failed to extract transactions from PDF');
    }
  }

  async parseTransactions(text) {
    const transactions = [];
    
    // Split by transaction entries (each starts with a number followed by date)
    const transactionBlocks = text.split(/(?=^\d+\s+\d{2}-[A-Za-z]{3}-\d{4})/gm);
    
    console.log('Found transaction blocks:', transactionBlocks.length);
    
    for (let i = 1; i < transactionBlocks.length; i++) { // Skip first block (header)
      const block = transactionBlocks[i].trim();
      if (block.length < 50) continue; // Skip very short blocks
      
      try {
        const transaction = this.parseTransactionBlock(block);
        if (transaction && Object.keys(transaction).length > 3) {
          transactions.push(transaction);
        }
      } catch (error) {
        console.error('Error parsing transaction block:', error.message);
      }
    }
    
    return transactions;
  }

  parseTransactionBlock(block) {
    const transaction = {};
    
    // Extract serial number (first number)
    const serialMatch = block.match(/^(\d+)/);
    if (serialMatch) {
      transaction.serialNo = serialMatch[1];
    }
    
    // Extract date (DD-MMM-YYYY format)
    const dateMatch = block.match(/(\d{2}-[A-Za-z]{3}-\d{4})/);
    if (dateMatch) {
      transaction.date = dateMatch[1];
    }
    
    // Extract document number and year
    const docMatch = block.match(/(\d+\/\d{4})/);
    if (docMatch) {
      transaction.documentNo = docMatch[1];
    }
    
    // Extract consideration value (கைமாற்றுத் தொகை)
    const valueMatch = block.match(/ரூ\.\s*([\d,]+)\/\-/);
    if (valueMatch) {
      transaction.value = valueMatch[1].replace(/,/g, '');
    }
    
    // Extract market value (சந்தை மதிப்பு)
    const marketValueMatch = block.match(/Market Value[^:]*:\s*ரூ\.\s*([\d,]+)\/\-/);
    if (marketValueMatch) {
      transaction.marketValue = marketValueMatch[1].replace(/,/g, '');
    }
    
    // Extract property extent (சொத்தின் விஸ்தீர்ணம்)
    const extentMatch = block.match(/Property Extent[^:]*:\s*([^\n]+)/);
    if (extentMatch) {
      transaction.propertyExtent = extentMatch[1].trim();
    }
    
    // Extract survey number (புல எண்)
    const surveyMatch = block.match(/Survey No[^:]*:\s*([^\n]+)/);
    if (surveyMatch) {
      transaction.surveyNo = surveyMatch[1].trim();
    }
    
    // Extract plot number (மனை எண்)
    const plotMatch = block.match(/Plot No[^:]*:\s*([^\n]+)/);
    if (plotMatch) {
      transaction.houseNo = plotMatch[1].trim();
    }
    
    // Extract village (கிராமம்)
    const villageMatch = block.match(/Village[^:]*:\s*([^,\n]+)/);
    if (villageMatch) {
      transaction.village = villageMatch[1].trim();
    }
    
    // Extract executant (seller) - Name of Executant(s)
    const executantMatch = block.match(/Name of Executant\(s\)[^:]*:\s*([^\n]+)/);
    if (executantMatch) {
      transaction.seller = this.cleanName(executantMatch[1]);
    }
    
    // Extract claimant (buyer) - Name of Claimant(s)
    const claimantMatch = block.match(/Name of Claimant\(s\)[^:]*:\s*([^\n]+)/);
    if (claimantMatch) {
      transaction.buyer = this.cleanName(claimantMatch[1]);
    }
    
    // Extract nature of transaction
    const natureMatch = block.match(/Nature[^:]*:\s*([^\n]+)/);
    if (natureMatch) {
      transaction.nature = natureMatch[1].trim();
    }
    
    // Extract property type
    const propertyTypeMatch = block.match(/Property Type[^:]*:\s*([^\n]+)/);
    if (propertyTypeMatch) {
      transaction.propertyType = propertyTypeMatch[1].trim();
    }
    
    return transaction;
  }
  
  cleanName(name) {
    if (!name) return null;
    
    // Remove common prefixes and clean up
    return name
      .replace(/^\d+\.\s*/, '') // Remove numbering
      .replace(/\(.*?\)/g, '') // Remove parentheses content
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  async translateTransactions(transactions) {
    const translatedTransactions = [];
    
    for (const transaction of transactions) {
      const translated = { ...transaction };
      
      // Translate Tamil text fields to English
      if (transaction.buyer && this.containsTamil(transaction.buyer)) {
        try {
          translated.buyer = await translationService.translateText(transaction.buyer);
        } catch (error) {
          console.error('Translation error for buyer:', error.message);
          translated.buyer = await translationService.translateWithDictionary(transaction.buyer);
        }
      }
      
      if (transaction.seller && this.containsTamil(transaction.seller)) {
        try {
          translated.seller = await translationService.translateText(transaction.seller);
        } catch (error) {
          console.error('Translation error for seller:', error.message);
          translated.seller = await translationService.translateWithDictionary(transaction.seller);
        }
      }
      
      translatedTransactions.push(translated);
    }
    
    return translatedTransactions;
  }

  containsTamil(text) {
    // Check if text contains Tamil characters
    const tamilRegex = /[\u0B80-\u0BFF]/;
    return tamilRegex.test(text);
  }
}

module.exports = new PDFService();