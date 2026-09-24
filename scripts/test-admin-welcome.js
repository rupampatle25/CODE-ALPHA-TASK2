async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rupam@gmail.com', password: 'Admin@1234' })
  });
  const cookie = loginRes.headers.get('set-cookie');

  const dashRes = await fetch('http://localhost:3000/dashboard', {
    headers: { Cookie: cookie }
  });
  const html = await dashRes.text();
  
  const hasWelcome = html.includes('Welcome, <!-- -->Sahayak AI') || html.includes('Welcome, Sahayak AI');
  const hasSubtext = html.includes('Your Sahayak AI assistant is trained on <!-- -->110<!-- --> approved FAQs and ready to serve customer queries instantly.') || html.includes('Your Sahayak AI assistant is trained on 110 approved FAQs and ready to serve customer queries instantly.');
  const hasTechNova = html.includes('TechNova');

  console.log('✅ Welcome text matched:', hasWelcome);
  console.log('✅ Assistant trained subtext matched:', hasSubtext);
  console.log('✅ TechNova completely removed (must be false):', hasTechNova);

  if (!hasWelcome || !hasSubtext || hasTechNova) {
    console.error('❌ Verification failed!');
    process.exit(1);
  } else {
    console.log('🎉 ALL ADMIN DASHBOARD WORKSPACE VERIFICATIONS PASSED!');
  }
}

test();
