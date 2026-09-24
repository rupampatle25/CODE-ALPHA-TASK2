# FAQPilot AI: System Architecture & Technical Specification

This document details the high-level architecture, subsystem boundaries, data flows, and mathematical algorithms underpinning **FAQPilot AI**.

---

## 1. High-Level Architectural Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Touchpoints"]
        A1["Landing Page & Preview"]
        A2["SaaS Dashboard (React / Tailwind)"]
        A3["External Website (widget.js + iframe)"]
    end

    subgraph SecurityLayer ["Security & Routing Layer"]
        B1["Next.js Route Handlers (/api/*)"]
        B2["HMAC Session Authenticator"]
        B3["Workspace RBAC & Tenant Isolation Guard"]
        B4["Public Widget CORS & Rate Limiter"]
    end

    subgraph NLPLayer ["NLP Retrieval Engine (Core Task 2)"]
        C1["Query Normalization & Contraction Expansion"]
        C2["Tokenization & Negation-Preserving Filter"]
        C3["TF-IDF Vector Space Model"]
        C4["Cosine Similarity & Levenshtein Scorer"]
        C5{"Score >= Threshold?"}
        C6["Return Approved FAQ Answer + Source"]
        C7["Trigger Safe Grounded Fallback"]
    end

    subgraph PersistenceLayer ["Data Persistence"]
        D1["Multi-Tenant Database Store"]
        D2["Event Analytics & Feedback Log"]
    end

    A1 --> B1
    A2 --> B2 --> B3 --> B1
    A3 --> B4 --> B1
    B1 --> C1 --> C2 --> C3 --> C4 --> C5
    C5 -- "Yes (Score >= 0.25)" --> C6 --> D2
    C5 -- "No (Score < 0.25)" --> C7 --> D2
    B3 --> D1
    C3 -.-> D1
```

---

## 2. The Core NLP Retrieval Pipeline

The NLP retrieval engine fulfills the college assignment requirements through a deterministic, transparent pipeline that avoids LLM hallucinations.

### Step 1: Text Cleaning & Normalization
- **Contraction Expansion**: Normalizes abbreviations (`can't` $\to$ `cannot`, `i'm` $\to$ `i am`).
- **Symbol Stripping**: Removes non-alphanumeric noise while preserving single spaces.
- **Case Folding**: Converts all text to lowercase.

### Step 2: Smart Tokenization & Negation Preservation
Standard NLP implementations remove all stopwords indiscriminately. In customer support, naive stopword removal destroys query polarity:
- *Query*: *"Why is my refund not processed?"*
- *Naive Stopwords*: *"refund processed"* $\implies$ completely reverses intent!

**Innovation**: FAQPilot AI uses a curated stopword set that **strictly retains negation words** (`not`, `no`, `never`, `cannot`, `without`, `none`).

### Step 3: TF-IDF Vector Space Model
Each document $d$ and query $q$ is converted into an $n$-dimensional real-valued vector:

$$\text{TF}(t, d) = \frac{\text{count}(t, d)}{|d|}$$

$$\text{IDF}(t) = \ln\left(\frac{1 + N}{1 + \text{df}(t)}\right) + 1$$

$$\vec{v}[t] = \text{TF}(t, d) \times \text{IDF}(t)$$

### Step 4: Vector Cosine Similarity
Calculates the angular difference between user query vector $\vec{u}$ and candidate FAQ vector $\vec{v}$:

$$\text{CosineSimilarity}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2} = \frac{\sum_{i=1}^n u_i v_i}{\sqrt{\sum_{i=1}^n u_i^2} \sqrt{\sum_{i=1}^n v_i^2}}$$

### Step 5: Multi-Signal Composite Scoring
To tolerate user typos and short queries, FAQPilot AI computes a composite score:

$$\text{Score} = 0.60 \times \text{Cosine}(\vec{u}, \vec{v}) + 0.20 \times \text{Jaccard}(u, v) + 0.20 \times \text{Fuzzy}(u, v)$$

Where $\text{Fuzzy}$ uses Levenshtein edit distance ($d \le 2$).

### Step 6: Confidence Threshold Guardrail
- If $\text{Score} \ge 0.25$: Return verified FAQ answer with source attribution and latency.
- If $\text{Score} < 0.25$: Trigger the safe fallback:
  > *"I couldn't find a reliable answer in this business's knowledge base. Please contact the business directly or try asking your question another way."*

---

## 3. Multi-Tenant Data Isolation

Tenant isolation is strictly maintained at the software and database layer:
1. Every business organization is given an isolated `Workspace` record.
2. All database entities (`Faq`, `FaqCategory`, `ChatSession`, `ChatMessage`, `WidgetConfig`, `UsageQuota`, `SupportTicket`) contain an indexed `workspaceId` foreign key.
3. Every API endpoint enforces `verifyWorkspaceAccess(userId, workspaceId)`.
4. Tenant data is queried exclusively using `{ workspaceId }` filtering.

---

## 4. Grounded Multilingual Translation Architecture

To ensure high reliability without third-party generative hallucination:
1. **Visitor Language Selection**: Chat UI accepts `en` (English), `hi` (Hindi), and `mr` (Marathi).
2. **Speech Recognition Synchronization**: Setting `recognition.lang = 'hi-IN'` or `'mr-IN'` enables native phonetic input.
3. **Query Canonicalization**: Input queries are normalized and matched against canonical dictionary terms before TF-IDF vectorization.
4. **Answer Grounding**: Only verified answers retrieved from the workspace knowledge base are translated into the target language.

---

## 5. Human Support Handoff & Helpdesk Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Website Visitor
    participant Chat as Chatbot UI (ChatWindow)
    participant API as Public API (/api/support-requests)
    participant Store as Data Store (supportTicketRepo)
    actor Staff as Authorized Business Staff
    participant Dash as Support Dashboard (/dashboard/support)

    Visitor->>Chat: Asks ambiguous question / Requests agent
    Chat->>Chat: Fallback triggered (Score < 0.25)
    Chat-->>Visitor: Displays answer fallback + "Contact Support" button
    Visitor->>Chat: Clicks "Contact Support" & submits form (Name, Email, Priority)
    Chat->>API: POST /api/support-requests
    API->>Store: Create ticket (status: OPEN, id: TICK-XXXX)
    API-->>Chat: Returns ticket tracking ID
    Chat-->>Visitor: Renders confirmation message with ticket ID
    Staff->>Dash: Accesses /dashboard/support
    Dash->>Store: GET /api/workspaces/[id]/support-tickets
    Staff->>Dash: Reviews ticket, updates status (IN_PROGRESS / RESOLVED) & adds staff note
    Dash->>Store: PATCH /api/workspaces/[id]/support-tickets/[id]
```

### Key Principles:
1. **Zero Hallucinated Human Interaction**: The system never fakes a live response. It acknowledges ticket receipt and informs the visitor when actual staff review will occur.
2. **Multi-Tenant Ticket Partitioning**: All tickets are stored with `workspaceId` and are accessible solely to authenticated business members.
3. **Visitor Privacy Protection**: Forms collect minimal data (optional name, validated email) and clearly communicate data handling.

---

## 6. Secure Chat History, PII Protection & Data Retention Architecture

```mermaid
flowchart TD
    subgraph Ingestion ["1. Query Ingestion & PII Scrubbing"]
        Q["User / Visitor Query"] --> PII{"PII Sanitizer\n(Regex Card/Phone/ID/Tokens)"}
        PII -- "Sensitive Patterns Found" --> RED["Mask Token:\n[REDACTED CARD / PHONE / ID]"]
        PII -- "No Sensitive Data" --> RAW["Unchanged Text"]
        RED --> NLP["NLP Retrieval & Grounding"]
        RAW --> NLP
    end

    subgraph Storage ["2. Multi-Tenant Storage Partitioning"]
        NLP --> MSG["Persist to chatMessages\n(with hasPii flag)"]
        MSG --> SESS["Update chatSessions\n(sessionType: VISITOR | ADMIN,\ntitle, snippet, status)"]
    end

    subgraph Retention ["3. Lifecycle & Retention Enforcement"]
        SESS --> RET{"Age > retentionDays?"}
        RET -- "Yes" --> PURGE["Auto or Manual Purge\n(Permanently erase session + messages)"]
        RET -- "No" --> AUDIT["Auditable in /dashboard/conversations"]
    end
```

### Privacy & Compliance Guarantees:
1. **Pre-Persistence Redaction**: Sensitive personal data (credit card numbers, telephone digits, national identifiers, passwords/keys) is scrubbed **before** write operations. Disks never store plaintext credentials.
2. **Session Origin Isolation**: Website visitor interactions (`WIDGET` / `VISITOR`) are partitioned from internal staff testing (`DASHBOARD` / `ADMIN`), preventing diagnostic queries from polluting customer analytics.
3. **Configurable Lifecycle Management**: Business owners define retention policies (30, 60, 90, 180, 365 days, or Indefinite) in `/dashboard/settings`. Expired records can be purged on demand or automatically.
4. **Authorized Cryptographic Deletion**: Workspace owners and administrators retain the cryptographic right to permanently delete conversation transcripts (`DELETE /api/workspaces/:id/conversations/:sessionId`), honoring the GDPR/DPDP "Right to Erasure".
