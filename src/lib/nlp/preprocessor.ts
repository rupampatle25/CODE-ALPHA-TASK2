/**
 * Sahayak AI NLP Preprocessor
 * Task 2 Requirement: Preprocess text using NLP techniques (cleaning, tokenization, stopword removal, stemming).
 */

// Common contractions expansion dictionary
const CONTRACTIONS: Record<string, string> = {
  "can't": "cannot",
  "won't": "will not",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "haven't": "have not",
  "hasn't": "has not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "i'm": "i am",
  "you're": "you are",
  "they're": "they are",
  "we're": "we are",
  "it's": "it is",
  "that's": "that is",
  "what's": "what is",
  "where's": "where is",
  "how's": "how is",
};

// Crucial: Standard stopwords MINUS negations.
// We strictly preserve negations ("not", "no", "never", "cannot", "without", "none")
// because removing them reverses the query meaning (e.g. "order not received" != "order received").
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
  'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him',
  'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with',
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

/**
 * Basic algorithmic stemmer for English suffixes (Porter-style heuristic)
 */
export function stemWord(word: string): string {
  if (word.length <= 3) return word;

  let w = word;
  if (w.endsWith('sses')) w = w.slice(0, -2);
  else if (w.endsWith('ies')) w = w.slice(0, -3) + 'y';
  else if (w.endsWith('ss')) { /* keep */ }
  else if (w.endsWith('s')) w = w.slice(0, -1);

  if (w.endsWith('eed')) {
    if (w.length > 4) w = w.slice(0, -1);
  } else if (w.endsWith('ed') && w.length > 4) {
    w = w.slice(0, -2);
  } else if (w.endsWith('ing') && w.length > 5) {
    w = w.slice(0, -3);
  }

  if (w.endsWith('ational')) w = w.slice(0, -5) + 'e';
  else if (w.endsWith('tional')) w = w.slice(0, -2);
  else if (w.endsWith('izer')) w = w.slice(0, -1);
  else if (w.endsWith('ation')) w = w.slice(0, -3) + 'e';
  else if (w.endsWith('ator')) w = w.slice(0, -2) + 'e';
  else if (w.endsWith('alism')) w = w.slice(0, -3);
  else if (w.endsWith('iveness')) w = w.slice(0, -4);
  else if (w.endsWith('ful')) w = w.slice(0, -3);
  else if (w.endsWith('ment') && w.length > 6) w = w.slice(0, -4);
  else if (w.endsWith('able') && w.length > 6) w = w.slice(0, -4);
  else if (w.endsWith('ible') && w.length > 6) w = w.slice(0, -4);

  return w;
}

/**
 * Clean and normalize text:
 * 1. Expand contractions
 * 2. Lowercase
 * 3. Replace punctuation with whitespace
 * 4. Tokenize
 * 5. Remove stopwords (while keeping negations)
 * 6. Apply word stemming
 */
export function preprocessText(text: string): { tokens: string[]; rawCleaned: string } {
  if (!text || typeof text !== 'string') {
    return { tokens: [], rawCleaned: '' };
  }

  // 1. Lowercase & expand contractions
  let normalized = text.toLowerCase();
  for (const [contraction, expansion] of Object.entries(CONTRACTIONS)) {
    normalized = normalized.replace(new RegExp(`\\b${contraction}\\b`, 'g'), expansion);
  }

  // 2. Remove symbols/punctuation, keep alphanumerics and single spaces
  const cleaned = normalized.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // 3. Tokenize by whitespace
  const rawTokens = cleaned.split(' ').filter(Boolean);

  // 4. Filter stopwords (preserving negations like "not", "no", "never", "cannot")
  const filteredTokens = rawTokens.filter(token => !STOPWORDS.has(token) || ['not', 'no', 'never', 'cannot', 'none'].includes(token));

  // 5. Apply stemming
  const stemmedTokens = filteredTokens.map(stemWord);

  return {
    tokens: stemmedTokens,
    rawCleaned: cleaned,
  };
}

/**
 * Generate character/word n-grams for fuzzy intent matching
 */
export function generateNGrams(tokens: string[], n = 2): string[] {
  if (tokens.length < n) return tokens;
  const ngrams: string[] = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}
