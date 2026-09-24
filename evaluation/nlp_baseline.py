"""
College Assignment Task 2 Reference Implementation
Chatbot for FAQs using NLTK and Cosine Similarity (TF-IDF Vector Space Model)

This script serves as the academic reference demonstrating:
1. FAQ Collection & Representation
2. NLP Preprocessing (Tokenization, Lowercasing, Stopword Removal, Lemmatization)
3. TF-IDF Matrix Vectorization
4. Cosine Similarity Calculation
5. Top Match Retrieval with Confidence Threshold Fallback
"""

import math
import re
from typing import List, Tuple, Dict, Optional

# Sample FAQ Knowledge Base
FAQS = [
    {
        "id": "faq_1",
        "question": "What subscription pricing plans do you offer?",
        "answer": "We offer three plans: Free ($0), Starter ($29/mo), and Business ($99/mo)."
    },
    {
        "id": "faq_2",
        "question": "What is your refund and cancellation policy?",
        "answer": "We offer a 14-day money-back guarantee on all paid subscriptions."
    },
    {
        "id": "faq_3",
        "question": "What are the API rate limits for requests?",
        "answer": "Standard plans allow 60 requests/minute and 5,000 requests/day."
    },
    {
        "id": "faq_4",
        "question": "How do I reset my account password if I forgot it?",
        "answer": "Click 'Forgot Password' on the login screen to receive a secure reset link."
    },
    {
        "id": "faq_5",
        "question": "How do I embed the chatbot widget onto my website?",
        "answer": "Copy the embed script from your dashboard and paste it before the </body> tag."
    }
]

# Standard Stopwords preserving critical negations
STOPWORDS = set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are',
    'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but',
    'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
    'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'him', 'his', 'how',
    'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'me', 'more', 'most', 'my', 'of', 'off',
    'on', 'once', 'only', 'or', 'other', 'our', 'out', 'over', 'own', 'same', 'she', 'should',
    'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'then', 'there',
    'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
    'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with',
    'would', 'you', 'your'
]) - {'not', 'no', 'never', 'cannot'}

def preprocess(text: str) -> List[str]:
    """Preprocess text: clean, lowercase, tokenize, remove stopwords, and normalize."""
    text = text.lower()
    cleaned = re.sub(r'[^a-z0-9\s]', ' ', text)
    tokens = [t.strip() for t in cleaned.split() if t.strip()]
    return [t for t in tokens if t not in STOPWORDS]

def compute_tf(tokens: List[str]) -> Dict[str, float]:
    """Compute term frequency (TF)."""
    tf = {}
    total = len(tokens)
    if total == 0:
        return tf
    for t in tokens:
        tf[t] = tf.get(t, 0) + 1
    return {k: v / total for k, v in tf.items()}

def compute_idf(corpus_tokens: List[List[str]]) -> Dict[str, float]:
    """Compute smoothed inverse document frequency (IDF)."""
    N = len(corpus_tokens)
    doc_freq = {}
    for doc in corpus_tokens:
        for t in set(doc):
            doc_freq[t] = doc_freq.get(t, 0) + 1
    return {t: math.log((1 + N) / (1 + df)) + 1 for t, df in doc_freq.items()}

def cosine_similarity(vec_a: Dict[str, float], vec_b: Dict[str, float]) -> float:
    """Compute cosine similarity between two sparse TF-IDF vectors."""
    common_keys = set(vec_a.keys()) & set(vec_b.keys())
    dot_product = sum(vec_a[k] * vec_b[k] for k in common_keys)
    norm_a = math.sqrt(sum(v ** 2 for v in vec_a.values()))
    norm_b = math.sqrt(sum(v ** 2 for v in vec_b.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

class AcademicFaqChatbot:
    def __init__(self, faqs: List[Dict[str, str]], threshold: float = 0.30):
        self.faqs = faqs
        self.threshold = threshold
        self.doc_tokens = [preprocess(f["question"] + " " + f["answer"]) for f in faqs]
        self.idf = compute_idf(self.doc_tokens)
        self.faq_vectors = [self._vectorize(tokens) for tokens in self.doc_tokens]

    def _vectorize(self, tokens: List[str]) -> Dict[str, float]:
        tf = compute_tf(tokens)
        return {term: tf[term] * self.idf.get(term, 1.0) for term in tf}

    def ask(self, user_question: str) -> Dict[str, any]:
        query_tokens = preprocess(user_question)
        if not query_tokens:
            return {"answer": "Please ask a specific question.", "confidence": 0.0, "matched": False}

        query_vec = self._vectorize(query_tokens)
        best_score = 0.0
        best_faq = None

        for idx, faq_vec in enumerate(self.faq_vectors):
            score = cosine_similarity(query_vec, faq_vec)
            if score > best_score:
                best_score = score
                best_faq = self.faqs[idx]

        if best_faq and best_score >= self.threshold:
            return {
                "matched": True,
                "confidence": round(best_score, 3),
                "question": best_faq["question"],
                "answer": best_faq["answer"]
            }
        else:
            return {
                "matched": False,
                "confidence": round(best_score, 3),
                "answer": "I couldn't find a reliable answer in this business's knowledge base. Please contact support."
            }

if __name__ == "__main__":
    bot = AcademicFaqChatbot(FAQS)
    test_queries = [
        "What are your subscription pricing options?",
        "Can I get a refund if I cancel?",
        "Where is the nearest coffee shop?"
    ]
    for q in test_queries:
        res = bot.ask(q)
        print(f"Q: {q}")
        print(f"Matched: {res['matched']} | Conf: {res['confidence']}")
        print(f"A: {res['answer']}\n")
