# FAQPilot AI: API Documentation & Reference

This document provides complete request and response schemas, authentication requirements, and status codes for all RESTful API endpoints.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates a user with email and password, returning user info and setting an HTTP-only session cookie.

**Request Body**:
```json
{
  "email": "demo@faqpilot.ai",
  "password": "demo1234"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "usr_demo_admin",
    "email": "demo@faqpilot.ai",
    "name": "Alex Rivera",
    "role": "OWNER"
  },
  "workspaces": [
    {
      "id": "ws_technova_demo",
      "name": "Sahayak AI"
    }
  ]
}
```

---

### `POST /api/auth/register`
Creates a new account and automatically provisions an isolated workspace.

**Request Body**:
```json
{
  "name": "Sarah Connor",
  "email": "sarah@apex.edu",
  "password": "secretpassword",
  "workspaceName": "Apex Institute"
}
```

---

### `POST /api/auth/logout`
Clears the session cookie and signs the user out.

---

## 2. Core Chat & NLP Retrieval Endpoints

### `POST /api/chat`
The main query matching endpoint. Validates the query, calculates cosine similarity across active FAQs in the workspace, measures latency, records the interaction, and returns the grounded answer or safe fallback.

**Request Body**:
```json
{
  "workspaceId": "ws_technova_demo",
  "query": "What is your refund policy?",
  "sessionId": "sess_12345",
  "channel": "DASHBOARD"
}
```

**Response (200 OK - Match Found)**:
```json
{
  "success": true,
  "messageId": "msg_9876",
  "sessionId": "sess_12345",
  "answer": "You can cancel your subscription at any time directly from the Settings page. We offer a full 14-day money-back guarantee on all paid plans...",
  "confidence": 0.57,
  "isFallback": false,
  "latencyMs": 3,
  "sourceQuestion": "What is your refund and cancellation policy?",
  "alternativeFaqs": [
    {
      "id": "faq_1",
      "question": "What subscription pricing plans do you offer?",
      "confidence": 0.28
    }
  ]
}
```

**Response (200 OK - Fallback Triggered)**:
```json
{
  "success": true,
  "messageId": "msg_9877",
  "sessionId": "sess_12345",
  "answer": "I couldn't find a reliable answer in this business's knowledge base. Please contact the business directly or try asking your question another way.",
  "confidence": 0.08,
  "isFallback": true,
  "latencyMs": 2
}
```

---

### `POST /api/chat/feedback`
Records visitor satisfaction rating (Helpful / Unhelpful) for quality auditing.

**Request Body**:
```json
{
  "messageId": "msg_9876",
  "workspaceId": "ws_technova_demo",
  "rating": "HELPFUL",
  "comment": "Very accurate answer!"
}
```

---

## 3. Knowledge Base & FAQ Management

### `GET /api/workspaces/:id/faqs`
Retrieves all FAQs in a workspace with optional filters.
- Query parameters:
  - `search`: string
  - `categoryId`: string
  - `enabledOnly`: boolean (`true` | `false`)

### `POST /api/workspaces/:id/faqs`
Creates a new FAQ in the workspace.
- Enforces duplicate question detection.

**Request Body**:
```json
{
  "question": "Do you accept PayPal?",
  "answer": "Yes, PayPal is accepted on all annual tiers.",
  "categoryId": "cat_billing",
  "tags": ["paypal", "payment", "billing"],
  "isEnabled": true
}
```

### `PUT /api/workspaces/:id/faqs` (Bulk CSV Import)
Imports an array of FAQs in bulk.

---

## 4. Public Widget Endpoints

### `GET /api/widget/:publicId/config`
Public endpoint returning widget theme color, bot name, and starter suggestions. Includes CORS headers (`Access-Control-Allow-Origin: *`).

### `POST /api/widget/:publicId/chat`
Public endpoint for embedded website widgets. Validates quota, runs NLP matching, and returns the response with CORS enabled.

---

## 5. Human Support Handoff Endpoints

### `POST /api/support-requests`
Public endpoint for visitors to submit a support escalation ticket. Validates email format and workspace association.

**Request Body**:
```json
{
  "workspaceId": "ws_technova_demo",
  "question": "Can I get an educational discount for a high school coding club?",
  "visitorName": "Jordan Lee",
  "visitorEmail": "jordan@example.org",
  "priority": "NORMAL"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "ticketId": "TICK-9821",
  "message": "Your support request has been created. A support specialist will follow up at jordan@example.org."
}
```

---

### `GET /api/workspaces/:id/support-tickets`
Authenticated endpoint for business staff to list workspace support tickets and aggregated status counters.
- Query parameters:
  - `status`: string (`ALL` | `OPEN` | `IN_PROGRESS` | `RESOLVED`)
  - `search`: string (filters across visitor name, email, or question text)

**Response (200 OK)**:
```json
{
  "success": true,
  "tickets": [ ... ],
  "stats": {
    "total": 5,
    "open": 2,
    "inProgress": 1,
    "resolved": 2
  }
}
```

---

### `PATCH /api/workspaces/:id/support-tickets/:ticketId`
Authenticated endpoint for business staff to update ticket status or add resolution notes.

**Request Body**:
```json
{
  "status": "RESOLVED",
  "staffNotes": "Emailed education pricing package directly."
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "ticket": { ... }
}
```

---

## 6. Chat History & Retention Endpoints

### `GET /api/workspaces/:id/conversations`
Authenticated endpoint to retrieve paginated conversational transcripts with keyword search and filtering.
- Query parameters:
  - `sessionType`: `'ALL'` | `'VISITOR'` | `'ADMIN'`
  - `status`: `'ALL'` | `'RESOLVED'` | `'FALLBACK'` | `'ACTIVE'`
  - `search`: string (matches titles, messages, snippets, or visitor IDs)
  - `startDate`: ISO 8601 string
  - `endDate`: ISO 8601 string
  - `page`: integer (default `1`)
  - `limit`: integer (default `10`)

**Response (200 OK)**:
```json
{
  "success": true,
  "sessions": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 6,
    "totalPages": 1
  },
  "stats": {
    "total": 6,
    "visitorCount": 4,
    "adminCount": 2,
    "fallbackCount": 1,
    "resolvedCount": 5
  }
}
```

---

### `GET /api/workspaces/:id/conversations/:sessionId`
Authenticated endpoint to retrieve full conversation details and ordered message records.

**Response (200 OK)**:
```json
{
  "success": true,
  "session": {
    "id": "sess_seed_1",
    "title": "Pricing Plans & Tier Inquiries",
    "channel": "WIDGET",
    "sessionType": "VISITOR",
    "status": "RESOLVED",
    "messageCount": 2,
    "createdAt": "2026-09-23T05:00:00.000Z"
  },
  "messages": [
    {
      "id": "msg_seed_1a",
      "role": "USER",
      "content": "What pricing plans do you offer?",
      "hasPii": false,
      "createdAt": "2026-09-23T05:00:00.000Z"
    },
    {
      "id": "msg_seed_1b",
      "role": "ASSISTANT",
      "content": "We offer three transparent subscription tiers...",
      "similarityScore": 0.88,
      "latencyMs": 3,
      "createdAt": "2026-09-23T05:00:00.500Z"
    }
  ]
}
```

---

### `DELETE /api/workspaces/:id/conversations/:sessionId`
Authenticated endpoint for workspace OWNER, ADMIN, or EDITOR to permanently delete a conversation session and all its messages.

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Conversation and all associated message records deleted successfully."
}
```

---

### `GET /api/workspaces/:id/retention`
Retrieves current data retention settings and count of purgeable expired sessions.

**Response (200 OK)**:
```json
{
  "success": true,
  "retentionDays": 90,
  "purgeableCount": 0,
  "policyLabel": "90 Days"
}
```

---

### `POST /api/workspaces/:id/retention`
Updates the data retention policy duration or triggers an immediate purge of expired records.

**Request Body**:
```json
{
  "retentionDays": 60,
  "triggerPurge": true
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "retentionDays": 60,
  "purged": {
    "deletedSessions": 2,
    "deletedMessages": 4
  },
  "message": "Purged 2 expired conversations and 4 messages older than 60 days."
}
```
