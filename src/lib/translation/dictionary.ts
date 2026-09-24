
export interface TranslationRecord {
  en: string;
  hi: string;
  mr: string;
}

// Translations for all Grounded FAQ Questions & Answers
export const FAQ_TRANSLATIONS: Record<string, { question: TranslationRecord; answer: TranslationRecord }> = {
  faq_1: {
    question: {
      en: 'What subscription pricing plans do you offer?',
      hi: 'आप क्या सदस्यता मूल्य निर्धारण योजनाएं प्रदान करते हैं?',
      mr: 'तुम्ही कोणत्या सबस्क्रिप्शन किंमत योजना ऑफर करता?',
    },
    answer: {
      en: 'We offer three subscription tiers: Free ($0/mo for up to 500 conversations), Starter ($29/mo for up to 5,000 conversations with custom branding), and Business ($99/mo for up to 25,000 conversations with priority support and team access).',
      hi: 'हम तीन सदस्यता स्तर प्रदान करते हैं: फ्री ($0/माह 500 बातचीत तक), स्टार्टर ($29/माह 5,000 बातचीत तक कस्टम ब्रांडिंग के साथ), और बिजनेस ($99/माह 25,000 बातचीत तक प्राथमिकता सहायता और टीम एक्सेस के साथ)।',
      mr: 'आम्ही तीन सबस्क्रिप्शन स्तर ऑफर करतो: विनामूल्य (५०० संभाषणांसाठी $०/महिना), स्टार्टर (कस्टम ब्रँडिंगसह ५,००० संभाषणांसाठी $२९/महिना), आणि व्यवसाय (प्राधान्य समर्थन आणि कार्यसंघ प्रवेशासह २५,००० संभाषणांसाठी $९९/महिना).',
    },
  },
  faq_2: {
    question: {
      en: 'What is your refund and cancellation policy?',
      hi: 'आपकी रिफंड और रद्दीकरण नीति क्या है?',
      mr: 'तुमचे परतावा आणि रद्द करण्याचे धोरण काय आहे?',
    },
    answer: {
      en: 'You can cancel your subscription at any time directly from the Settings page. We offer a full 14-day money-back guarantee on all paid plans if you are not satisfied with the service. Refunds are processed back to the original payment method within 5 to 7 business days.',
      hi: 'आप सेटिंग पृष्ठ से सीधे किसी भी समय अपनी सदस्यता रद्द कर सकते हैं। यदि आप सेवा से संतुष्ट नहीं हैं, तो हम सभी सशुल्क योजनाओं पर 14 दिनों की पूर्ण मनी-बैक गारंटी प्रदान करते हैं। रिफंड 5 से 7 कार्य दिवसों के भीतर मूल भुगतान विधि में वापस संसाधित किया जाता है।',
      mr: 'तुम्ही थेट सेटिंग्ज पृष्ठावरून कोणत्याही वेळी तुमची सदस्यता रद्द करू शकता. तुम्ही सेवेवर समाधानी नसल्यास आम्ही सर्व सशुल्क योजनांवर १४ दिवसांची मनी-बॅक हमी देतो. परतावा ५ ते ७ कामकाजाच्या दिवसांत मूळ पेमेंट पद्धतीवर जमा केला जातो.',
    },
  },
  faq_3: {
    question: {
      en: 'What are the API rate limits for requests?',
      hi: 'अनुरोधों के लिए एपीआई दर सीमाएं क्या हैं?',
      mr: 'विनंत्यांसाठी एपीआय दर मर्यादा काय आहेत?',
    },
    answer: {
      en: 'Standard API plans include a rate limit of 60 requests per minute and 5,000 requests per day. Business tier accounts can request custom rate limits up to 300 requests per minute by contacting our engineering support team.',
      hi: 'मानक एपीआई योजनाओं में प्रति मिनट 60 अनुरोध और प्रति दिन 5,000 अनुरोधों की दर सीमा शामिल है। बिजनेस स्तर के खाते हमारी इंजीनियरिंग सहायता टीम से संपर्क करके प्रति मिनट 300 अनुरोधों तक कस्टम दर सीमा का अनुरोध कर सकते हैं।',
      mr: 'मानक एपीआय योजनांमध्ये प्रति मिनिट ६० विनंत्या आणि दररोज ५,००० विनंत्यांची मर्यादा समाविष्ट आहे. व्यवसाय खाती आमच्या अभियांत्रिकी समर्थन कार्यसंघाशी संपर्क साधून प्रति मिनिट ३०० विनंत्यांपर्यंत कस्टम मर्यादा मागू शकतात.',
    },
  },
  faq_4: {
    question: {
      en: 'How do I reset my account password if I forgot it?',
      hi: 'यदि मैं अपना खाता पासवर्ड भूल गया हूँ तो उसे कैसे रीसेट करूँ?',
      mr: 'मी माझ्या खात्याचा पासवर्ड विसरल्यास तो कसा रीसेट करू?',
    },
    answer: {
      en: 'Click the "Forgot Password" link on the login screen, enter your registered email address, and we will send you a secure password reset link valid for 60 minutes.',
      hi: 'लॉगिन स्क्रीन पर "पासवर्ड भूल गए" लिंक पर क्लिक करें, अपना पंजीकृत ईमेल पता दर्ज करें, और हम आपको 60 मिनट के लिए वैध एक सुरक्षित पासवर्ड रीसेट लिंक भेजेंगे।',
      mr: 'लॉगिन स्क्रीनवरील "पासवर्ड विसरलात" लिंकवर क्लिक करा, तुमचा नोंदणीकृत ईमेल पत्ता प्रविष्ट करा आणि आम्ही तुम्हाला ६० मिनिटांसाठी वैध पासवर्ड रीसेट लिंक पाठवू.',
    },
  },
  faq_5: {
    question: {
      en: 'Is two-factor authentication (2FA) supported?',
      hi: 'क्या दो-कारक प्रमाणीकरण (2FA) समर्थित है?',
      mr: 'टू-फॅक्टर ऑथेंटिकेशन (2FA) समर्थित आहे का?',
    },
    answer: {
      en: 'Yes, two-factor authentication (2FA) using TOTP apps such as Google Authenticator, Authy, or 1Password is supported and recommended for all workspace members under Account Settings > Security.',
      hi: 'हाँ, Google Authenticator, Authy या 1Password जैसे TOTP ऐप्स का उपयोग करके दो-कारक प्रमाणीकरण (2FA) समर्थित है और खाता सेटिंग > सुरक्षा के तहत सभी कार्यक्षेत्र सदस्यों के लिए अनुशंसित है।',
      mr: 'होय, Google Authenticator, Authy किंवा 1Password सारख्या TOTP अॅप्सचा वापर करून टू-फॅक्टर ऑथेंटिकेशन (2FA) समर्थित आहे आणि खाते सेटिंग्ज > सुरक्षितता अंतर्गत सर्व सदस्यांसाठी शिफारस केलेले आहे.',
    },
  },
  faq_6: {
    question: {
      en: 'How do I embed the chatbot widget onto my website?',
      hi: 'मैं अपनी वेबसाइट पर चैटबॉट विजेट कैसे एम्बेड करूं?',
      mr: 'मी माझ्या वेबसाइटवर चॅटबॉट विजेट कसे एम्बेड करू?',
    },
    answer: {
      en: 'Go to your Dashboard > Chatbot Embed page, copy the generated <script> code snippet, and paste it right before the closing </body> tag of your website HTML or theme file. It works on plain HTML, WordPress, Shopify, Next.js, and Webflow.',
      hi: 'अपने डैशबोर्ड > चैटबॉट एम्बेड पेज पर जाएं, जनरेट किए गए <script> कोड स्निपेट को कॉपी करें, और इसे अपनी वेबसाइट HTML या थीम फ़ाइल के बंद होने वाले </body> टैग से ठीक पहले पेस्ट करें। यह HTML, WordPress, Shopify, Next.js और Webflow पर काम करता है।',
      mr: 'तुमच्या डॅशबोर्ड > चॅटबॉट एम्बेड पृष्ठावर जा, तयार केलेला <script> कोड स्निपेट कॉपी करा आणि तो तुमच्या वेबसाइट HTML च्या बंद होणाऱ्या </body> टॅगच्या आधी पेस्ट करा. हे HTML, WordPress, Shopify, Next.js आणि Webflow वर कार्य करते.',
    },
  },
  faq_7: {
    question: {
      en: 'Which payment methods do you accept?',
      hi: 'आप कौन सी भुगतान विधियां स्वीकार करते हैं?',
      mr: 'तुम्ही कोणती पेमेंट पद्धती स्वीकारता?',
    },
    answer: {
      en: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), Net Banking, and UPI (via Razorpay in supported regions). Invoicing with bank transfers is available for annual Business plans.',
      hi: 'हम सभी प्रमुख क्रेडिट और डेबिट कार्ड (वीज़ा, मास्टरकार्ड, अमेरिकन एक्सप्रेस), नेट बैंकिंग और यूपीआई (समर्थित क्षेत्रों में रेजरपे के माध्यम से) स्वीकार करते हैं। वार्षिक बिजनेस योजनाओं के लिए बैंक ट्रांसफर इनवॉइसिंग उपलब्ध है।',
      mr: 'आम्ही सर्व प्रमुख क्रेडिट आणि डेबिट कार्ड (Visa, MasterCard, American Express), नेट बँकिंग आणि UPI स्वीकारतो. वार्षिक व्यवसाय योजनांसाठी बँक ट्रान्सफर इनव्हॉइसिंग उपलब्ध आहे.',
    },
  },
  faq_8: {
    question: {
      en: 'Where is customer data hosted and is it encrypted?',
      hi: 'ग्राहक डेटा कहाँ होस्ट किया गया है और क्या यह एन्क्रिप्टेड है?',
      mr: 'ग्राहकांचा डेटा कुठे होस्ट केला जातो आणि तो एन्क्रिप्ट केलेला आहे का?',
    },
    answer: {
      en: 'All data is encrypted in transit using TLS 1.3 and encrypted at rest using AES-256. Our primary databases are hosted in ISO 27001 and SOC 2 Type II certified data centers with strict tenant isolation.',
      hi: 'सभी डेटा को TLS 1.3 का उपयोग करके ट्रांजिट में और AES-256 का उपयोग करके एन्क्रिप्ट किया जाता है। हमारे प्राथमिक डेटाबेस सख्त टेनेंट अलगाव के साथ ISO 27001 और SOC 2 Type II प्रमाणित डेटा केंद्रों में होस्ट किए जाते हैं।',
      mr: 'सर्व डेटा TLS 1.3 वापरून ट्रान्झिटमध्ये आणि AES-256 वापरून एन्क्रिप्ट केला जातो. आमचे प्राथमिक डेटाबेस ISO 27001 आणि SOC 2 प्रमाणित डेटा केंद्रांमध्ये सुरक्षित ठेवले जातात.',
    },
  },
  faq_9: {
    question: {
      en: 'What happens if my workspace exceeds the monthly conversation limit?',
      hi: 'यदि मेरा कार्यक्षेत्र मासिक बातचीत सीमा से अधिक हो जाए तो क्या होगा?',
      mr: 'माझ्या कार्यक्षेत्राने मासिक संभाषण मर्यादा ओलांडल्यास काय होईल?',
    },
    answer: {
      en: 'If you reach your plan limit, your widget continues running, but subsequent incoming queries will display a friendly rate limit notification unless you upgrade your tier or enable burst allowance in billing settings.',
      hi: 'यदि आप अपनी योजना सीमा तक पहुँचते हैं, तो आपका विजेट चलना जारी रहता है, लेकिन जब तक आप अपने स्तर को अपग्रेड नहीं करते, तब तक आने वाले प्रश्नों पर सीमा सूचना प्रदर्शित होगी।',
      mr: 'तुम्ही योजनेच्या मर्यादेपर्यंत पोहोचल्यास, तुमचे विजेट चालू राहील, परंतु तुम्ही श्रेणी अपग्रेड करेपर्यंत पुढील प्रश्नांवर मर्यादा सूचना दिसेल.',
    },
  },
  faq_10: {
    question: {
      en: 'How do I contact customer support if my issue is not answered?',
      hi: 'यदि मेरी समस्या का समाधान नहीं हुआ तो मैं ग्राहक सहायता से कैसे संपर्क करूँ?',
      mr: 'माझ्या समस्येचे निराकरण न झाल्यास मी ग्राहक समर्थनाशी कसा संपर्क साधू?',
    },
    answer: {
      en: 'You can email our support team directly at support@technova.example.com or submit a ticket through the dashboard. Priority support response time is within 2 hours during business hours (9 AM - 6 PM EST).',
      hi: 'आप हमारी सहायता टीम को सीधे support@technova.example.com पर ईमेल कर सकते हैं या डैशबोर्ड के माध्यम से टिकट जमा कर सकते हैं। व्यावसायिक घंटों के दौरान प्राथमिकता सहायता प्रतिक्रिया समय 2 घंटे के भीतर है।',
      mr: 'तुम्ही आमच्या समर्थन कार्यसंघाला थेट support@technova.example.com वर ईमेल करू शकता किंवा डॅशबोर्डद्वारे तिकीट सबमिट करू शकता. व्यावसायिक वेळेत प्राधान्य प्रतिसाद वेळ २ तासांच्या आत आहे.',
    },
  },
};

// Common bilingual/multilingual intent patterns mapped to English query equivalents
export const MULTILINGUAL_INTENT_MAP: Array<{ patterns: string[]; englishQuery: string }> = [
  {
    patterns: [
      'मूल्य', 'कीमत', 'प्राइस', 'प्लान', 'सब्सक्रिप्शन', 'खर्च', 'कितने का है', 'कितना पैसा',
      'किंमत', 'दर', 'योजना', 'किती पैसे', 'खर्च किती',
      'price', 'pricing', 'cost', 'plan', 'kitna paisa', 'kitna price'
    ],
    englishQuery: 'What subscription pricing plans do you offer?',
  },
  {
    patterns: [
      'रिफंड', 'पैसे वापस', 'वापसी', 'कैंसल', 'रद्द', 'गारंटी',
      'परतावा', 'पैसे परत', 'रद्द करणे',
      'refund', 'cancellation', 'money back', 'paise wapas', 'cancel'
    ],
    englishQuery: 'What is your refund and cancellation policy?',
  },
  {
    patterns: [
      'एपीआई', 'रेट लिमिट', 'लिमिट', 'सीमा', 'अनुरोध', 'रिक्वेस्ट',
      'मर्यादा', 'दर मर्यादा',
      'api limit', 'rate limit', 'requests per minute'
    ],
    englishQuery: 'What are the API rate limits for requests?',
  },
  {
    patterns: [
      'पासवर्ड', 'पासवर्ड भूल गया', 'पासवर्ड रीसेट', 'लॉगिन समस्या',
      'पासवर्ड विसरलो', 'पासवर्ड कसा बदलावा',
      'forgot password', 'reset password', 'password bhul gaya'
    ],
    englishQuery: 'How do I reset my account password if I forgot it?',
  },
  {
    patterns: [
      '2fa', 'टू फैक्टर', 'सुरक्षा', 'ओटीपी', 'ऑथेंटिकेटर',
      'सुरक्षितता', 'द्वि घटक',
      'two factor', 'mfa', 'security'
    ],
    englishQuery: 'Is two-factor authentication (2FA) supported?',
  },
  {
    patterns: [
      'विजेट', 'वेबसाइट', 'एम्बेड', 'कोड', 'जोड़ें',
      'संकेतस्थळ', 'जोडणे',
      'embed widget', 'add to website', 'script code'
    ],
    englishQuery: 'How do I embed the chatbot widget onto my website?',
  },
  {
    patterns: [
      'भुगतान', 'पेमेंट', 'क्रेडिट कार्ड', 'डेबिट कार्ड', 'यूपीआई', 'गूगल पे',
      'पेमेंट पद्धती',
      'payment methods', 'upi', 'credit card', 'accepted payments'
    ],
    englishQuery: 'Which payment methods do you accept?',
  },
  {
    patterns: [
      'डेटा', 'एन्क्रिप्शन', 'सुरक्षित', 'होस्टिंग', 'गोपनीयता',
      'माहिती सुरक्षितता',
      'data security', 'encryption', 'data hosting'
    ],
    englishQuery: 'Where is customer data hosted and is it encrypted?',
  },
  {
    patterns: [
      'सपोर्ट', 'संपर्क', 'कस्टमर केयर', 'ईमेल', 'फोन', 'मदद', 'सहायता',
      'मदत', 'ग्राहक समर्थन',
      'support email', 'customer care', 'contact help'
    ],
    englishQuery: 'How do I contact customer support if my issue is not answered?',
  },
];
