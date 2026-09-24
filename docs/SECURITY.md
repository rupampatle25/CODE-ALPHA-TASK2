# FAQPilot AI: Security Policy & Threat Mitigation Guide

This document details the cybersecurity measures, threat models, and privacy controls implemented in **FAQPilot AI**.

---

## 1. Implemented Security Controls

### A. Authentication & Session Integrity
- **Password Hashing**: Stored passwords are salted and hashed using `bcrypt` (10 rounds). Plaintext passwords are never logged, stored, or exposed.
- **HMAC-SHA256 Signed Tokens**: Session payloads are cryptographically signed using Web Crypto HMAC-SHA256 with timing-safe comparison to prevent signature forgery and timing attacks.
- **HTTP-Only Cookies**: Session cookies are configured with `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) to prevent access by malicious client-side scripts (XSS).

### B. Multi-Tenant Authorization & Isolation
- **Tenant Verification Guard**: The backend strictly validates `verifyWorkspaceAccess(userId, workspaceId)` on every route handler. User session tokens are compared against workspace member records.
- **Tenant Scope Enforcement**: Database queries always partition data by `workspaceId`. A tenant cannot access, view, or modify another organization's FAQs or chat transcripts.

### C. Public Widget Security & Abuse Prevention
- **Separate Public Identifier**: The embeddable widget uses a dedicated `publicId` (e.g. `tn-public-bot-982`). Private workspace UUIDs, database credentials, and secret keys are never exposed in `<script>` tags.
- **Configurable Domain Allowlist**: Widget configs include `allowedDomains` to prevent unauthorized domain impersonation.
- **Quota & Rate Limiting**: Workspaces are bounded by `monthlyLimit` quotas to protect against runaway scraping or spam traffic.

### D. Input Sanitization & Anti-Hallucination
- **Text Length Bounds**: User queries are capped at 500 characters to prevent buffer overloads and regex DoS attacks.
- **Zero Hallucination Guardrail**: The system uses grounded mathematical retrieval rather than unconstrained generative models, preventing prompt-injection attacks from extracting or spoofing proprietary business policies.

---

## 2. Threat Modeling & Risk Matrix

| Threat | Impact | Mitigation Implemented |
|---|---|---|
| **Cross-Tenant Data Leak** | Critical | Server-side workspace ownership checks on all endpoints. |
| **Brute Force Login** | High | Rate-limiting ready; bcrypt exponential salt cost. |
| **SQL/NoSQL Injection** | High | Structured repository pattern with parameter binding. |
| **Prompt Injection** | Medium | Chatbot retrieves only approved FAQ text, no raw execution. |
| **DDoS / Traffic Spike** | Medium | Per-workspace monthly quota tracking (`UsageQuota`). |

---

## 3. Security Verification Checklist

- [x] Passwords hashed with bcrypt before disk persistence.
- [x] Public widget key decoupled from private workspace UUID.
- [x] Session tokens signed with HMAC-SHA256 and expiration verified.
- [x] All tenant read/write operations strictly check `workspaceId`.
- [x] Input lengths bounded on `/api/chat` and `/api/widget/[publicId]/chat`.
