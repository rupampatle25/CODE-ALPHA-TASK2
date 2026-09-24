/**
 * Sahayak AI TF-IDF Vectorizer
 * Task 2 Requirement: Mathematical feature extraction using Term Frequency - Inverse Document Frequency.
 */

export interface TfIdfCorpus {
  vocabulary: Map<string, number>; // term -> index
  idfMap: Map<string, number>;      // term -> IDF weight
  featureNames: string[];
}

/**
 * Builds vocabulary and calculates smoothed IDF weights across a corpus of tokenized documents.
 * Formula: IDF(t) = ln((1 + N) / (1 + df(t))) + 1
 * (Standard smoothed formulation used in scikit-learn / NLTK)
 */
export function buildTfIdfCorpus(documentTokensList: string[][]): TfIdfCorpus {
  const vocabulary = new Map<string, number>();
  const docFrequency = new Map<string, number>();
  const N = documentTokensList.length;

  // 1. Calculate document frequencies (df)
  for (const docTokens of documentTokensList) {
    const uniqueTerms = new Set(docTokens);
    for (const term of uniqueTerms) {
      docFrequency.set(term, (docFrequency.get(term) || 0) + 1);
      if (!vocabulary.has(term)) {
        vocabulary.set(term, vocabulary.size);
      }
    }
  }

  // 2. Calculate IDF weights
  const idfMap = new Map<string, number>();
  const featureNames: string[] = new Array(vocabulary.size);

  vocabulary.forEach((index, term) => {
    featureNames[index] = term;
    const df = docFrequency.get(term) || 0;
    const idf = Math.log((1 + N) / (1 + df)) + 1;
    idfMap.set(term, idf);
  });

  return {
    vocabulary,
    idfMap,
    featureNames,
  };
}

/**
 * Transforms tokenized text into a sparse or dense TF-IDF vector aligned with the corpus vocabulary.
 */
export function computeTfIdfVector(tokens: string[], corpus: TfIdfCorpus): Float64Array {
  const vector = new Float64Array(corpus.vocabulary.size);
  if (tokens.length === 0 || corpus.vocabulary.size === 0) {
    return vector;
  }

  // Calculate Term Frequency (TF): count(t) / totalTokens
  const termCounts = new Map<string, number>();
  for (const token of tokens) {
    termCounts.set(token, (termCounts.get(token) || 0) + 1);
  }

  const totalTokens = tokens.length;

  termCounts.forEach((count, term) => {
    const termIndex = corpus.vocabulary.get(term);
    if (termIndex !== undefined) {
      const tf = count / totalTokens;
      const idf = corpus.idfMap.get(term) || 1;
      vector[termIndex] = tf * idf;
    }
  });

  return vector;
}
