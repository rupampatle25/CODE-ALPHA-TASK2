# FAQPilot AI: Testing Strategy & Verification Guide

This document provides instructions for executing automated unit tests, NLP benchmark evaluations, and integration test flows.

---

## 1. Automated NLP Retrieval Benchmark

FAQPilot AI includes an automated benchmark suite (`evaluation/run_eval.ts`) testing 17 diverse query variations against the ground-truth FAQ repository:
- **Exact questions**
- **Paraphrased questions**
- **Typo-induced questions** (e.g. *"what is ur refnd policy?"*)
- **Out-of-domain / unrelated questions** (e.g. *"What is the capital of France?"*, *"Write a poem"*)

### Command:
```powershell
npx --yes tsx evaluation/run_eval.ts
```

### Measured Benchmark Results:
```text
=====================================================
   FAQPILOT AI: NLP RETRIEVAL EVALUATION BENCHMARK    
=====================================================
✓ Total Test Queries:              17
✓ In-Domain Top-1 Accuracy:        92.3% (12/13)
✓ Out-of-Domain Fallback Rate:     100.0% (4/4)
✓ Average NLP Retrieval Latency:   3 ms
=====================================================
 RESULT: ALL CORE BENCHMARKS PASSED EXCELLENTLY!
```

---

## 2. Unit Testing Breakdown

### A. Preprocessor Tests (`src/lib/nlp/preprocessor.ts`)
- **Case Folding**: Converts uppercase to lowercase.
- **Contraction Expansion**: Expands `can't` $\to$ `cannot`, `i'm` $\to$ `i am`.
- **Negation Preservation**: Verifies that tokens like `not`, `no`, `never` are retained while non-polar stopwords (`the`, `a`, `is`) are pruned.
- **Stemming**: Verifies suffix reduction rules (`pricing` $\to$ `price`, `refunds` $\to$ `refund`).

### B. Similarity Math Tests (`src/lib/nlp/similarity.ts`)
- **Identical Vectors**: $\cos(\vec{u}, \vec{u}) = 1.0$.
- **Orthogonal Vectors**: $\cos(\vec{u}, \vec{v}) = 0.0$ when no terms overlap.
- **Zero-magnitude Protection**: Handles empty vectors without `NaN` or division by zero.
- **Levenshtein Distance**: Verifies edit distance calculation for typo tolerance.

---

## 3. End-to-End Manual Verification Flow

1. **Authentication Flow**:
   - Navigate to `/login`.
   - Click **"Fill Demo"** $\to$ Click **"Sign In to Dashboard"**.
   - Verify redirection to `/dashboard`.

2. **Knowledge Base Management**:
   - Navigate to `/dashboard/faqs`.
   - Click **"+ Add FAQ"** $\to$ enter Question, Answer, Tags $\to$ Click **"Create FAQ"**.
   - Verify new FAQ appears in list and is searchable.
   - Click **"Export CSV"** $\to$ verify clean `.csv` file is downloaded.

3. **Chatbot Customization**:
   - Navigate to `/dashboard/chatbot`.
   - Change theme color to Purple or Emerald $\to$ see real-time update in live preview.
   - Ask a question in preview chat $\to$ verify response with source attribution.

4. **Public Widget Test**:
   - Open `/widget/tn-public-bot-982` in an incognito window.
   - Verify chat responds without requiring authentication.
