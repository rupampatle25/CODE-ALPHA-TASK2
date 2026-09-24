export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechLocale: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechLocale: 'en-US',
    flag: '🇬🇧',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechLocale: 'hi-IN',
    flag: '🇮🇳',
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechLocale: 'mr-IN',
    flag: '🇮🇳',
  },
};

export const UI_TRANSLATIONS: Record<SupportedLanguage, {
  welcomeMessage: string;
  inputPlaceholder: string;
  listeningPlaceholder: string;
  listeningBanner: string;
  doneSpeaking: string;
  approvedSource: string;
  unmatchedQuery: string;
  helpful: string;
  notHelpful: string;
  feedbackRecorded: string;
  relatedFaqs: string;
  suggestedHeader: string;
  fallbackMessage: string;
  suggestedQuestions: string[];
}> = {
  en: {
    welcomeMessage: 'Hello! How can I help you today? Ask about pricing, refunds, or API integration.',
    inputPlaceholder: 'Ask a question about pricing, support...',
    listeningPlaceholder: 'Listening to your voice...',
    listeningBanner: 'Listening... Speak your question now',
    doneSpeaking: 'Done Speaking',
    approvedSource: 'Approved Source',
    unmatchedQuery: 'Unmatched Query',
    helpful: 'Helpful?',
    notHelpful: 'Not helpful',
    feedbackRecorded: 'Feedback recorded',
    relatedFaqs: 'Related Questions:',
    suggestedHeader: 'Suggested Questions:',
    fallbackMessage: "I couldn't find a reliable answer in this business's knowledge base. Please contact the business directly or try asking your question another way.",
    suggestedQuestions: [
      'What pricing plans do you offer?',
      'What is your refund policy?',
      'How do I embed the chatbot widget?',
      'What are the API rate limits?',
    ],
  },
  hi: {
    welcomeMessage: 'नमस्ते! मैं आज आपकी क्या सहायता कर सकता हूँ? मूल्य निर्धारण, रिफंड या तकनीकी सहायता के बारे में पूछें।',
    inputPlaceholder: 'मूल्य निर्धारण, सहायता आदि के बारे में प्रश्न पूछें...',
    listeningPlaceholder: 'आपकी आवाज सुनी जा रही है...',
    listeningBanner: 'सुना जा रहा है... अब अपना प्रश्न बोलें',
    doneSpeaking: 'बोलना समाप्त',
    approvedSource: 'सत्यापित स्रोत',
    unmatchedQuery: 'अज्ञात प्रश्न',
    helpful: 'क्या यह उपयोगी था?',
    notHelpful: 'उपयोगी नहीं था',
    feedbackRecorded: 'प्रतिक्रिया दर्ज की गई',
    relatedFaqs: 'संबंधित प्रश्न:',
    suggestedHeader: 'सुझाए गए प्रश्न:',
    fallbackMessage: 'मुझे इस व्यवसाय के ज्ञानकोष में कोई विश्वसनीय उत्तर नहीं मिला। कृपया सीधे व्यवसाय से संपर्क करें या अपना प्रश्न किसी अन्य तरीके से पूछें।',
    suggestedQuestions: [
      'आप क्या मूल्य निर्धारण योजनाएं प्रदान करते हैं?',
      'आपकी रिफंड और रद्दीकरण नीति क्या है?',
      'मैं चैटबॉट विजेट को अपनी वेबसाइट में कैसे जोड़ूं?',
      'एपीआई अनुरोधों की दर सीमाएं क्या हैं?',
    ],
  },
  mr: {
    welcomeMessage: 'नमस्कार! मी आज तुम्हाला कशी मदत करू शकतो? किंमत योजना, परतावा किंवा तांत्रिक समर्थनाबद्दल विचारा.',
    inputPlaceholder: 'किंमत, समर्थन याबद्दल प्रश्न विचारा...',
    listeningPlaceholder: 'तुमचा आवाज ऐकला जात आहे...',
    listeningBanner: 'ऐकणे सुरू आहे... आता तुमचा प्रश्न बोला',
    doneSpeaking: 'बोलणे पूर्ण झाले',
    approvedSource: 'मान्यताप्राप्त स्त्रोत',
    unmatchedQuery: 'अपरिचित प्रश्न',
    helpful: 'हे उपयुक्त होते का?',
    notHelpful: 'उपयुक्त नाही',
    feedbackRecorded: 'अभिप्राय नोंदवला गेला',
    relatedFaqs: 'संबंधित प्रश्न:',
    suggestedHeader: 'सुचवलेले प्रश्न:',
    fallbackMessage: 'मला या व्यवसायाच्या माहिती संकलनात विश्वासार्ह उत्तर सापडले नाही. कृपया थेट व्यवसायाशी संपर्क साधा किंवा आपला प्रश्न वेगळ्या पद्धतीने विचारा.',
    suggestedQuestions: [
      'तुम्ही कोणत्या सबस्क्रिप्शन किंमत योजना ऑफर करता?',
      'तुमचे रिफंड आणि रद्द करण्याचे धोरण काय आहे?',
      'मी चॅटबॉट विजेट माझ्या वेबसाइटमध्ये कसे जोडू?',
      'एपीआय विनंत्यांची मर्यादा काय आहे?',
    ],
  },
};
