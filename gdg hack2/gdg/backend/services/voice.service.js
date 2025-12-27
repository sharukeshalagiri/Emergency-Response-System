class VoiceService {
  constructor() {
    this.languageMap = {
      'en-US': 'English (US)',
      'hi-IN': 'Hindi (India)',
      'ta-IN': 'Tamil (India)',
      'te-IN': 'Telugu (India)',
      'bn-IN': 'Bengali (India)',
      'ml-IN': 'Malayalam (India)',
      'kn-IN': 'Kannada (India)'
    };

    this.sampleTranscripts = {
      'en-US': [
        'I am having chest pain and difficulty breathing',
        'There is a fire in the building, need immediate help',
        'Someone is attacking people on the street, send police',
        'Car accident with injuries, need ambulance',
        'Person fell from height, unconscious, need medical help'
      ],
      'hi-IN': [
        'मुझे सीने में दर्द हो रहा है और सांस लेने में तकलीफ हो रही है',
        'इमारत में आग लगी है, तत्काल मदद की जरूरत है',
        'कोई सड़क पर लोगों पर हमला कर रहा है, पुलिस भेजें',
        'कार दुर्घटना में चोट लगी है, एम्बुलेंस की जरूरत है',
        'व्यक्ति ऊंचाई से गिर गया, बेहोश है, चिकित्सा सहायता की आवश्यकता है'
      ],
      'ta-IN': [
        'எனக்கு மார்பு வலி மற்றும் சுவாசிப்பதில் சிரமம் ஏற்படுகிறது',
        'கட்டிடத்தில் தீ பிடித்துள்ளது, உடனடி உதவி தேவை',
        'யாரோ தெருவில் மக்களை தாக்குகிறார்கள், போலீசை அனுப்புங்கள்',
        'கார் விபத்தில் காயங்கள் ஏற்பட்டுள்ளன, ஆம்புலன்ஸ் தேவை',
        'நபர் உயரத்தில் இருந்து விழுந்தார், உணர்விழந்தார், மருத்துவ உதவி தேவை'
      ]
    };
  }

  // Process voice input (simulated)
  async processVoiceInput(audioData, language = 'en-US') {
    // In production, this would call a speech-to-text API
    // For demo, return a sample transcript
    
    const samples = this.sampleTranscripts[language] || 
                   this.sampleTranscripts['en-US'];
    
    const randomIndex = Math.floor(Math.random() * samples.length);
    const transcript = samples[randomIndex];

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      transcript,
      language: this.languageMap[language] || 'English',
      confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
      duration: audioData?.length || 2000,
      timestamp: new Date().toISOString()
    };
  }

  // Get supported languages
  getSupportedLanguages() {
    return Object.entries(this.languageMap).map(([code, name]) => ({
      code,
      name,
      flag: this.getFlagEmoji(code)
    }));
  }

  // Get flag emoji for language
  getFlagEmoji(languageCode) {
    const countryCode = languageCode.split('-')[1];
    const flagMap = {
      'US': '🇺🇸',
      'IN': '🇮🇳',
      'GB': '🇬🇧',
      'CA': '🇨🇦',
      'AU': '🇦🇺'
    };
    return flagMap[countryCode] || '🏳️';
  }

  // Validate language code
  isValidLanguage(languageCode) {
    return this.languageMap.hasOwnProperty(languageCode);
  }

  // Translate text (simulated)
  async translateText(text, targetLanguage) {
    // In production, use translation API
    const translations = {
      'hi-IN': `${text} (Translated to Hindi)`,
      'ta-IN': `${text} (Translated to Tamil)`,
      'te-IN': `${text} (Translated to Telugu)`
    };

    return {
      original: text,
      translated: translations[targetLanguage] || text,
      targetLanguage,
      confidence: 0.9
    };
  }
}

module.exports = new VoiceService();