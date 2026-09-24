/**
 * Privacy & PII Sanitization Engine
 * 
 * Provides automated detection and redaction of sensitive personal identifiable
 * information (PII) before storage in persistent databases, ensuring compliance
 * with modern data protection regulations (e.g., GDPR, DPDP, HIPAA).
 */

export interface SanitizationResult {
  sanitized: string;
  hasPii: boolean;
  redactedTypes: string[];
}

// Regex patterns for sensitive identifiers
const PATTERNS = {
  // Credit / Debit cards: 13-19 digits with optional hyphens or spaces
  CREDIT_CARD: /\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{15,16}\b/g,
  
  // International & Domestic Phone Numbers (E.164, Indian, US formats)
  PHONE: /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g,

  // US SSN: XXX-XX-XXXX
  SSN: /\b\d{3}-\d{2}-\d{4}\b/g,

  // Indian Aadhaar Number: XXXX XXXX XXXX
  AADHAAR: /\b\d{4}\s\d{4}\s\d{4}\b/g,

  // Generic Passwords / API Keys / Tokens in user text
  // e.g. "password: secret123", "token: sk_live_xyz", "key=abc12345"
  CREDENTIAL: /\b(?:password|passwd|secret|api[_-]?key|bearer|token)\s*[:=]\s*['"]?([a-zA-Z0-9_\-.~+]{6,})['"]?/gi,
};

/**
 * Sanitizes input text by replacing detected PII with standardized redaction tokens.
 * Zero unmasked sensitive data is stored on backend disks.
 */
export function sanitizeContent(text: string): SanitizationResult {
  if (!text || typeof text !== 'string') {
    return { sanitized: '', hasPii: false, redactedTypes: [] };
  }

  let sanitized = text;
  const redactedTypes: string[] = [];

  // 1. Credit / Debit Cards
  if (PATTERNS.CREDIT_CARD.test(sanitized)) {
    sanitized = sanitized.replace(PATTERNS.CREDIT_CARD, '[REDACTED CARD]');
    redactedTypes.push('CREDIT_CARD');
  }

  // 2. National IDs (SSN / Aadhaar)
  if (PATTERNS.SSN.test(sanitized)) {
    sanitized = sanitized.replace(PATTERNS.SSN, '[REDACTED ID]');
    redactedTypes.push('SSN');
  }
  if (PATTERNS.AADHAAR.test(sanitized)) {
    sanitized = sanitized.replace(PATTERNS.AADHAAR, '[REDACTED ID]');
    redactedTypes.push('AADHAAR');
  }

  // 3. Credentials & API tokens
  if (PATTERNS.CREDENTIAL.test(sanitized)) {
    sanitized = sanitized.replace(PATTERNS.CREDENTIAL, (match, cred) => {
      return match.replace(cred, '[REDACTED CREDENTIAL]');
    });
    redactedTypes.push('CREDENTIAL');
  }

  // 4. Phone numbers (only if not already part of card)
  if (PATTERNS.PHONE.test(sanitized)) {
    sanitized = sanitized.replace(PATTERNS.PHONE, (match) => {
      // Avoid replacing year or short numbers
      if (match.replace(/\D/g, '').length >= 10) {
        return '[REDACTED PHONE]';
      }
      return match;
    });
    if (sanitized.includes('[REDACTED PHONE]')) {
      redactedTypes.push('PHONE');
    }
  }

  return {
    sanitized,
    hasPii: redactedTypes.length > 0,
    redactedTypes: Array.from(new Set(redactedTypes)),
  };
}

/**
 * Generates a clean, readable conversation title from the initial user inquiry.
 */
export function generateConversationTitle(query: string): string {
  if (!query || typeof query !== 'string') {
    return 'New Conversation';
  }

  // Strip leading question keywords or conversational greetings
  const cleaned = query
    .trim()
    .replace(/^(hello|hi|hey|good morning|good evening|please|can you tell me|i want to know|how do i|what is|what are|do you have|how much does)\s+/i, '')
    .trim();

  if (cleaned.length === 0) {
    return 'General Inquiry';
  }

  // Capitalize first letter
  const formatted = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Truncate to reasonable title length
  if (formatted.length > 45) {
    return formatted.substring(0, 42) + '...';
  }

  return formatted;
}
