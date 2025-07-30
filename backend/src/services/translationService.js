const translate = require('google-translate-api');

class TranslationService {
  constructor() {
    this.tamilUnicodeRange = [0x0B80, 0x0BFF];
  }

  containsTamil(text) {
    if (!text) return false;
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.codePointAt(i);
      if (charCode >= this.tamilUnicodeRange[0] && charCode <= this.tamilUnicodeRange[1]) {
        return true;
      }
    }
    return false;
  }

  segmentText(text) {
    const lines = text.split('\n');
    const segments = [];

    for (const line of lines) {
      if (line.trim()) {
        segments.push({
          text: line.trim(),
          isTamil: this.containsTamil(line),
          original: line.trim()
        });
      }
    }

    return segments;
  }

  async translateTamilToEnglish(text) {
    try {
      if (!this.containsTamil(text)) {
        return text;
      }

      console.log(`Translating Tamil text: ${text.substring(0, 50)}...`);

      const result = await translate(text, { 
        from: 'ta', 
        to: 'en'
      });

      console.log(`Translation result: ${result.text.substring(0, 50)}...`);
      return result.text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  async processDocument(fullText) {
    try {
      console.log('Starting document processing...');
      const segments = this.segmentText(fullText);
      console.log(`Found ${segments.length} segments, ${segments.filter(s => s.isTamil).length} contain Tamil`);
      
      const translatedSegments = [];

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        console.log(`Processing segment ${i + 1}/${segments.length}`);
        
        if (segment.isTamil) {
          const translated = await this.translateTamilToEnglish(segment.text);
          translatedSegments.push({
            ...segment,
            translated: translated
          });
          
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          translatedSegments.push({
            ...segment,
            translated: segment.text
          });
        }
      }

      const fullTranslatedText = translatedSegments
        .map(seg => seg.translated)
        .join('\n');

      console.log('Document processing completed');

      return {
        originalText: fullText,
        translatedText: fullTranslatedText,
        segments: translatedSegments,
        tamilSegmentsCount: segments.filter(s => s.isTamil).length
      };
    } catch (error) {
      console.error('Document processing error:', error);
      throw new Error('Failed to process document: ' + error.message);
    }
  }
}

module.exports = new TranslationService();