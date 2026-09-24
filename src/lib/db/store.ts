import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSchema, ChatSession, ChatMessage, WorkspaceMember } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'faqpilot.json');

const INITIAL_PASSWORD_HASH = bcrypt.hashSync('demo1234', 10);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'rupam@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

const SEED_DATA: DatabaseSchema = {
  users: [
    {
      id: 'usr_demo_admin',
      email: 'demo@sahayak.ai',
      passwordHash: INITIAL_PASSWORD_HASH,
      name: 'Alex Rivera',
      role: 'OWNER',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_admin_rupam',
      email: ADMIN_EMAIL,
      passwordHash: ADMIN_PASSWORD_HASH,
      name: 'Rupam (System Admin)',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    },
  ],
  workspaces: [
    {
      id: 'ws_technova_demo',
      name: 'Sahayak AI',
      slug: 'sahayak-ai',
      description: 'Official Sahayak AI customer support and automated knowledge base.',
      ownerId: 'usr_demo_admin',
      retentionDays: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  workspaceMembers: [
    {
      id: 'wsm_demo_owner',
      workspaceId: 'ws_technova_demo',
      userId: 'usr_demo_admin',
      role: 'OWNER',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'wsm_admin_rupam',
      workspaceId: 'ws_technova_demo',
      userId: 'usr_admin_rupam',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    },
  ],
  categories: [
    {
      id: 'cat_billing',
      workspaceId: 'ws_technova_demo',
      name: 'Billing & Plans',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_technical',
      workspaceId: 'ws_technova_demo',
      name: 'Technical & API',
      color: '#10B981',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_account',
      workspaceId: 'ws_technova_demo',
      name: 'Account & Security',
      color: '#8B5CF6',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cat_refund',
      workspaceId: 'ws_technova_demo',
      name: 'Refunds & Cancellation',
      color: '#EF4444',
      createdAt: new Date().toISOString(),
    },
  ],
  faqs: [
    {
      id: 'faq_1',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_billing',
      question: 'What subscription pricing plans do you offer?',
      answer: 'We offer three subscription tiers: Free ($0/mo for up to 500 conversations), Starter ($29/mo for up to 5,000 conversations with custom branding), and Business ($99/mo for up to 25,000 conversations with priority support and team access).',
      tags: ['pricing', 'plans', 'cost', 'tiers'],
      isEnabled: true,
      viewCount: 42,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_2',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_refund',
      question: 'What is your refund and cancellation policy?',
      answer: 'You can cancel your subscription at any time directly from the Settings page. We offer a full 14-day money-back guarantee on all paid plans if you are not satisfied with the service. Refunds are processed back to the original payment method within 5 to 7 business days.',
      tags: ['refund', 'cancel', 'money back', 'guarantee'],
      isEnabled: true,
      viewCount: 38,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_3',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_technical',
      question: 'What are the API rate limits for requests?',
      answer: 'Standard API plans include a rate limit of 60 requests per minute and 5,000 requests per day. Business tier accounts can request custom rate limits up to 300 requests per minute by contacting our engineering support team.',
      tags: ['api', 'rate limit', 'limits', 'requests', 'throttle'],
      isEnabled: true,
      viewCount: 29,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_4',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_account',
      question: 'How do I reset my account password if I forgot it?',
      answer: 'Click the "Forgot Password" link on the login screen, enter your registered email address, and we will send you a secure password reset link valid for 60 minutes.',
      tags: ['password', 'reset', 'forgot', 'login', 'account'],
      isEnabled: true,
      viewCount: 19,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_5',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_account',
      question: 'Is two-factor authentication (2FA) supported?',
      answer: 'Yes, two-factor authentication (2FA) using TOTP apps such as Google Authenticator, Authy, or 1Password is supported and recommended for all workspace members under Account Settings > Security.',
      tags: ['2fa', 'security', 'authenticator', 'totp', 'mfa'],
      isEnabled: true,
      viewCount: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_6',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_technical',
      question: 'How do I embed the chatbot widget onto my website?',
      answer: 'Go to your Dashboard > Chatbot Embed page, copy the generated <script> code snippet, and paste it right before the closing </body> tag of your website HTML or theme file. It works on plain HTML, WordPress, Shopify, Next.js, and Webflow.',
      tags: ['embed', 'widget', 'integrate', 'website', 'script'],
      isEnabled: true,
      viewCount: 65,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_7',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_billing',
      question: 'Which payment methods do you accept?',
      answer: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), Net Banking, and UPI (via Razorpay in supported regions). Invoicing with bank transfers is available for annual Business plans.',
      tags: ['payment', 'credit card', 'upi', 'cards', 'billing'],
      isEnabled: true,
      viewCount: 24,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_8',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_technical',
      question: 'Where is customer data hosted and is it encrypted?',
      answer: 'All data is encrypted in transit using TLS 1.3 and encrypted at rest using AES-256. Our primary databases are hosted in ISO 27001 and SOC 2 Type II certified data centers with strict tenant isolation.',
      tags: ['security', 'encryption', 'data', 'hosting', 'compliance', 'privacy'],
      isEnabled: true,
      viewCount: 31,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_9',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_billing',
      question: 'What happens if my workspace exceeds the monthly conversation limit?',
      answer: 'If you reach your plan limit, your widget continues running, but subsequent incoming queries will display a friendly rate limit notification unless you upgrade your tier or enable burst allowance in billing settings.',
      tags: ['limit', 'quota', 'exceed', 'usage', 'overage'],
      isEnabled: true,
      viewCount: 18,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_10',
      workspaceId: 'ws_technova_demo',
      categoryId: 'cat_technical',
      question: 'How do I contact customer support if my issue is not answered?',
      answer: 'You can email our support team directly at support@technova.example.com or submit a ticket through the dashboard. Priority support response time is within 2 hours during business hours (9 AM - 6 PM EST).',
      tags: ['support', 'contact', 'help', 'email', 'agent'],
      isEnabled: true,
      viewCount: 44,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  chatSessions: [
    {
      id: 'sess_seed_1',
      workspaceId: 'ws_technova_demo',
      title: 'Pricing Plans & Tier Inquiries',
      channel: 'WIDGET',
      sessionType: 'VISITOR',
      status: 'RESOLVED',
      visitorId: 'vis_w92_01',
      messageCount: 2,
      lastMessageSnippet: 'We offer three transparent subscription tiers: Starter, Professional, and Enterprise...',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'sess_seed_2',
      workspaceId: 'ws_technova_demo',
      title: 'Refund Policy & Money-Back Guarantee',
      channel: 'WIDGET',
      sessionType: 'VISITOR',
      status: 'RESOLVED',
      visitorId: 'vis_w92_02',
      messageCount: 2,
      lastMessageSnippet: 'We offer a full 14-day money-back guarantee on all first-time subscriptions...',
      createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
    {
      id: 'sess_seed_3',
      workspaceId: 'ws_technova_demo',
      title: 'Educational Discount Support Request',
      channel: 'WIDGET',
      sessionType: 'VISITOR',
      status: 'FALLBACK',
      visitorId: 'vis_w92_03',
      messageCount: 2,
      lastMessageSnippet: 'I could not find an exact answer in the knowledge base. Would you like to contact support?',
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    },
    {
      id: 'sess_seed_4',
      workspaceId: 'ws_technova_demo',
      title: 'API Rate Limits & Throttle Policies',
      channel: 'WIDGET',
      sessionType: 'VISITOR',
      status: 'RESOLVED',
      visitorId: 'vis_w92_04',
      messageCount: 2,
      lastMessageSnippet: 'Standard API plans include a rate limit of 60 requests per minute...',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'sess_seed_5',
      workspaceId: 'ws_technova_demo',
      title: 'Testing Chatbot Widget Script Embed',
      channel: 'DASHBOARD',
      sessionType: 'ADMIN',
      status: 'RESOLVED',
      messageCount: 2,
      lastMessageSnippet: 'Go to your Dashboard > Chatbot Embed page, copy the generated <script> code snippet...',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    {
      id: 'sess_seed_6',
      workspaceId: 'ws_technova_demo',
      title: 'Admin Test: Two-Factor Authentication Setup',
      channel: 'TEST',
      sessionType: 'ADMIN',
      status: 'RESOLVED',
      messageCount: 2,
      lastMessageSnippet: 'Yes, two-factor authentication (2FA) using TOTP apps such as Google Authenticator...',
      createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    },
  ],
  chatMessages: [
    {
      id: 'msg_seed_1a',
      sessionId: 'sess_seed_1',
      workspaceId: 'ws_technova_demo',
      role: 'USER',
      content: 'What pricing plans do you offer for small startups?',
      isFallback: false,
      latencyMs: 0,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'msg_seed_1b',
      sessionId: 'sess_seed_1',
      workspaceId: 'ws_technova_demo',
      role: 'ASSISTANT',
      content: 'We offer three transparent subscription tiers: Starter ($29/month) for small teams, Professional ($79/month) with advanced analytics, and Enterprise ($199/month) with dedicated support and custom integrations. All plans include a 14-day free trial with no credit card required.',
      matchedFaqId: 'faq_1',
      similarityScore: 0.88,
      isFallback: false,
      latencyMs: 3,
      createdAt: new Date(Date.now() - 3600000 * 2 + 500).toISOString(),
    },
    {
      id: 'msg_seed_2a',
      sessionId: 'sess_seed_2',
      workspaceId: 'ws_technova_demo',
      role: 'USER',
      content: 'What is your refund policy if we cancel after one week?',
      isFallback: false,
      latencyMs: 0,
      createdAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
    {
      id: 'msg_seed_2b',
      sessionId: 'sess_seed_2',
      workspaceId: 'ws_technova_demo',
      role: 'ASSISTANT',
      content: 'We offer a full 14-day money-back guarantee on all first-time subscriptions. If you are unsatisfied for any reason within the first 14 days of purchase, contact billing@technova.example.com for an immediate full refund.',
      matchedFaqId: 'faq_2',
      similarityScore: 0.92,
      isFallback: false,
      latencyMs: 2,
      createdAt: new Date(Date.now() - 3600000 * 14 + 400).toISOString(),
    },
    {
      id: 'msg_seed_3a',
      sessionId: 'sess_seed_3',
      workspaceId: 'ws_technova_demo',
      role: 'USER',
      content: 'Can our university coding club get an education non-profit discount? Please reach out to [REDACTED PHONE]',
      hasPii: true,
      redactedTypes: ['PHONE'],
      isFallback: false,
      latencyMs: 0,
      createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    },
    {
      id: 'msg_seed_3b',
      sessionId: 'sess_seed_3',
      workspaceId: 'ws_technova_demo',
      role: 'ASSISTANT',
      content: "I couldn't find a reliable answer in this business's knowledge base. Please contact our support team or try asking your question another way.",
      similarityScore: 0.18,
      isFallback: true,
      latencyMs: 3,
      createdAt: new Date(Date.now() - 3600000 * 28 + 600).toISOString(),
    },
    {
      id: 'msg_seed_4a',
      sessionId: 'sess_seed_4',
      workspaceId: 'ws_technova_demo',
      role: 'USER',
      content: 'What are the API rate limits on cloud requests?',
      isFallback: false,
      latencyMs: 0,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'msg_seed_4b',
      sessionId: 'sess_seed_4',
      workspaceId: 'ws_technova_demo',
      role: 'ASSISTANT',
      content: 'Standard API plans include a rate limit of 60 requests per minute and 5,000 requests per day. Business tier accounts can request custom rate limits up to 300 requests per minute by contacting our engineering support team.',
      matchedFaqId: 'faq_3',
      similarityScore: 0.91,
      isFallback: false,
      latencyMs: 3,
      createdAt: new Date(Date.now() - 3600000 * 48 + 450).toISOString(),
    },
    {
      id: 'msg_seed_5a',
      sessionId: 'sess_seed_5',
      workspaceId: 'ws_technova_demo',
      role: 'USER',
      content: 'How do I embed the chatbot widget on my website?',
      isFallback: false,
      latencyMs: 0,
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    {
      id: 'msg_seed_5b',
      sessionId: 'sess_seed_5',
      workspaceId: 'ws_technova_demo',
      role: 'ASSISTANT',
      content: 'Go to your Dashboard > Chatbot Embed page, copy the generated <script> code snippet, and paste it right before the closing </body> tag of your website HTML or theme file. It works on plain HTML, WordPress, Shopify, Next.js, and Webflow.',
      matchedFaqId: 'faq_6',
      similarityScore: 0.95,
      isFallback: false,
      latencyMs: 2,
      createdAt: new Date(Date.now() - 3600000 * 72 + 300).toISOString(),
    },
    {
      id: 'msg_seed_6a',
      sessionId: 'sess_seed_6',
      workspaceId: 'ws_technova_demo',
      role: 'USER',
      content: 'Is two-factor authentication (2FA) supported?',
      isFallback: false,
      latencyMs: 0,
      createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    },
    {
      id: 'msg_seed_6b',
      sessionId: 'sess_seed_6',
      workspaceId: 'ws_technova_demo',
      role: 'ASSISTANT',
      content: 'Yes, two-factor authentication (2FA) using TOTP apps such as Google Authenticator, Authy, or 1Password is supported and recommended for all workspace members under Account Settings > Security.',
      matchedFaqId: 'faq_5',
      similarityScore: 0.94,
      isFallback: false,
      latencyMs: 2,
      createdAt: new Date(Date.now() - 3600000 * 96 + 350).toISOString(),
    },
  ],
  chatFeedback: [],
  widgetConfigs: [
    {
      id: 'wc_technova',
      workspaceId: 'ws_technova_demo',
      publicId: 'tn-public-bot-982',
      botName: 'Sahayak AI',
      welcomeMessage: 'Hello! I am Sahayak AI. Ask me about features, API limits, refunds, or technical support.',
      primaryColor: '#2563EB',
      suggestedQuestions: [
        'What pricing plans do you offer?',
        'What is your refund policy?',
        'How do I embed the chatbot widget?',
        'What are the API rate limits?',
      ],
      allowedDomains: ['*'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  usageQuotas: [
    {
      id: 'uq_technova',
      workspaceId: 'ws_technova_demo',
      planTier: 'FREE',
      monthlyLimit: 500,
      currentUsage: 12,
      billingCycleStart: new Date().toISOString(),
    },
  ],
  auditLogs: [],
  supportTickets: [
    {
      id: 'ticket_sample_1',
      ticketNumber: 'TICK-1082',
      workspaceId: 'ws_technova_demo',
      visitorName: 'Rajesh Sharma',
      visitorEmail: 'rajesh.sharma@example.com',
      visitorPhone: '+91 98765 43210',
      question: 'Do you offer custom enterprise SLA with on-premise deployment?',
      details: 'We are evaluating cloud vs on-premise for a banking client with 1,000 seats.',
      status: 'PENDING',
      priority: 'URGENT',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'ticket_sample_2',
      ticketNumber: 'TICK-1083',
      workspaceId: 'ws_technova_demo',
      visitorName: 'Emily Watson',
      visitorEmail: 'emily.w@designcraft.io',
      question: 'Can we get tax exemption invoices for educational non-profits?',
      details: 'We are a certified 501(c)(3) institution seeking 501 tax exemption receipt.',
      status: 'RESOLVED',
      priority: 'NORMAL',
      resolutionNotes: 'Sent non-profit discount documentation and requested EIN verification certificate.',
      resolvedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      resolvedBy: 'Alex Rivera',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ],
};

class JsonDatabase {
  private inMemoryCache: DatabaseSchema | null = null;

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public read(): DatabaseSchema {
    this.ensureDirectory();
    if (this.inMemoryCache) {
      return this.inMemoryCache;
    }

    if (!fs.existsSync(DB_FILE)) {
      this.write(SEED_DATA);
      return SEED_DATA;
    }

    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.supportTickets) {
        parsed.supportTickets = SEED_DATA.supportTickets || [];
      }
      if (parsed.workspaces && parsed.workspaces.length > 0 && !parsed.workspaces[0].retentionDays) {
        parsed.workspaces[0].retentionDays = 90;
      }
      if (!parsed.chatSessions) {
        parsed.chatSessions = [];
        parsed.chatMessages = [];
      }
      // Ensure rich seed conversations exist in workspace
      if (SEED_DATA.chatSessions && SEED_DATA.chatSessions.length > 0) {
        const existingSessionIds = new Set((parsed.chatSessions || []).map((s: ChatSession) => s.id));
        for (const seedSess of SEED_DATA.chatSessions) {
          if (!existingSessionIds.has(seedSess.id)) {
            parsed.chatSessions.push(seedSess);
          }
        }
        const existingMsgIds = new Set((parsed.chatMessages || []).map((m: ChatMessage) => m.id));
        for (const seedMsg of SEED_DATA.chatMessages) {
          if (!existingMsgIds.has(seedMsg.id)) {
            parsed.chatMessages.push(seedMsg);
          }
        }
      }

      // Backfill any missing fields on older session records
      parsed.chatSessions = parsed.chatSessions.map((s: ChatSession) => ({
        ...s,
        title: s.title || 'Conversation Inquiry',
        sessionType: s.sessionType || (s.channel === 'WIDGET' ? 'VISITOR' : 'ADMIN'),
        status: s.status || 'RESOLVED',
        messageCount: s.messageCount || 2,
      }));

      // Ensure admin user exists and is configured with role ADMIN
      const adminEmail = (process.env.ADMIN_EMAIL || 'rupam@gmail.com').toLowerCase();
      let adminUser = parsed.users.find((u: { email?: string }) => u.email?.toLowerCase() === adminEmail);
      if (!adminUser) {
        adminUser = {
          id: 'usr_admin_rupam',
          email: adminEmail,
          passwordHash: ADMIN_PASSWORD_HASH,
          name: 'Rupam (System Admin)',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
        };
        parsed.users.push(adminUser);
      } else {
        adminUser.role = 'ADMIN';
        adminUser.passwordHash = ADMIN_PASSWORD_HASH;
      }

      // Ensure admin user is linked as an ADMIN member of demo workspace
      if (adminUser) {
        const hasMember = parsed.workspaceMembers.some(
          (m: WorkspaceMember) => m.workspaceId === 'ws_technova_demo' && m.userId === adminUser.id
        );
        if (!hasMember) {
          parsed.workspaceMembers.push({
            id: `wsm_admin_${adminUser.id}`,
            workspaceId: 'ws_technova_demo',
            userId: adminUser.id,
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
          });
        }
      }

      this.inMemoryCache = parsed;
      return this.inMemoryCache!;
    } catch (err) {
      console.error('Error reading JSON DB, fallback to seed:', err);
      return SEED_DATA;
    }
  }

  public write(data: DatabaseSchema): void {
    this.ensureDirectory();
    this.inMemoryCache = data;
    const tempFile = `${DB_FILE}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      try {
        fs.renameSync(tempFile, DB_FILE);
      } catch (renameErr: unknown) {
        const errorWithCode = renameErr as { code?: string } | null;
        if (errorWithCode && (errorWithCode.code === 'EPERM' || errorWithCode.code === 'EBUSY')) {
          // On Windows (especially OneDrive folders), renameSync can hit temporary file locks.
          // Fall back to direct write.
          fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
          try { fs.unlinkSync(tempFile); } catch {}
        } else {
          throw renameErr;
        }
      }
    } catch {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      try { fs.unlinkSync(tempFile); } catch {}
    }
  }
}

export const dbStore = new JsonDatabase();
