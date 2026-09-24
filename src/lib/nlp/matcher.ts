/**
 * Sahayak AI Intelligent FAQ Matching Engine
 * Core college assignment pipeline:
 * User Question -> Text Cleaning & Tokenization -> TF-IDF Vectorization ->
 * Cosine Similarity -> Confidence Evaluation -> Answer Retrieval / Fallback Guardrail.
 */

import { Faq } from '@/lib/db/types';
import { preprocessText } from './preprocessor';
import { buildTfIdfCorpus, computeTfIdfVector, TfIdfCorpus } from './tfidf';
import { calculateCosineSimilarity, calculateJaccardSimilarity, calculateFuzzyTokenMatch } from './similarity';

export interface MatchResult {
  matched: boolean;
  faq?: Faq;
  answer: string;
  confidence: number;
  isFallback: boolean;
  latencyMs: number;
  sourceQuestion?: string;
  matchedCategory?: string;
  alternativeFaqs?: Array<{ id: string; question: string; confidence: number }>;
}

export const DEFAULT_CONFIDENCE_THRESHOLD = 0.25;
export const FALLBACK_MESSAGE = 
  "I couldn't find a reliable answer in this business's knowledge base. Please contact the business directly or try asking your question another way.";

interface PreparedFaqDoc {
  faq: Faq;
  allTokens: string[];
  questionTokens: string[];
  exactNormalizedQuestion: string;
}

export class FaqMatcher {
  private threshold: number;

  constructor(threshold = DEFAULT_CONFIDENCE_THRESHOLD) {
    this.threshold = threshold;
  }

  public setThreshold(threshold: number) {
    this.threshold = threshold;
  }

  /**
   * Evaluates a user query against a workspace's approved FAQs.
   */
  public match(query: string, faqs: Faq[]): MatchResult {
    const startTime = performance.now();

    // 1. Text Validation
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return {
        matched: false,
        answer: "Please enter a valid question so I can assist you.",
        confidence: 0,
        isFallback: true,
        latencyMs: Math.round(performance.now() - startTime),
      };
    }

    const cleanRaw = query.trim().toLowerCase().replace(/[?!.,]/g, '').trim();

    // 1.1 Conversational Greetings & Courtesy Intents
    const greetingWords = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'greetings', 'hola'];
    if (greetingWords.includes(cleanRaw) || greetingWords.some(g => cleanRaw === `${g} there` || cleanRaw === `${g} sahayak` || cleanRaw === `${g} bot`)) {
      return {
        matched: true,
        answer: "Hello! I am your Sahayak AI assistant. I am connected to your workspace knowledge base and ready to answer your questions. Feel free to ask about our services, pricing, account settings, API limits, or policies!",
        confidence: 1.0,
        isFallback: false,
        latencyMs: Math.max(1, Math.round(performance.now() - startTime)),
      };
    }

    const capabilityPhrases = ['who are you', 'what are you', 'what is sahayak ai', 'what can you do', 'tell me about yourself', 'how do you work', 'what is your purpose'];
    if (capabilityPhrases.some(p => new RegExp(`\\b${p}\\b`, 'i').test(cleanRaw))) {
      return {
        matched: true,
        answer: "I am Sahayak AI, your intelligent virtual support assistant. I use deterministic vector similarity matching (TF-IDF and Cosine Similarity) to provide accurate, grounded answers from your approved knowledge base without hallucinations. You can ask me anything about our business offerings, pricing, technical support, or policies.",
        confidence: 1.0,
        isFallback: false,
        latencyMs: Math.max(1, Math.round(performance.now() - startTime)),
      };
    }

    const helpPhrases = ['help', 'help me', 'how to use', 'what should i ask', 'how do i start'];
    if (helpPhrases.includes(cleanRaw)) {
      return {
        matched: true,
        answer: "I can assist you with answers from our verified knowledge base! You can click any of the suggested questions below, type your question in your own words, or switch to Hindi or Marathi using the language selector. If you need specialized help, you can also escalate your question to our human support desk.",
        confidence: 1.0,
        isFallback: false,
        latencyMs: Math.max(1, Math.round(performance.now() - startTime)),
      };
    }

    const thanksPhrases = ['thank you', 'thanks', 'thx', 'dhanyavaad', 'shukriya', 'thank you so much'];
    if (thanksPhrases.some(p => cleanRaw === p || cleanRaw.startsWith(p))) {
      return {
        matched: true,
        answer: "You're very welcome! Feel free to ask if you have any other questions. I'm always here to help!",
        confidence: 1.0,
        isFallback: false,
        latencyMs: Math.max(1, Math.round(performance.now() - startTime)),
      };
    }

    const enabledFaqs = faqs.filter(f => f.isEnabled);
    if (enabledFaqs.length === 0) {
      return {
        matched: false,
        answer: "This workspace's knowledge base is currently being initialized. You can add FAQs under 'Knowledge Base (FAQs)' in your dashboard to train me, or contact our support team for immediate help!",
        confidence: 0,
        isFallback: true,
        latencyMs: Math.round(performance.now() - startTime),
      };
    }

    // 2. Preprocess query
    const { tokens: queryTokens, rawCleaned: queryCleaned } = preprocessText(query);

    if (queryTokens.length === 0) {
      return {
        matched: false,
        answer: FALLBACK_MESSAGE,
        confidence: 0,
        isFallback: true,
        latencyMs: Math.round(performance.now() - startTime),
      };
    }

    // 3. Prepare FAQ documents
    const preparedDocs: PreparedFaqDoc[] = enabledFaqs.map(faq => {
      const qPrep = preprocessText(faq.question);
      const aPrep = preprocessText(faq.answer);
      const tagsPrep = preprocessText(faq.tags.join(' '));

      // Composite token document for TF-IDF (question given double weight)
      const allTokens = [...qPrep.tokens, ...qPrep.tokens, ...aPrep.tokens, ...tagsPrep.tokens, ...tagsPrep.tokens];
      const keyTokens = [...qPrep.tokens, ...tagsPrep.tokens];

      return {
        faq,
        allTokens,
        questionTokens: keyTokens,
        exactNormalizedQuestion: qPrep.rawCleaned,
      };
    });

    // 4. Exact match fast-path check
    for (const doc of preparedDocs) {
      if (doc.exactNormalizedQuestion === queryCleaned) {
        return {
          matched: true,
          faq: doc.faq,
          answer: doc.faq.answer,
          confidence: 1.0,
          isFallback: false,
          latencyMs: Math.max(1, Math.round(performance.now() - startTime)),
          sourceQuestion: doc.faq.question,
        };
      }
    }

    // 5. Build TF-IDF Corpus across all FAQs in the knowledge base
    const corpusTokens = preparedDocs.map(d => d.allTokens);
    const corpus: TfIdfCorpus = buildTfIdfCorpus(corpusTokens);

    // Compute TF-IDF vector for the user's question
    const queryVector = computeTfIdfVector(queryTokens, corpus);

    // 6. Calculate Cosine Similarity & Jaccard overlap for each candidate FAQ
    interface ScoredCandidate {
      doc: PreparedFaqDoc;
      cosineScore: number;
      jaccardScore: number;
      compositeScore: number;
    }

    const scoredCandidates: ScoredCandidate[] = preparedDocs.map(doc => {
      const docVector = computeTfIdfVector(doc.allTokens, corpus);
      const cosineScore = calculateCosineSimilarity(queryVector, docVector);
      const jaccardScore = calculateJaccardSimilarity(queryTokens, doc.questionTokens);
      const fuzzyScore = calculateFuzzyTokenMatch(queryTokens, doc.questionTokens);
      const matchedTokenCount = queryTokens.filter(t => doc.questionTokens.includes(t)).length;

      // Penalize spurious single-word overlap when query has 3+ words but only 1 word matches
      let penalty = 1.0;
      if (queryTokens.length >= 3 && matchedTokenCount <= 1 && fuzzyScore < 0.35) {
        penalty = 0.4;
      }

      // Composite score: 55% TF-IDF Cosine, 25% Token Jaccard, 20% Question Fuzzy Typo Match
      const compositeScore = ((0.55 * cosineScore) + (0.25 * jaccardScore) + (0.20 * fuzzyScore)) * penalty;

      return {
        doc,
        cosineScore,
        jaccardScore,
        compositeScore,
      };
    });

    // 7. Sort candidates by descending composite score
    scoredCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

    const bestCandidate = scoredCandidates[0];
    const topScore = bestCandidate ? bestCandidate.compositeScore : 0;
    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));

    // 8. Confidence Evaluation & Threshold Guardrail
    if (bestCandidate && topScore >= this.threshold) {
      const alternatives = scoredCandidates
        .slice(1, 3)
        .filter(c => c.compositeScore >= this.threshold * 0.7)
        .map(c => ({
          id: c.doc.faq.id,
          question: c.doc.faq.question,
          confidence: Math.round(c.compositeScore * 100) / 100,
        }));

      return {
        matched: true,
        faq: bestCandidate.doc.faq,
        answer: bestCandidate.doc.faq.answer,
        confidence: Math.round(topScore * 100) / 100,
        isFallback: false,
        latencyMs,
        sourceQuestion: bestCandidate.doc.faq.question,
        alternativeFaqs: alternatives.length > 0 ? alternatives : undefined,
      };
    }

    // 9. Graceful fallback when confidence is below threshold
    return {
      matched: false,
      answer: FALLBACK_MESSAGE,
      confidence: Math.round(topScore * 100) / 100,
      isFallback: true,
      latencyMs,
    };
  }
}

export const defaultMatcher = new FaqMatcher();
