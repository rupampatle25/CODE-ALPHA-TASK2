import { SupportedLanguage, UI_TRANSLATIONS } from './languages';
import { FAQ_TRANSLATIONS, MULTILINGUAL_INTENT_MAP } from './dictionary';
import { FALLBACK_MESSAGE } from '../nlp/matcher';

export class MultilingualTranslator {
  /**
   * Translates incoming query from a non-English language (Hindi, Marathi) into English
   * so it can be evaluated by the Vector Cosine NLP engine.
   */
  public translateQueryToEnglish(query: string, lang: SupportedLanguage): { englishQuery: string; wasTranslated: boolean } {
    if (!query || lang === 'en') {
      return { englishQuery: query, wasTranslated: false };
    }

    const cleanQuery = query.toLowerCase().trim();

    // 1. Direct match against known FAQ questions in target language
    for (const record of Object.values(FAQ_TRANSLATIONS)) {
      const localizedQ = record.question[lang]?.toLowerCase().trim();
      if (localizedQ && (localizedQ === cleanQuery || cleanQuery.includes(localizedQ) || localizedQ.includes(cleanQuery))) {
        return { englishQuery: record.question.en, wasTranslated: true };
      }
    }

    // 2. Multilingual intent & keyword pattern matching
    for (const item of MULTILINGUAL_INTENT_MAP) {
      const hasPattern = item.patterns.some(p => cleanQuery.includes(p.toLowerCase()));
      if (hasPattern) {
        return { englishQuery: item.englishQuery, wasTranslated: true };
      }
    }

    // 3. Fallback: Return original query (the NLP matcher also tokenizes numbers and shared terms)
    return { englishQuery: query, wasTranslated: false };
  }

  /**
   * Translates an approved FAQ answer from English into the target language (Hindi or Marathi).
   * Ensures answers remain strictly grounded in verified business knowledge.
   */
  public translateAnswer(
    answer: string, 
    targetLang: SupportedLanguage, 
    faqId?: string
  ): { translatedAnswer: string; originalAnswer: string; isTranslated: boolean } {
    if (targetLang === 'en' || !answer) {
      return { translatedAnswer: answer, originalAnswer: answer, isTranslated: false };
    }

    // 1. Check if this is the standard fallback message
    if (answer === FALLBACK_MESSAGE) {
      return {
        translatedAnswer: UI_TRANSLATIONS[targetLang]?.fallbackMessage || answer,
        originalAnswer: answer,
        isTranslated: true,
      };
    }

    // 2. If matched to a specific FAQ with verified translation
    if (faqId && FAQ_TRANSLATIONS[faqId]) {
      const translated = FAQ_TRANSLATIONS[faqId].answer[targetLang];
      if (translated) {
        return {
          translatedAnswer: translated,
          originalAnswer: answer,
          isTranslated: true,
        };
      }
    }

    // 3. Check for partial question/answer matches in the translation dictionary
    for (const record of Object.values(FAQ_TRANSLATIONS)) {
      if (record.answer.en.trim() === answer.trim()) {
        const localized = record.answer[targetLang];
        if (localized) {
          return {
            translatedAnswer: localized,
            originalAnswer: answer,
            isTranslated: true,
          };
        }
      }
    }

    // Default to original answer if no verified translation is mapped
    return { translatedAnswer: answer, originalAnswer: answer, isTranslated: false };
  }

  /**
   * Translates alternative suggested FAQ questions
   */
  public translateAlternativeQuestions(
    alternatives: Array<{ id: string; question: string; confidence: number }>, 
    targetLang: SupportedLanguage
  ): Array<{ id: string; question: string; confidence: number }> {
    if (targetLang === 'en' || !alternatives) {
      return alternatives;
    }

    return alternatives.map(alt => {
      const record = FAQ_TRANSLATIONS[alt.id];
      if (record && record.question[targetLang]) {
        return {
          ...alt,
          question: record.question[targetLang],
        };
      }
      return alt;
    });
  }

  /**
   * Translates a plain list of questions into the target language using
   * the approved FAQ knowledge base dictionary.
   */
  public translateQuestionList(questions: string[], targetLang: SupportedLanguage): string[] {
    if (targetLang === 'en' || !questions || questions.length === 0) {
      return questions;
    }

    return questions.map(q => {
      const cleanQ = q.toLowerCase().trim();
      for (const record of Object.values(FAQ_TRANSLATIONS)) {
        if (record.question.en.toLowerCase().trim() === cleanQ) {
          return record.question[targetLang] || q;
        }
      }
      return q;
    });
  }
}

export const translator = new MultilingualTranslator();
