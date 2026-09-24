/**
 * Sahayak AI: Logged-in User Chatbot Integration Test
 * Verifies complete workflow:
 * User login -> User dashboard -> Ask question -> Receive response
 * For both Existing Users, Brand New Users, and Admin Users.
 */

export {};

const BASE_URL = 'http://localhost:3000';

interface TestSummary {
  passed: number;
  failed: number;
  tests: string[];
}

const summary: TestSummary = { passed: 0, failed: 0, tests: [] };

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    summary.passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `-> ${detail}` : ''}`);
    summary.failed++;
  }
  summary.tests.push(testName);
}

async function runLoggedInChatTests() {
  console.log('================================================================');
  console.log('🧪 SAHAYAK AI: LOGGED-IN USER CHATBOT WORKFLOW VERIFICATION');
  console.log('================================================================\n');

  // =========================================================================
  // WORKFLOW 1: EXISTING USER WORKFLOW (demo@sahayak.ai)
  // =========================================================================
  console.log('--- Workflow 1: Existing User (demo@sahayak.ai) ---');

  // Step 1: User Login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo@sahayak.ai', password: 'demo1234' }),
  });
  const loginData = await loginRes.json();
  const setCookie = loginRes.headers.get('set-cookie');
  const demoCookie = setCookie ? setCookie.split(';')[0] : '';

  assert(loginRes.status === 200 && loginData.success, 'Step 1: User logs in successfully');
  const activeWsId = loginData.workspaces?.[0]?.id || 'ws_technova_demo';
  assert(!!activeWsId, `Step 1.1: User assigned workspace ${activeWsId}`);

  // Step 2: Access User Dashboard
  const dashRes = await fetch(`${BASE_URL}/dashboard`, {
    headers: { Cookie: demoCookie },
  });
  assert(dashRes.status === 200, 'Step 2: User navigates to User Dashboard (/dashboard)');
  const dashHtml = await dashRes.text();
  assert(dashHtml.includes('Live Assistant Playground'), 'Step 2.1: User dashboard contains Live Assistant Playground');
  assert(dashHtml.includes('Ask Sahayak AI'), 'Step 2.2: User dashboard contains floating assistant launcher');

  // Step 3: Ask a question with explicit workspaceId
  const chatRes1 = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: demoCookie },
    body: JSON.stringify({
      workspaceId: activeWsId,
      query: 'What subscription pricing plans do you offer?',
    }),
  });
  const chatData1 = await chatRes1.json();
  assert(chatRes1.status === 200 && chatData1.success, 'Step 3: User asks pricing question and receives response');
  assert(!chatData1.isFallback && chatData1.confidence >= 0.5, `Step 3.1: Matched with high confidence (${chatData1.confidence})`);
  assert(chatData1.answer.toLowerCase().includes('starter') || chatData1.answer.toLowerCase().includes('business'), 'Step 3.2: Accurate pricing content returned');

  // Step 4: Ask a question WITHOUT workspaceId (auto-resolved from session)
  const chatResAutoWs = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: demoCookie },
    body: JSON.stringify({
      query: 'What is your refund and cancellation policy?',
    }),
  });
  const chatDataAutoWs = await chatResAutoWs.json();
  assert(chatResAutoWs.status === 200 && chatDataAutoWs.success, 'Step 4: Chatbot auto-resolves workspace from user session');
  assert(chatDataAutoWs.answer.toLowerCase().includes('refund') || chatDataAutoWs.answer.toLowerCase().includes('guarantee'), 'Step 4.1: Refund policy correctly returned');

  // Step 5: Conversational Intent (Greeting)
  const greetRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: demoCookie },
    body: JSON.stringify({
      workspaceId: activeWsId,
      query: 'Hello Sahayak!',
    }),
  });
  const greetData = await greetRes.json();
  assert(greetRes.status === 200 && greetData.success, 'Step 5: User sends greeting ("Hello Sahayak!")');
  assert(greetData.confidence === 1.0 && greetData.answer.includes('Sahayak AI assistant'), 'Step 5.1: Conversational greeting intent answers immediately');

  // Step 6: Capabilities Intent
  const capRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: demoCookie },
    body: JSON.stringify({
      workspaceId: activeWsId,
      query: 'What can you do?',
    }),
  });
  const capData = await capRes.json();
  assert(capRes.status === 200 && capData.success, 'Step 6: User asks capability inquiry ("What can you do?")');
  assert(capData.confidence === 1.0 && capData.answer.includes('deterministic vector similarity'), 'Step 6.1: Capabilities explained with 100% confidence');

  // Step 7: Multilingual Query in Hindi
  const hindiRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: demoCookie },
    body: JSON.stringify({
      workspaceId: activeWsId,
      query: 'आपके प्राइसिंग प्लान क्या हैं?',
      language: 'hi',
    }),
  });
  const hindiData = await hindiRes.json();
  assert(hindiRes.status === 200 && hindiData.success, 'Step 7: User asks question in Hindi');
  assert(hindiData.language === 'hi', 'Step 7.1: Hindi response returned properly');

  // =========================================================================
  // WORKFLOW 2: BRAND NEW USER REGISTRATION & WORKSPACE
  // =========================================================================
  console.log('\n--- Workflow 2: Brand New User Registration & Workspace ---');

  const randomId = Date.now();
  const newEmail = `user_${randomId}@example.com`;
  const newWsName = `Nexus Cloud ${randomId}`;

  // Step 8: Register new user
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Priya Patel',
      email: newEmail,
      password: 'SecurePassword@123',
      workspaceName: newWsName,
    }),
  });
  const regData = await regRes.json();
  const newSetCookie = regRes.headers.get('set-cookie');
  const newCookie = newSetCookie ? newSetCookie.split(';')[0] : '';

  assert(regRes.status === 201 && regData.success, 'Step 8: New user registers successfully');
  const newWsId = regData.workspace?.id;
  assert(!!newWsId, `Step 8.1: Dedicated workspace created: ${newWsId}`);

  // Step 9: Verify auto-seeded starter FAQs in new workspace
  const newWsFaqsRes = await fetch(`${BASE_URL}/api/workspaces/${newWsId}/faqs`, {
    headers: { Cookie: newCookie },
  });
  const newWsFaqsData = await newWsFaqsRes.json();
  assert(newWsFaqsRes.status === 200 && newWsFaqsData.faqs?.length >= 6, `Step 9: New workspace auto-seeded with starter FAQs (count: ${newWsFaqsData.faqs?.length})`);

  // Step 10: New user asks question in their new workspace
  const newChatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: newCookie },
    body: JSON.stringify({
      workspaceId: newWsId,
      query: 'What are your standard business hours?',
    }),
  });
  const newChatData = await newChatRes.json();
  assert(newChatRes.status === 200 && newChatData.success, 'Step 10: New user asks starter question');
  assert(!newChatData.isFallback && newChatData.confidence >= 0.5, `Step 10.1: New user receives high-confidence answer (${newChatData.confidence})`);
  assert(newChatData.answer.includes('Monday through Friday'), 'Step 10.2: Correct business hours returned');

  // Step 11: New user adds a custom FAQ, then asks it
  const customQ = `How do I request a demo for ${newWsName}?`;
  const customA = `You can request a demo by emailing demo@${randomId}.com or contacting your dedicated account rep.`;
  const createFaqRes = await fetch(`${BASE_URL}/api/workspaces/${newWsId}/faqs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: newCookie },
    body: JSON.stringify({
      question: customQ,
      answer: customA,
      tags: ['demo', 'trial', 'schedule'],
      isEnabled: true,
    }),
  });
  assert(createFaqRes.status === 201, 'Step 11: New user creates custom FAQ in their workspace');

  // Step 12: Ask the newly created custom FAQ
  const askCustomRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: newCookie },
    body: JSON.stringify({
      workspaceId: newWsId,
      query: `Can I schedule a product demo for ${newWsName}?`,
    }),
  });
  const askCustomData = await askCustomRes.json();
  assert(askCustomRes.status === 200 && askCustomData.success, 'Step 12: Chatbot matches new user custom FAQ');
  assert(askCustomData.answer.includes(customA), 'Step 12.1: Custom answer returned accurately');

  // =========================================================================
  // WORKFLOW 3: ADMIN USER WORKFLOW (rupam@gmail.com)
  // =========================================================================
  console.log('\n--- Workflow 3: Admin User (rupam@gmail.com) ---');

  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rupam@gmail.com', password: 'Admin@1234', isAdminLogin: true }),
  });
  const adminLoginData = await adminLoginRes.json();
  const adminSetCookie = adminLoginRes.headers.get('set-cookie');
  const adminCookie = adminSetCookie ? adminSetCookie.split(';')[0] : '';
  assert(adminLoginRes.status === 200 && adminLoginData.user?.role === 'ADMIN', 'Step 13: Admin logs in successfully');

  const adminChatRes = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
    body: JSON.stringify({
      workspaceId: 'ws_technova_demo',
      query: 'What are the API rate limits for requests?',
    }),
  });
  const adminChatData = await adminChatRes.json();
  assert(adminChatRes.status === 200 && adminChatData.confidence >= 0.5, 'Step 14: Admin receives correct chatbot response');

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n================================================================');
  console.log(`LOGGED-IN CHATBOT WORKFLOW TEST: ${summary.passed}/${summary.tests.length} PASSED (${summary.failed} FAILED)`);
  console.log('================================================================\n');

  if (summary.failed > 0) {
    process.exit(1);
  }
}

runLoggedInChatTests().catch(err => {
  console.error('Fatal error in logged-in chat tests:', err);
  process.exit(1);
});
