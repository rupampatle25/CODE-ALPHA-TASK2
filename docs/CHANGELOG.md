# FAQPilot AI: Changelog

All notable changes and architectural milestones for **FAQPilot AI** are documented here.

---

## [1.4.0] - 2026-09-23: Secure Chat History, PII Protection & Data Retention

### Added
- **Secure Chat History Dashboard (`/dashboard/conversations`)**:
  - Two-column master-detail conversational audit interface for authenticated workspace users.
  - KPI cards tracking Total Conversations, Website Visitor Sessions, Staff Admin Preview Tests, and Fallback Rate.
  - Interactive transcript viewer with message timestamps, role indicators, matched FAQ citations, confidence scores, and latency metrics.
- **Visitor vs. Admin Session Separation**:
  - Clear taxonomy separating customer website widget traffic (`channel: 'WIDGET'`, `sessionType: 'VISITOR'`) from internal staff tests (`channel: 'DASHBOARD' | 'TEST'`, `sessionType: 'ADMIN'`).
  - Segmented tab switcher to filter between *All Conversations*, *Visitor Sessions*, and *Admin Testing*.
- **Automated PII Detection & Redaction Engine (`src/lib/privacy/sanitizer.ts`)**:
  - Client-side and server-side automated scrubbing of credit/debit card numbers (`[REDACTED CARD]`), phone numbers (`[REDACTED PHONE]`), national IDs (`[REDACTED ID]`), and plaintext credentials/tokens (`[REDACTED CREDENTIAL]`).
  - Guaranteed zero unmasked sensitive PII persisted to backend disks.
- **Smart Conversation Title Generation**:
  - Automated extraction of clean, readable conversation titles from initial user queries.
- **Search, Multi-Filter & Server-Side Pagination**:
  - Full-text search across titles, message contents, snippets, and visitor IDs.
  - Date filtering (`All Time`, `Today`, `Last 7 Days`, `Last 30 Days`) and status filtering (`All`, `Resolved`, `Fallback`, `Active`).
  - 10-per-page pagination with total counts and previous/next navigation.
- **Configurable Data Retention & Safe Deletion**:
  - Configurable retention window (30, 60, 90, 180, 365 days, or Indefinite) in `/dashboard/settings`.
  - On-demand "Purge Expired" button with confirmation alert.
  - Per-session permanent delete option with safety confirmation modal.
- **RESTful Chat History API**:
  - `GET /api/workspaces/:id/conversations` (paginated list with filters and KPI stats)
  - `GET /api/workspaces/:id/conversations/:sessionId` (full transcript)
  - `DELETE /api/workspaces/:id/conversations/:sessionId` (permanent deletion)
  - `GET` & `POST /api/workspaces/:id/retention` (policy retrieval, update, and manual purge)

---

## [1.3.0] - 2026-09-23: Human Support Handoff & Helpdesk Inbox

### Added
- **Automated & On-Demand Human Handoff**:
  - Automatically surfaces a **"Contact Support"** action button whenever the chatbot cannot find a reliable FAQ match (score < threshold) or when user query conveys handoff intent ("talk to human", "agent", "support team").
  - Persistent header button allowing visitors to request human escalation at any point in the conversation.
- **Support Request Modal & Visitor Validation**:
  - Modal collecting visitor query, full name, email (with regex validation), and priority level (`LOW`, `NORMAL`, `HIGH`, `URGENT`).
  - Privacy-preserving architecture: clearly explains how visitor details are used, does not claim a human has replied until actual staff action occurs, and assigns unique ticket tracking IDs (`TICK-XXXX`).
- **Staff Helpdesk Inbox (`/dashboard/support`)**:
  - Dedicated business dashboard tab displaying real-time metrics (Total Tickets, Open, In Progress, Resolved).
  - Filterable by status tabs (`ALL`, `OPEN`, `IN_PROGRESS`, `RESOLVED`) and searchable by visitor name, email, or query text.
  - Interactive Resolution Modal for staff to review visitor question, change ticket status, and attach internal staff notes.
- **Enterprise Multi-Tenant Data Layer**:
  - `SupportTicket` schema in `types.ts` with `workspaceId` partition.
  - Public submission endpoint `POST /api/support-requests`.
  - Protected staff endpoints `GET /api/workspaces/[id]/support-tickets` and `PATCH /api/workspaces/[id]/support-tickets/[ticketId]`.

---

## [1.2.0] - 2026-09-23: Multilingual Support (English, Hindi, Marathi)

### Added
- **Multi-Language Dropdown Selector**:
  - Interactive language switcher in `ChatWindow` supporting English (`en`), Hindi (`hi`), and Marathi (`mr`).
  - Dynamically switches Web Speech API recognition locale (`en-US`, `hi-IN`, `mr-IN`) for voice-to-text.
- **Grounded Translation Engine**:
  - Bidirectional translation layer for user queries and FAQ answers.
  - Pre-seeded high-accuracy dictionary preserving technical and product terms.
  - Grounded in verified FAQ answers: only verified business information is translated.

---

## [1.1.0] - 2026-09-23: Voice-to-Text Integration

### Added
- **Browser Web Speech API Integration**:
  - Added microphone button inside `ChatWindow` for speech-to-text input.
  - Real-time transcript generation placing recognized words into chat input.
  - Visual recording feedback: pulsating microphone button and top listening banner.
  - Comprehensive microphone permission handling (`not-allowed`, `no-speech`, `audio-capture`).
  - Browser compatibility fallback detection for non-supported browsers.
  - Privacy-preserving architecture: zero audio stored on servers.

---

## [1.0.0] - 2026-09-23: Production Release

### Added
- **Core NLP Engine (Academic Task 2)**:
  - Text normalization, case folding, and contraction expansion.
  - Smart tokenization with negation-preserving stopword filtering (`not`, `no`, `never`, `cannot`).
  - Smoothed TF-IDF vector space model (`computeTfIdfVector`).
  - Mathematical vector cosine similarity calculator (`calculateCosineSimilarity`).
  - Multi-signal scoring combining cosine similarity, Jaccard token overlap, and Levenshtein fuzzy typo tolerance.
  - Configurable confidence threshold guardrail (`DEFAULT_CONFIDENCE_THRESHOLD = 0.25`) with grounded safe fallback.
- **Academic Benchmark Suite**:
  - Automated evaluation script (`evaluation/run_eval.ts`) achieving 92.3% in-domain accuracy and 100% out-of-domain fallback rejection across 17 test queries.
  - Standalone Python reference script (`evaluation/nlp_baseline.py`) for college viva and lab demonstrations.
- **Multi-Tenant SaaS Architecture**:
  - Isolated workspace data partitioning with `workspaceId` enforcement.
  - Secure bcrypt password hashing and HMAC-SHA256 session token management.
  - Role-based access control (`OWNER`, `ADMIN`, `EDITOR`, `VIEWER`).
- **Knowledge Base Management**:
  - Full CRUD operations for FAQs (Question, Answer, Category, Tags, Status).
  - Bulk CSV import parser with client-side preview and duplicate question detection.
  - CSV export functionality.
- **Conversational UI & Embeddable Widget**:
  - Responsive, modern `ChatWindow` component with user/bot bubbles, typing indicator, and suggestion chips.
  - Visitor feedback rating (Thumbs up / Thumbs down).
  - Source attribution and latency display.
  - Standalone embed script (`public/widget.js`) with responsive floating launcher and iframe modal.
  - Public widget endpoints with CORS headers enabled.
- **Analytics & Settings Dashboard**:
  - Real-time KPI metrics (Total queries, Resolution rate, Satisfaction %, Avg latency).
  - Knowledge Gap tracker identifying unanswered fallback queries.
  - Live chatbot appearance customizer (Color swatches, Bot name, Welcome message).
  - Subscription quota meters and simulated upgrade workflow.
