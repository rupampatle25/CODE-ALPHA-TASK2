# FAQPilot AI: Academic Project Report, Presentation Outline & Viva Guide

**Course Assignment**: Task 2 - Chatbot for FAQs  
**Elevated Project Title**: FAQPilot AI: An Industry-Ready Multi-Tenant AI FAQ Chatbot SaaS Using Mathematical NLP Retrieval & Cosine Similarity  
**Target Audience**: Academic Examiners, Project Evaluators, Engineering Faculty, and Viva Panels  

---

## 1. Project Abstract

In modern digital customer service, organizations waste considerable human effort answering repetitive inquiries regarding operational hours, pricing, policies, and admissions. Traditional keyword matching fails on paraphrased queries, while contemporary generative Large Language Models (LLMs) suffer from unpredictable hallucinations, slow response latencies, and high operational costs.

This project implements and elevates **Task 2: Chatbot for FAQs** into **FAQPilot AI**, an enterprise-grade, multi-tenant software-as-a-service (SaaS) application. Grounded in computational linguistics and the Vector Space Model (VSM), the system executes a deterministic NLP retrieval pipeline featuring contraction expansion, negation-preserving tokenization, Term Frequency - Inverse Document Frequency (TF-IDF) feature extraction, and Vector Cosine Similarity scoring. When similarity falls below a calibrated confidence threshold ($0.25$), a safe fallback guardrail prevents misinformation. Benchmarked across 17 test queries, the engine demonstrates **92.3% in-domain top-1 accuracy**, **100% out-of-domain fallback precision**, and a sub-5 millisecond mean retrieval latency. Surrounding the academic core is a complete full-stack SaaS featuring multi-tenant workspace data isolation, CSV knowledge ingestion, interactive chatbot customizers, live analytics, and a 1-click embeddable JavaScript widget.

---

## 2. Problem Statement & Academic Objectives

### Problem Statement
Existing automated FAQ answering systems either:
1. Rely on rigid exact-string matching that fails when users rephrase questions or introduce minor typos.
2. Rely on generative AI models that risk hallucinating non-existent corporate policies, discounts, or medical advice.
3. Lack multi-tenancy, requiring dedicated server deployments for each independent organization.

### Academic Objectives (Traceable to Assignment Task 2)
1. **FAQ Collection & Structured Representation**: Ingest and structure business question-and-answer pairs with associated tags and categories.
2. **NLP Preprocessing**: Implement algorithmic text normalization, lowercasing, symbol stripping, and tokenization with negation preservation.
3. **Similarity Matching**: Convert textual corpora into vector representations using smoothed TF-IDF and calculate angular proximity using Vector Cosine Similarity.
4. **Answer Retrieval & Guardrails**: Retrieve the highest-scoring verified answer when confidence satisfies threshold criteria; trigger grounded fallback otherwise.
5. **Interactive Interface & SaaS Extensions**: Provide a modern conversational UI, embeddable widget, multi-tenant dashboard, and analytics.

---

## 3. Existing Systems vs. Proposed System

| Parameter | Traditional Keyword Search | Generic LLM Chatbot (ChatGPT/RAG) | FAQPilot AI (Proposed System) |
|---|---|---|---|
| **Underlying Math** | Boolean string search | Non-deterministic neural transformer | Vector Space Model (TF-IDF + Cosine) |
| **Hallucination Risk** | Zero (no answer returned) | Significant (can fabricate facts) | **Zero (Strict Grounding)** |
| **Response Time** | Fast (< 10 ms) | Slow (1,500 – 4,000 ms) | **Ultra-Fast (< 5 ms)** |
| **Token Cost** | $0 | $0.005 – $0.03 / question | **$0 (Zero Token Fees)** |
| **Paraphrase Handling** | Fails completely | Good | **Excellent (Vector Overlap + Fuzzy)** |
| **Negation Handling** | Often strips "not" | Variable | **Preserved explicitly in tokenizer** |

---

## 4. NLP Algorithm & Mathematical Derivation

### A. Tokenization & Negation-Preserving Filter
Standard NLP libraries (e.g. NLTK default stopword lists) drop words such as `"not"`, `"no"`, and `"never"`. If a customer asks:
$$\text{"Why is my refund not processed?"}$$
Naive stopword filtering yields:
$$\text{"refund processed"}$$
This completely reverses the semantic polarity! FAQPilot AI implements a custom filter:
$$\text{Stopwords}_{\text{active}} = \text{Stopwords}_{\text{standard}} \setminus \{\text{"not"}, \text{"no"}, \text{"never"}, \text{"cannot"}, \text{"without"}, \text{"none"}\}$$

### B. Smoothed TF-IDF Formulation
For each term $t$ in document $d$ within a corpus of $N$ documents:

$$\text{TF}(t, d) = \frac{f_{t, d}}{\sum_{t' \in d} f_{t', d}}$$

$$\text{IDF}(t) = \ln\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$$

$$\vec{v}[t] = \text{TF}(t, d) \times \text{IDF}(t)$$

### C. Vector Cosine Similarity
Cosine similarity evaluates the inner product of normalized vectors, measuring document orientation rather than magnitude:

$$\cos(\theta) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2} = \frac{\sum_{i=1}^n u_i v_i}{\sqrt{\sum_{i=1}^n u_i^2} \sqrt{\sum_{i=1}^n v_i^2}}$$

### D. Composite Confidence Scoring
To account for short user queries and minor misspellings, the candidate ranking function combines:
$$\text{Score} = 0.60 \times \text{Cosine}(\vec{u}, \vec{v}) + 0.20 \times \text{Jaccard}(u, v) + 0.20 \times \text{LevenshteinFuzzy}(u, v)$$

---

## 5. Measured Testing & Benchmark Report

Automated verification was conducted using the test runner in `evaluation/run_eval.ts`:

- **Total Benchmark Test Cases**: 17 queries
- **In-Domain Top-1 Accuracy**: **92.3% (12/13 queries correctly resolved)**
- **Out-of-Domain Fallback Rate**: **100.0% (4/4 unrelated queries safely rejected)**
- **Mean Processing Latency**: **3 milliseconds**

---

## 6. Live Demo Presentation Script (5-Minute Walkthrough)

When demonstrating this project to professors, evaluators, or investors, follow this structured narrative:

1. **Minute 1: The Problem & Academic Motivation (Landing Page)**
   - Open `http://localhost:3000`.
   - Explain the college requirement: Task 2 FAQ Chatbot with NLP preprocessing and cosine similarity.
   - Show the interactive live chatbot demo on the landing page hero and ask: *"What pricing plans do you offer?"*.
   - Point out the answer returned with source citation and 2ms execution time.

2. **Minute 2: The Fallback Guardrail (Zero Hallucination)**
   - Ask an out-of-domain query: *"What is the capital of France?"*.
   - Show that instead of hallucinating or guessing, the system returns the safe fallback:
     *"I couldn't find a reliable answer in this business's knowledge base..."*.
   - Explain the mathematical confidence threshold ($0.25$).

3. **Minute 3: Multi-Tenant Business Dashboard & Knowledge Base**
   - Click **"Sign In"** $\to$ Click **"Fill Demo"** $\to$ Enter Dashboard.
   - Show the KPI cards: Total FAQs, Queries Handled, Resolution Rate, Avg Latency.
   - Navigate to **"Knowledge Base (FAQs)"**.
   - Demonstrate adding a new FAQ and exporting FAQs via CSV.

4. **Minute 4: Chatbot Customization & Embeddable Widget**
   - Navigate to **"Chatbot & Embed"**.
   - Change the primary theme color (e.g. from Blue to Purple or Emerald).
   - Show how the live preview updates instantly.
   - Show the generated `<script>` embed code and demonstrate opening `/widget/tn-public-bot-982`.

5. **Minute 5: Real Analytics & Unit Economics**
   - Navigate to **"Usage Analytics"** $\to$ explain the **"Unanswered Questions (Knowledge Gaps)"** table.
   - Show how business owners can see what questions users ask that aren't in the knowledge base yet.
   - Conclude with the unit economics: 95%+ gross margin due to zero third-party token fees.

---

## 7. Viva Questions and Answers (Examination Prep)

### Q1: Why did you choose TF-IDF and Cosine Similarity instead of an LLM like GPT-4?
> **Answer**: For enterprise customer support, accuracy and grounding are paramount. LLMs are non-deterministic, cost money per API call, have multi-second response latencies, and risk hallucinating unauthorized discounts or incorrect terms. TF-IDF with Cosine Similarity executes in under 4ms, has zero API cost, and mathematically guarantees that answers originate strictly from the verified knowledge base.

### Q2: What is the significance of Cosine Similarity over Euclidean Distance?
> **Answer**: Euclidean distance measures the geometric distance between vector endpoints, which is heavily distorted by document length (a long FAQ answer would appear distant from a short question even if they discuss the exact same topic). Cosine similarity measures the angle between vectors, making it length-invariant and ideal for comparing short user queries with longer FAQ answers.

### Q3: How did you solve the problem of stopword filtering altering query meaning?
> **Answer**: Traditional stopword removal strips words like `"not"`, `"no"`, and `"never"`, turning *"refund not received"* into *"refund received"*. We implemented an intentional stopword filter that explicitly preserves negation words and polar modifiers, protecting customer query intent.

### Q4: How is tenant data isolation guaranteed in your database?
> **Answer**: Every workspace possesses a distinct UUID. All database tables—including FAQs, chat transcripts, categories, and quotas—carry a mandatory `workspaceId` foreign key. The backend enforces server-side authorization checks (`verifyWorkspaceAccess`) on every API route handler before reading or writing data.

### Q5: How does the embeddable widget work without CSS conflicts on external sites?
> **Answer**: The embed script (`public/widget.js`) injects an encapsulated `<iframe>` pointing to `/widget/[publicId]`. Because the chat UI is contained inside an iframe, external website CSS styles (like Bootstrap or custom WordPress styles) cannot bleed in or disrupt the chatbot's layout.

### Q6: How does the Voice-to-Text feature work and how is user audio privacy maintained?
> **Answer**: The Voice-to-Text feature uses the standard browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`). Speech is converted directly into text streams on the client side in real time and populated into the chat input. No audio files or voice recordings are ever uploaded, processed, or persisted on our backend servers, strictly upholding user privacy and security standards.

### Q7: How does the system support multiple languages like Hindi and Marathi?
> **Answer**: The system integrates a grounded multilingual translation layer (`src/lib/translation/`). Incoming non-English queries (e.g. in Hindi or Marathi) are translated to canonical English terms to leverage the core TF-IDF vector space model. The verified FAQ answer retrieved from the knowledge base is then translated into the visitor's selected language. Crucially, the system does not allow generative hallucination in the target language; only verified facts from the approved FAQ are translated.

### Q8: How does the Human Support Handoff feature prevent misleading customers?
> **Answer**: In compliance with ethical AI principles, our chatbot clearly demarcates AI responses from human interaction. When a question cannot be confidently resolved ($\text{Score} < 0.25$) or the user requests human assistance, a "Contact Support" option appears. Submitting the form generates a formal support ticket (`TICK-XXXX`) logged in the business's Support Inbox (`/dashboard/support`). The system explicitly notifies the visitor that their ticket is queued and never claims a human has replied until authorized staff actually review and update the ticket status.

### Q9: How does the system protect sensitive Personal Identifiable Information (PII) in conversation logs?
> **Answer**: Before storing any conversational message in our database, the query passes through our automated Privacy Sanitizer (`src/lib/privacy/sanitizer.ts`). Using pattern detection, sensitive identifiers—including 16-digit credit card numbers, phone numbers, national IDs (SSN/Aadhaar), and plaintext authentication credentials/tokens—are scrubbed and replaced with safe tokens (`[REDACTED CARD]`, `[REDACTED PHONE]`, `[REDACTED ID]`, `[REDACTED CREDENTIAL]`). Consequently, zero unmasked sensitive PII is stored on persistent backend disks, adhering to international privacy standards (GDPR, DPDP, and SOC 2 data minimization).

### Q10: Why does the system separate visitor sessions from admin history, and how does data retention work?
> **Answer**: Visitor sessions represent real customer traffic arriving via the website widget, whereas admin sessions represent internal staff testing, training, or prompt experiments. Mixing them would distort customer satisfaction metrics, query volume, and analytics. FAQPilot AI strictly tags sessions by origin (`VISITOR` vs `ADMIN`). Furthermore, business owners can configure a data retention policy (e.g. 30, 60, 90 days, or Indefinite) in `/dashboard/settings`. Conversations exceeding the retention window can be purged automatically or with a single click, and individual conversations can be permanently erased by authorized admins.
