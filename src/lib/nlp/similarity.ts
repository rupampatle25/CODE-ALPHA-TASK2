/**
 * Sahayak AI Vector Similarity Math
 * Task 2 Requirement: Match user questions using cosine similarity.
 */

/**
 * Calculates mathematical Cosine Similarity between two real-valued vectors.
 * Formula: CosineSimilarity(u, v) = (u · v) / (||u|| * ||v||)
 * Returns a value in [0.0, 1.0] (for non-negative TF-IDF representations).
 */
export function calculateCosineSimilarity(u: Float64Array, v: Float64Array): number {
  if (u.length !== v.length || u.length === 0) {
    return 0.0;
  }

  let dotProduct = 0.0;
  let normU = 0.0;
  let normV = 0.0;

  for (let i = 0; i < u.length; i++) {
    const valU = u[i];
    const valV = v[i];
    dotProduct += valU * valV;
    normU += valU * valU;
    normV += valV * valV;
  }

  const denominator = Math.sqrt(normU) * Math.sqrt(normV);
  if (denominator === 0.0) {
    return 0.0;
  }

  const score = dotProduct / denominator;
  // Guard against slight floating point inaccuracies
  return Math.min(1.0, Math.max(0.0, score));
}

/**
 * Calculates Jaccard token overlap similarity between two token sets.
 * Formula: J(A, B) = |A ∩ B| / |A ∪ B|
 * Used as an auxiliary signal for short conversational queries.
 */
export function calculateJaccardSimilarity(tokensA: string[], tokensB: string[]): number {
  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0.0;
  }

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersectionSize = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionSize++;
    }
  }

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  return unionSize > 0 ? intersectionSize / unionSize : 0.0;
}

/**
 * Calculates Levenshtein edit distance between two strings.
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Fuzzy token matching ratio: returns average maximum similarity for tokens with typo tolerance.
 */
export function calculateFuzzyTokenMatch(queryTokens: string[], docTokens: string[]): number {
  if (queryTokens.length === 0 || docTokens.length === 0) return 0.0;

  let totalMatchScore = 0;
  for (const qToken of queryTokens) {
    let bestTokenScore = 0;
    for (const dToken of docTokens) {
      if (qToken === dToken) {
        bestTokenScore = 1.0;
        break;
      }
      const maxLen = Math.max(qToken.length, dToken.length);
      if (maxLen > 3) {
        const dist = calculateLevenshteinDistance(qToken, dToken);
        if (dist <= 2) {
          const sim = 1.0 - (dist / maxLen);
          if (sim > bestTokenScore) bestTokenScore = sim;
        }
      }
    }
    totalMatchScore += bestTokenScore;
  }

  return totalMatchScore / queryTokens.length;
}

