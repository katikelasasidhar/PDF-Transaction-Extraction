const axios = require('axios');

class TranslationService {
  constructor() {
    // Using Google Translate API (you can also use other services)
    this.apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    this.baseUrl = 'https://translation.googleapis.com/language/translate/v2';
  }

  async translateText(text, targetLang = 'en', sourceLang = 'ta') {
    try {
      if (!this.apiKey) {
        console.warn('Translation API key not provided, using dictionary fallback');
        return this.translateWithDictionary(text);
      }

      const response = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, {
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      });

      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error.message);
      // Return original text if translation fails
      return this.translateWithDictionary(text);
    }
  }

  // Enhanced dictionary translation for Tamil names and terms
  async translateWithDictionary(text) {
    const dictionary = {
      // Common Tamil prefixes and titles
      'ஏ..': 'A.',
      'வி..': 'V.',
      'கு..': 'K.',
      'பா..': 'P.',
      'ஜி..': 'G.',
      'எம்..': 'M.',
      'பெ..': 'P.',
      'எஸ்..': 'S.',
      'கா..': 'K.',
      'டி..': 'D.',
      'வீ..': 'V.',
      'சி..': 'C.',
      'து..': 'T.',
      
      // Common terms
      'செல்வமுத்துகுமாரசாமி': 'Selvamuthukumarasamy',
      'கோபாலசுந்தரம்': 'Gopalasundaram',
      'அருணகிரி': 'Arunagiri',
      'நித்யா': 'Nithya',
      'சசிகலா': 'Sasikala',
      'ஆனந்த்': 'Anand',
      'ஏழுமலை': 'Ezhumalai',
      'வேல்முருகன்': 'Velmurugan',
      'அல்லி': 'Alli',
      'சண்முகம்': 'Shanmugam',
      'கருணாகரன்': 'Karunakaran',
      'சேதுராமன்': 'Sethuraman',
      'சுவாமிநாதன்': 'Swaminathan',
      'சித்ரா': 'Chitra',
      'ரவி': 'Ravi',
      'நாராயணன்': 'Narayanan',
      'இளங்கோவன்': 'Ilangovan',
      'சுமித்ரா': 'Sumitra',
      'சாரங்கம்': 'Sarangam',
      'வீரமணி': 'Veeramani',
      'பாலகணபதி': 'Balaganapathi',
      'பாலகுரு': 'Balakuru',
      'முருகதாஸ்': 'Murugadas',
      'ஜனார்த்தனன்': 'Janardanan',
      'விக்னேஷ்வர்': 'Vigneshwar',
      'மாதேஷ்': 'Mahesh',
      'கஸ்தூரி': 'Kasturi',
      'சிவாச்சரன்': 'Sivacharan',
      'பிரேம்': 'Prem',
      'ரூப்ஜான்': 'Roopjan',
      'செந்தில்குமார்': 'Senthilkumar',
      'கலியன்': 'Kaliyan',
      'வள்ளி': 'Valli',
      'முகமதுரஃபி': 'Muhammadurafi',
      'ராஜேஷ்': 'Rajesh',
      'ஆறுமுகம்': 'Arumugam',
      
      // Place names
      'திருவெண்ணைநல்லூர்': 'Thiruvennainallur',
      'Thiruvennainallur': 'Thiruvennainallur',
      
      // Common terms
      'விற்பனையாளர்': 'Seller',
      'வாங்குபவர்': 'Buyer',
      'ஆவணம் எண்': 'Document No',
      'சர்வே எண்': 'Survey No',
      'வீட்டு எண்': 'House No',
      'தேதி': 'Date',
      'மதிப்பு': 'Value',
      'கிரையம்': 'Sale',
      'மனை': 'Plot',
      'சதுரமீட்டர்': 'Square Meter',
      'சதுரடி': 'Square Feet'
    };

    let translatedText = text;
    
    // Apply dictionary translations
    for (const [tamil, english] of Object.entries(dictionary)) {
      const regex = new RegExp(tamil, 'g');
      translatedText = translatedText.replace(regex, english);
    }

    return translatedText;
  }
}

module.exports = new TranslationService();