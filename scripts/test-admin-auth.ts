import { userRepo, faqRepo, faqCategoryRepo, workspaceRepo } from '../src/lib/db';
import { verifyPassword, signSession, verifySession } from '../src/lib/auth';

async function runTests() {
  console.log('========================================================');
  console.log('Sahayak AI: Automated Admin Authentication & RBAC Tests');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  // 1. Verify Admin User Exists in Database
  console.log('--- TEST GROUP 1: Database Account Verification ---');
  const adminEmail = process.env.ADMIN_EMAIL || 'rupam@gmail.com';
  const adminUser = userRepo.findByEmail(adminEmail);
  assert(!!adminUser, `Admin account for ${adminEmail} exists in database`);
  assert(adminUser?.role === 'ADMIN', `Admin account role is assigned as 'ADMIN' (actual: ${adminUser?.role})`);

  // 2. Verify Password Validation
  console.log('\n--- TEST GROUP 2: Password & Bcrypt Verification ---');
  const configuredPassword = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const isValidPass = await verifyPassword(configuredPassword, adminUser!.passwordHash);
  assert(isValidPass, `Configured password '${configuredPassword}' validates successfully against hash`);

  const isInvalidPassValid = await verifyPassword('IncorrectPassword123', adminUser!.passwordHash);
  assert(!isInvalidPassValid, `Invalid password 'IncorrectPassword123' is correctly rejected`);

  // 3. Verify Session Signing & Payload
  console.log('\n--- TEST GROUP 3: HMAC Session Token Verification ---');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = signSession({
    userId: adminUser!.id,
    email: adminUser!.email,
    name: adminUser!.name,
    expiresAt,
  });
  assert(typeof token === 'string' && token.includes('.'), `HMAC session token signed successfully`);

  const payload = verifySession(token);
  assert(payload?.userId === adminUser!.id, `HMAC session token payload verified correctly`);
  assert(payload?.email === adminEmail, `Session payload contains admin email`);

  const tamperedToken = token.slice(0, -5) + 'abcde';
  const tamperedPayload = verifySession(tamperedToken);
  assert(tamperedPayload === null, `Tampered token signature is safely rejected`);

  // 4. Verify Workspaces Access for Admin
  console.log('\n--- TEST GROUP 4: Workspace Access & RBAC Privileges ---');
  const adminWorkspaces = workspaceRepo.listForUser(adminUser!.id);
  assert(adminWorkspaces.length > 0, `Admin has overarching access to workspaces (count: ${adminWorkspaces.length})`);
  const demoWs = adminWorkspaces.find(w => w.id === 'ws_technova_demo');
  assert(!!demoWs, `Demo workspace 'ws_technova_demo' is in admin workspace list`);

  // 5. Test Category Management CRUD
  console.log('\n--- TEST GROUP 5: Category & FAQ Administration ---');
  const testCat = faqCategoryRepo.create('ws_technova_demo', 'Automated Test Category', '#10B981');
  assert(!!testCat.id, `Admin can create category '${testCat.name}' (id: ${testCat.id})`);

  const testFaq = faqRepo.create('ws_technova_demo', {
    question: 'How do admins manage the system?',
    answer: 'Admins log in via the dedicated Admin Portal to control FAQs and categories.',
    categoryId: testCat.id,
    tags: ['admin', 'test'],
  });
  assert(!!testFaq.id, `Admin can create FAQ under new category (id: ${testFaq.id})`);

  const updatedFaq = faqRepo.update('ws_technova_demo', testFaq.id, {
    question: 'How do admins manage the knowledge base?',
  });
  assert(updatedFaq?.question === 'How do admins manage the knowledge base?', `Admin can edit FAQ`);

  const deletedFaq = faqRepo.delete('ws_technova_demo', testFaq.id);
  assert(deletedFaq, `Admin can delete FAQ`);

  const deletedCat = faqCategoryRepo.delete('ws_technova_demo', testCat.id);
  assert(deletedCat, `Admin can delete category`);

  console.log('\n========================================================');
  console.log(`Summary: ${passed} passed, ${failed} failed`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
