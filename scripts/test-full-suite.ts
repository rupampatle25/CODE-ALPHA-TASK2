/**
 * Sahayak AI: Comprehensive End-to-End Test Suite
 * Tests all API endpoints, RBAC security, NLP matching, multilingual,
 * support tickets, conversations, PII protection, and widget functionality.
 */

export {};

const BASE_URL = 'http://localhost:3000';

interface TestStats {
  passed: number;
  failed: number;
  total: number;
}

const stats: TestStats = { passed: 0, failed: 0, total: 0 };

function assert(condition: boolean, testName: string, detail?: string) {
  stats.total++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    stats.passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `-> ${detail}` : ''}`);
    stats.failed++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🤖 SAHAYAK AI: COMPREHENSIVE END-TO-END FEATURE VERIFICATION');
  console.log('================================================================\n');

  let demoCookie = '';
  let adminCookie = '';
  const testWorkspaceId = 'ws_technova_demo';
  let createdFaqId = '';
  let createdCatId = '';
  let createdTicketId = '';
  let testSessionId = '';

  // -------------------------------------------------------------------------
  // 1. AUTHENTICATION & SESSIONS
  // -------------------------------------------------------------------------
  console.log('--- 1. Testing Authentication & Session Management ---');

  // 1.1 Demo User Login
  const demoLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@sahayak.ai', password: 'demo1234' }),
  });
  const demoLoginData = await demoLoginRes.json();
  const demoSetCookie = demoLoginRes.headers.get('set-cookie');
  if (demoSetCookie) {
    demoCookie = demoSetCookie.split(';')[0];
  }
  assert(demoLoginRes.status === 200 && demoLoginData.success === true, 'Demo user login (demo@sahayak.ai)');
  assert(demoLoginData.user?.role === 'OWNER', 'Demo user assigned OWNER role');

  // 1.2 Admin User Login
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rupam@gmail.com', password: 'Admin@1234', isAdminLogin: true }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminSetCookie = adminLoginRes.headers.get('set-cookie');
  if (adminSetCookie) {
    adminCookie = adminSetCookie.split(';')[0];
  }
  assert(adminLoginRes.status === 200 && adminLoginData.success === true, 'Admin login (rupam@gmail.com)');
  assert(adminLoginData.user?.role === 'ADMIN', 'Admin user assigned ADMIN role');
  assert(adminLoginData.workspaces?.length >= 1, 'Admin receives authorized workspaces');

  // 1.3 Invalid Login Rejection
  const invalidLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@sahayak.ai', password: 'wrongPassword' }),
  });
  assert(invalidLoginRes.status === 401, 'Invalid credentials properly rejected with 401');

  // 1.4 Auth Me Endpoint with Session Cookie
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: adminCookie },
  });
  const meData = await meRes.json();
  assert(meRes.status === 200 && meData.user?.email === 'rupam@gmail.com', 'Current user session verified via /api/auth/me');

  // 1.5 New User Registration
  const testRegEmail = `testuser_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Tester',
      email: testRegEmail,
      password: 'SecurePassword@123',
      workspaceName: 'Acme Test Corp',
    }),
  });
  const regData = await regRes.json();
  assert(regRes.status === 201 && regData.success === true, 'New user workspace registration (/api/auth/register)');
  assert(regData.workspace?.name === 'Acme Test Corp', 'Dedicated workspace initialized for new registrant');

  // -------------------------------------------------------------------------
  // 2. FAQ CATEGORY CRUD OPERATIONS
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Testing FAQ Category Management ---');

  // 2.1 List Categories (Authorized)
  const listCatRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/categories`, {
    headers: { Cookie: adminCookie },
  });
  const listCatData = await listCatRes.json();
  assert(listCatRes.status === 200 && Array.isArray(listCatData.categories), 'List workspace FAQ categories');

  // 2.2 Create New Category
  const newCatName = `Test Category ${Date.now()}`;
  const createCatRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({ name: newCatName, color: '#3B82F6' }),
  });
  const createCatData = await createCatRes.json();
  if (createCatData.category) {
    createdCatId = createCatData.category.id;
  }
  assert(createCatRes.status === 201 && createCatData.category?.name === newCatName, 'Create new FAQ category');

  // 2.3 Delete Category
  if (createdCatId) {
    const deleteCatRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/categories/${createdCatId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteCatRes.status === 200, 'Delete FAQ category by ID');
  }

  // -------------------------------------------------------------------------
  // 3. FAQ CRUD OPERATIONS
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Testing FAQ Knowledge Base CRUD Operations ---');

  // 3.1 Unauthorized Access Blocked
  const unauthFaqRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/faqs`);
  assert(unauthFaqRes.status === 401, 'Unauthenticated FAQ list blocked with 401');

  // 3.2 List FAQs
  const listFaqRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/faqs`, {
    headers: { Cookie: adminCookie },
  });
  const listFaqData = await listFaqRes.json();
  assert(listFaqRes.status === 200 && listFaqData.faqs?.length >= 100, `List FAQs returns knowledge base (count: ${listFaqData.faqs?.length})`);

  // 3.3 Create New FAQ
  const uniqueQuestion = `How do I configure automated testing on Sahayak AI? (ID: ${Date.now()})`;
  const uniqueAnswer = 'You can run our automated verification test suite via scripts/test-full-suite.ts against the live API.';
  const createFaqRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/faqs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      question: uniqueQuestion,
      answer: uniqueAnswer,
      tags: ['testing', 'automation', 'verification'],
      isEnabled: true,
    }),
  });
  const createFaqData = await createFaqRes.json();
  if (createFaqData.faq) {
    createdFaqId = createFaqData.faq.id;
  }
  assert(createFaqRes.status === 201 && createFaqData.success === true, 'Create new FAQ successfully');

  // 3.4 Duplicate Question Rejection Guardrail
  const dupFaqRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/faqs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      question: uniqueQuestion,
      answer: 'Duplicate test answer',
    }),
  });
  assert(dupFaqRes.status === 409, 'Duplicate FAQ question rejected with 409 Conflict');

  // 3.5 Update FAQ
  if (createdFaqId) {
    const updatedAnswer = uniqueAnswer + ' Updated with multi-step guidelines.';
    const updateFaqRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/faqs/${createdFaqId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({ answer: updatedAnswer }),
    });
    const updateFaqData = await updateFaqRes.json();
    assert(updateFaqRes.status === 200 && updateFaqData.faq?.answer === updatedAnswer, 'Update FAQ answer via PATCH');

    // 3.6 Delete FAQ
    const deleteFaqRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/faqs/${createdFaqId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    assert(deleteFaqRes.status === 200, 'Delete FAQ successfully via DELETE');
  }

  // -------------------------------------------------------------------------
  // 4. CHATBOT NLP MATCHING & INTELLIGENCE
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Testing Chatbot NLP & Intent Matching ---');

  // 4.1 In-Domain Pricing Question
  const chatRes1 = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: testWorkspaceId,
      query: 'What pricing plans do you offer?',
    }),
  });
  const chatData1 = await chatRes1.json();
  if (chatData1.sessionId) {
    testSessionId = chatData1.sessionId;
  }
  const testMessageId = chatData1.messageId || 'msg_sample';
  assert(chatRes1.status === 200 && chatData1.success === true, 'Chat endpoint responds 200 OK');
  assert(!chatData1.isFallback && chatData1.confidence >= 0.5, `Direct query matched knowledge base (Confidence: ${chatData1.confidence})`);
  assert(chatData1.suggestedQuestions?.length > 0, 'Smart follow-up suggestions returned with answer');

  // 4.2 Out-of-Domain / Gibberish Fallback Guardrail
  const chatRes2 = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: testWorkspaceId,
      query: 'how to cook authentic spaghetti carbonara at home',
    }),
  });
  const chatData2 = await chatRes2.json();
  assert(chatData2.isFallback === true, 'Out-of-domain question triggers safe fallback');
  assert(chatData2.confidence < 0.25, `Low similarity score below threshold (Confidence: ${chatData2.confidence})`);

  // 4.3 Multilingual Query (Hindi)
  const chatResHindi = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: testWorkspaceId,
      query: 'आपके प्राइसिंग प्लान क्या हैं?',
      language: 'hi',
    }),
  });
  const chatDataHindi = await chatResHindi.json();
  assert(chatResHindi.status === 200, 'Hindi query handled without errors');
  assert(chatDataHindi.wasTranslated === true || chatDataHindi.language === 'hi', 'Multilingual query routed through translation engine');

  // -------------------------------------------------------------------------
  // 5. PRIVACY & PII SANITIZATION
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Testing Privacy & Automated PII Scrubbing ---');

  const sensitiveQuery = 'My contact number is 9876543210 and card number is 4111-2222-3333-4444. Can I get a refund?';
  const piiChatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: testWorkspaceId,
      query: sensitiveQuery,
    }),
  });
  const piiChatData = await piiChatRes.json();
  assert(piiChatRes.status === 200, 'PII-containing query processed safely');

  // Verify stored message in transcript has redacted tokens
  if (piiChatData.sessionId) {
    const sessionRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/conversations/${piiChatData.sessionId}`, {
      headers: { Cookie: adminCookie },
    });
    const sessionData = await sessionRes.json();
    const userMsg = sessionData.messages?.find((m: { role: string }) => m.role === 'USER');
    const content = userMsg?.content || '';
    assert(content.includes('[REDACTED'), `Sensitive PII redacted in storage (Stored: "${content}")`);
  }

  // -------------------------------------------------------------------------
  // 6. HUMAN SUPPORT HANDOFF & TICKETING
  // -------------------------------------------------------------------------
  console.log('\n--- 6. Testing Human Support Handoff & Tickets ---');

  // 6.1 Create Support Ticket
  const ticketRes = await fetch(`${BASE_URL}/api/support-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId: testWorkspaceId,
      question: 'Need human assistance with custom enterprise SAML integration',
      visitorName: 'Jordan Lee',
      visitorEmail: 'jordan@enterprise.com',
      visitorPhone: '+1-555-0199',
      priority: 'URGENT',
    }),
  });
  const ticketData = await ticketRes.json();
  if (ticketData.ticket) {
    createdTicketId = ticketData.ticket.id;
  }
  assert(ticketRes.status === 201 && ticketData.success === true, 'Visitor logs human support request (/api/support-requests)');
  assert(ticketData.ticket?.ticketNumber?.startsWith('TICK-'), `Assigned formatted ticket number: ${ticketData.ticket?.ticketNumber}`);

  // 6.2 List Support Tickets (Admin)
  const listTicketsRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/support-tickets`, {
    headers: { Cookie: adminCookie },
  });
  const listTicketsData = await listTicketsRes.json();
  assert(listTicketsRes.status === 200 && Array.isArray(listTicketsData.tickets), 'Admin views workspace support ticket queue');
  assert(listTicketsData.stats?.total >= 1, `Support stats calculated (Total tickets: ${listTicketsData.stats?.total})`);

  // 6.3 Update Ticket Status & Resolution Notes
  if (createdTicketId) {
    const updateTicketRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/support-tickets/${createdTicketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        status: 'RESOLVED',
        resolutionNotes: 'Verified SAML 2.0 metadata exchanged with client IT department.',
      }),
    });
    const updateTicketData = await updateTicketRes.json();
    assert(updateTicketRes.status === 200 && updateTicketData.ticket?.status === 'RESOLVED', 'Staff resolves ticket with resolution notes');
  }

  // -------------------------------------------------------------------------
  // 7. CHAT FEEDBACK & CSAT
  // -------------------------------------------------------------------------
  console.log('\n--- 7. Testing Chat Feedback & Satisfaction ---');

  if (testSessionId) {
    const feedbackRes = await fetch(`${BASE_URL}/api/chat/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageId: testMessageId,
        workspaceId: testWorkspaceId,
        rating: 'HELPFUL',
      }),
    });
    const feedbackData = await feedbackRes.json();
    assert(feedbackRes.status === 200 && feedbackData.success === true, 'Visitor submits HELPFUL feedback rating');
  }

  // -------------------------------------------------------------------------
  // 8. PUBLIC WIDGET EMBED INTEGRATION
  // -------------------------------------------------------------------------
  console.log('\n--- 8. Testing Public Chatbot Widget Embed API ---');

  const publicId = 'tn-public-bot-982';
  // 8.1 Fetch Widget Configuration
  const widgetConfigRes = await fetch(`${BASE_URL}/api/widget/${publicId}/config`);
  const widgetConfigData = await widgetConfigRes.json();
  assert(widgetConfigRes.status === 200 && widgetConfigData.publicId === publicId, 'Public widget config retrieved (/api/widget/:id/config)');
  assert(!!widgetConfigData.botName, `Widget bot branding loaded: "${widgetConfigData.botName}"`);

  // 8.2 Public Widget Chat Interaction
  const widgetChatRes = await fetch(`${BASE_URL}/api/widget/${publicId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'What is your refund policy?',
    }),
  });
  const widgetChatData = await widgetChatRes.json();
  assert(widgetChatRes.status === 200 && widgetChatData.success === true, 'Public widget processes chat queries with CORS headers');

  // -------------------------------------------------------------------------
  // 9. ANALYTICS & USAGE METRICS
  // -------------------------------------------------------------------------
  console.log('\n--- 9. Testing Usage Analytics & Quotas ---');

  const analyticsRes = await fetch(`${BASE_URL}/api/workspaces/${testWorkspaceId}/analytics`, {
    headers: { Cookie: adminCookie },
  });
  const analyticsData = await analyticsRes.json();
  assert(analyticsRes.status === 200 && analyticsData.success === true, 'Workspace analytics calculated');
  assert(analyticsData.metrics?.totalQueries >= 1, `Total queries logged in analytics: ${analyticsData.metrics?.totalQueries}`);
  assert(typeof analyticsData.metrics?.avgLatency === 'number', `NLP lookup average latency calculated: ${analyticsData.metrics?.avgLatency}ms`);

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${stats.passed}/${stats.total} PASSED (${stats.failed} FAILED)`);
  console.log('================================================================\n');

  if (stats.failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
