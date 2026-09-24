import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920'],
    defaultViewport: { width: 1440, height: 920, deviceScaleFactor: 1.5 }
  });

  const page = await browser.newPage();

  console.log('1. Capturing Landing Page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await sleep(1500);
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_landing_page.png') });

  console.log('2. Capturing Login Page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
  await sleep(1000);
  try {
    const fillDemoBtn = await page.$('button ::-p-text(Fill Demo)');
    if (fillDemoBtn) await fillDemoBtn.click();
  } catch (e) {
    console.log('Fill demo button click handled:', e.message);
  }
  await sleep(500);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_login_page.png') });

  console.log('3. Logging in...');
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }).catch(() => {});
  }
  await sleep(2000);

  console.log('4. Capturing Dashboard Overview...');
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
  await sleep(2000);
  await page.evaluate(() => {
    document.activeElement?.blur();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await sleep(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_dashboard_overview.png') });

  console.log('5. Capturing FAQ Knowledge Base...');
  await page.goto('http://localhost:3000/dashboard/faqs', { waitUntil: 'networkidle0' });
  await sleep(2000);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_faq_management.png') });

  console.log('6. Capturing Chatbot Customizer & Playground...');
  await page.goto('http://localhost:3000/dashboard/chatbot', { waitUntil: 'networkidle0' });
  await sleep(2500);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_chatbot_customizer.png') });

  console.log('7. Capturing Analytics & Knowledge Gaps...');
  await page.goto('http://localhost:3000/dashboard/analytics', { waitUntil: 'networkidle0' });
  await sleep(2000);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_analytics.png') });

  console.log('8. Capturing Human Support Inbox...');
  await page.goto('http://localhost:3000/dashboard/support', { waitUntil: 'networkidle0' });
  await sleep(2000);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_human_support.png') });

  console.log('9. Capturing Conversation History...');
  await page.goto('http://localhost:3000/dashboard/conversations', { waitUntil: 'networkidle0' });
  await sleep(2000);
  await page.evaluate(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_conversation_history.png') });

  console.log('10. Capturing Embeddable Widget...');
  const widgetPage = await browser.newPage();
  await widgetPage.setViewport({ width: 440, height: 700, deviceScaleFactor: 2 });
  await widgetPage.goto('http://localhost:3000/widget/tn-public-bot-982', { waitUntil: 'networkidle0' });
  await sleep(2000);
  await widgetPage.screenshot({ path: path.join(SCREENSHOT_DIR, '09_embeddable_widget.png') });

  await browser.close();
  console.log('All screenshots captured successfully in screenshots/ directory!');
}

capture().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
