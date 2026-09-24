export interface SeedFaqItem {
  question: string;
  answer: string;
  categoryKey: 'general' | 'account' | 'services' | 'pricing' | 'technical' | 'security' | 'refunds';
  tags: string[];
}

export const SEED_CATEGORIES: Record<string, { id: string; name: string; color: string }> = {
  general: {
    id: 'cat_general',
    name: 'General Information',
    color: '#3B82F6', // Blue
  },
  account: {
    id: 'cat_account',
    name: 'Account & Login',
    color: '#8B5CF6', // Purple
  },
  services: {
    id: 'cat_services',
    name: 'Services',
    color: '#06B6D4', // Cyan
  },
  pricing: {
    id: 'cat_billing',
    name: 'Pricing & Payments',
    color: '#10B981', // Emerald
  },
  technical: {
    id: 'cat_technical',
    name: 'Technical Support',
    color: '#F59E0B', // Amber
  },
  security: {
    id: 'cat_security',
    name: 'Security',
    color: '#6366F1', // Indigo
  },
  refunds: {
    id: 'cat_refund',
    name: 'Refunds & Policies',
    color: '#EF4444', // Rose
  },
};

export const NEW_100_FAQS: SeedFaqItem[] = [
  // ==========================================
  // 1. GENERAL INFORMATION (15 FAQs)
  // ==========================================
  {
    question: "What is Sahayak AI and who is it designed for?",
    answer: "Sahayak AI is an enterprise-grade AI FAQ chatbot SaaS built for businesses, educational institutions, healthcare providers, and e-commerce stores looking to automate repetitive customer support queries with zero hallucinations using deterministic NLP matching.",
    categoryKey: "general",
    tags: ["overview", "about", "introduction", "audience", "purpose"]
  },
  {
    question: "How does Sahayak AI guarantee zero hallucinations in its responses?",
    answer: "Unlike generative LLMs that may extrapolate or invent facts, Sahayak AI employs a deterministic vector space model combining TF-IDF term weighting and cosine similarity. It only returns verified answers explicitly present in your approved business knowledge base.",
    categoryKey: "general",
    tags: ["hallucination", "accuracy", "factual", "grounded", "tf-idf"]
  },
  {
    question: "What languages does Sahayak AI support for customer queries?",
    answer: "Sahayak AI natively supports English, Hindi, and Marathi, with a built-in multilingual translator, localized UI text, and speech recognition locales for all three languages.",
    categoryKey: "general",
    tags: ["multilingual", "languages", "hindi", "marathi", "english"]
  },
  {
    question: "Can Sahayak AI be deployed for internal company knowledge bases?",
    answer: "Yes. Sahayak AI supports both public visitor-facing widgets and internal team knowledge bases, with role-based access control and separate audit logs for administrative sessions.",
    categoryKey: "general",
    tags: ["internal", "intranet", "team", "knowledge base", "private"]
  },
  {
    question: "What industries benefit most from using Sahayak AI?",
    answer: "Sahayak AI is widely adopted across e-commerce retail, SaaS software companies, educational universities, healthcare clinics, financial services, and customer care centers.",
    categoryKey: "general",
    tags: ["industries", "verticals", "retail", "education", "healthcare"]
  },
  {
    question: "What is the uptime guarantee for the Sahayak AI platform?",
    answer: "We guarantee a 99.9% uptime Service Level Agreement (SLA) for all Starter and Business tier workspaces, backed by redundant cloud infrastructure and automatic failover.",
    categoryKey: "general",
    tags: ["uptime", "sla", "reliability", "availability", "cloud"]
  },
  {
    question: "Do I need coding or AI engineering experience to use Sahayak AI?",
    answer: "No coding skills are required. You can manage FAQs through our visual dashboard, import existing FAQs via CSV, customize brand colors, and copy a single script tag to embed the bot on your website.",
    categoryKey: "general",
    tags: ["no-code", "beginner", "ease of use", "setup", "dashboard"]
  },
  {
    question: "Where is the Sahayak AI company headquarters located?",
    answer: "Sahayak AI is headquartered in Bengaluru, India, with distributed engineering and customer support centers operating across the United States, Europe, and the Asia-Pacific region.",
    categoryKey: "general",
    tags: ["headquarters", "location", "company", "office", "india"]
  },
  {
    question: "What is the difference between Sahayak AI and standard generative chatbots?",
    answer: "Standard chatbots use generative models that can produce plausible-sounding but incorrect information. Sahayak AI uses mathematical vector similarity grounded strictly in approved corporate documentation, ensuring legally compliant, accurate customer guidance.",
    categoryKey: "general",
    tags: ["comparison", "generative", "compliance", "accurate", "grounded"]
  },
  {
    question: "Does Sahayak AI support dark mode or custom theme styles?",
    answer: "Yes. The chatbot widget features a responsive theme engine that automatically inherits your brand color palette and adapts cleanly to both light and dark website layouts.",
    categoryKey: "general",
    tags: ["theme", "dark mode", "styling", "appearance", "customization"]
  },
  {
    question: "How long has Sahayak AI been in active production?",
    answer: "Sahayak AI was architected in 2026 as an enterprise NLP platform and has processed over 5 million customer inquiries across global SaaS deployments.",
    categoryKey: "general",
    tags: ["history", "background", "experience", "scale", "stats"]
  },
  {
    question: "Can I try Sahayak AI before committing to a paid contract?",
    answer: "Yes. Every newly registered workspace automatically receives our Free Tier plan with up to 500 free customer conversations per month and full access to the interactive demo sandbox.",
    categoryKey: "general",
    tags: ["trial", "free tier", "sandbox", "demo", "test"]
  },
  {
    question: "Does Sahayak AI offer an on-premise or self-hosted deployment?",
    answer: "Business and Enterprise tier customers can deploy Sahayak AI on private VPC clouds (AWS, Google Cloud, Azure) or dedicated on-premise Docker Kubernetes clusters.",
    categoryKey: "general",
    tags: ["on-premise", "self-hosted", "vpc", "docker", "kubernetes"]
  },
  {
    question: "How frequently is the Sahayak AI platform updated?",
    answer: "We deploy weekly zero-downtime platform updates, including NLP algorithmic enhancements, performance optimizations, and security patches.",
    categoryKey: "general",
    tags: ["updates", "release cycle", "maintenance", "patches", "roadmap"]
  },
  {
    question: "Where can I read the latest product roadmap and feature announcements?",
    answer: "You can view upcoming features, release notes, and community feature requests directly in the Dashboard under Settings or by visiting our public developer blog.",
    categoryKey: "general",
    tags: ["roadmap", "announcements", "releases", "features", "news"]
  },

  // ==========================================
  // 2. ACCOUNT & LOGIN (15 FAQs)
  // ==========================================
  {
    question: "How do I create a new business workspace account?",
    answer: "Visit the Sign Up page at /register, enter your name, corporate email address, password, and desired workspace name. Your workspace is provisioned immediately with full dashboard access.",
    categoryKey: "account",
    tags: ["register", "signup", "create account", "new workspace", "onboarding"]
  },
  {
    question: "Can I log in using my Google or GitHub account?",
    answer: "Yes. Sahayak AI supports Single Sign-On (SSO) via Google and GitHub OAuth providers in addition to standard email and password authentication.",
    categoryKey: "account",
    tags: ["sso", "oauth", "google login", "github login", "social login"]
  },
  {
    question: "What password requirements are enforced during account registration?",
    answer: "Passwords must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one numeric digit, and one special character.",
    categoryKey: "account",
    tags: ["password strength", "requirements", "credentials", "security policy"]
  },
  {
    question: "How do I invite team members to collaborate on my workspace?",
    answer: "Go to Dashboard > Settings > Team Members, click 'Invite Member', and enter their email address along with their assigned role (Admin, Editor, or Viewer).",
    categoryKey: "account",
    tags: ["team", "invite", "collaboration", "users", "roles"]
  },
  {
    question: "What are the different user roles available within a workspace?",
    answer: "We provide four distinct roles: Owner (full administrative and billing ownership), Admin (manages FAQs, categories, and settings), Editor (can create and update FAQs), and Viewer (read-only access to analytics and chat logs).",
    categoryKey: "account",
    tags: ["roles", "rbac", "permissions", "owner", "admin", "viewer"]
  },
  {
    question: "How can I update my account email address or profile name?",
    answer: "Navigate to Dashboard > Settings > Profile, update your full name or email address, and click 'Save Changes'. An email verification link will be sent to confirm any email changes.",
    categoryKey: "account",
    tags: ["profile", "change email", "edit name", "settings", "account"]
  },
  {
    question: "What should I do if my account gets locked due to failed login attempts?",
    answer: "If 5 consecutive failed login attempts occur, accounts are temporarily locked for 15 minutes to prevent brute-force attacks. You can wait 15 minutes or click 'Forgot Password' to unlock immediately.",
    categoryKey: "account",
    tags: ["locked", "brute force", "failed login", "security lock", "timeout"]
  },
  {
    question: "Can I manage multiple business workspaces under a single user login?",
    answer: "Yes. You can create or join multiple workspaces with one login and switch between them seamlessly using the workspace dropdown in the dashboard sidebar.",
    categoryKey: "account",
    tags: ["multi-workspace", "switch workspace", "organizations", "tenants"]
  },
  {
    question: "How do I permanently delete my account and associated data?",
    answer: "Account deletion can be requested under Dashboard > Settings > Danger Zone. Clicking 'Delete Account' initiates a 7-day grace period, after which all personal data and workspace FAQs are permanently purged.",
    categoryKey: "account",
    tags: ["delete account", "close account", "gdpr", "purge data", "danger zone"]
  },
  {
    question: "How do I configure email notifications for support handoff tickets?",
    answer: "In Dashboard > Settings > Notifications, enable 'Email Alerts for New Tickets' and specify the destination email addresses for urgent visitor escalations.",
    categoryKey: "account",
    tags: ["notifications", "email alerts", "ticket alerts", "settings"]
  },
  {
    question: "Can I transfer ownership of my workspace to another team member?",
    answer: "Yes. Workspace Owners can transfer primary ownership to any existing Admin member under Dashboard > Settings > Transfer Ownership.",
    categoryKey: "account",
    tags: ["transfer ownership", "change owner", "account transfer", "admin"]
  },
  {
    question: "Does Sahayak AI support SAML 2.0 or Okta enterprise SSO?",
    answer: "Yes. Enterprise tier workspaces support SAML 2.0, Okta, Microsoft Azure Active Directory, and Google Workspace identity providers.",
    categoryKey: "account",
    tags: ["saml", "okta", "azure ad", "enterprise sso", "directory"]
  },
  {
    question: "How do I view my current active login sessions across devices?",
    answer: "Under Dashboard > Settings > Active Sessions, you can view all active browser sessions, IP locations, and device types, with a 1-click option to 'Log Out All Other Devices'.",
    categoryKey: "account",
    tags: ["active sessions", "devices", "logout all", "audit sessions"]
  },
  {
    question: "Why am I not receiving password reset emails?",
    answer: "Check your spam or junk folder for messages from no-reply@sahayak.ai. Ensure your corporate firewall permits transactional emails, or contact support to verify your account status.",
    categoryKey: "account",
    tags: ["reset email", "troubleshoot email", "spam", "password email"]
  },
  {
    question: "Can I restrict dashboard access to specific IP addresses?",
    answer: "Yes. Business and Enterprise tier workspaces can enable IP Whitelisting under Dashboard > Settings > Security to restrict dashboard access to authorized office or VPN subnets.",
    categoryKey: "account",
    tags: ["ip whitelist", "ip restriction", "vpn", "access control"]
  },

  // ==========================================
  // 3. SERVICES (15 FAQs)
  // ==========================================
  {
    question: "What core features are included in the Sahayak AI chatbot widget?",
    answer: "The chatbot widget includes deterministic NLP cosine matching, browser Voice-to-Text, 3-language multilingual switching (English, Hindi, Marathi), Human Support handoff forms, smart suggested questions, and answer feedback ratings.",
    categoryKey: "services",
    tags: ["features", "capabilities", "widget", "voice", "handoff", "nlp"]
  },
  {
    question: "How does the Voice-to-Text speech recognition feature operate?",
    answer: "The widget uses the browser's native Web Speech API. When the user taps the microphone button and grants permission, their speech is converted to text in real-time and placed into the chat input field without storing any raw audio recordings.",
    categoryKey: "services",
    tags: ["voice-to-text", "speech recognition", "microphone", "audio", "web speech"]
  },
  {
    question: "How does Human Support Handoff work when a user needs a live representative?",
    answer: "If the chatbot cannot find an answer or if the user requests human assistance, a 'Contact Human Support' prompt appears. The user submits their query and contact details, creating a tracked support ticket in the business dashboard.",
    categoryKey: "services",
    tags: ["human handoff", "support ticket", "escalation", "live agent", "helpdesk"]
  },
  {
    question: "Can I bulk import existing FAQs from CSV or Excel files?",
    answer: "Yes. Go to Dashboard > FAQs, click 'Import CSV', and upload your file. Our system validates questions, answers, and category tags, displaying a preview before completing the import.",
    categoryKey: "services",
    tags: ["csv import", "bulk import", "excel", "faqs", "upload"]
  },
  {
    question: "Can I export my workspace FAQs and conversation history?",
    answer: "Yes. You can export all FAQs and sanitized conversation transcripts at any time as JSON or CSV files from the FAQs and Conversations dashboard pages.",
    categoryKey: "services",
    tags: ["export", "backup", "csv export", "json", "download"]
  },
  {
    question: "Does Sahayak AI provide real-time chat analytics and usage reports?",
    answer: "Yes. The Dashboard Analytics tab displays total conversation volume, query resolution rate, top matched FAQs, fallback query trends, and user satisfaction ratings.",
    categoryKey: "services",
    tags: ["analytics", "metrics", "reports", "resolution rate", "dashboard"]
  },
  {
    question: "How does the smart suggested questions system decide which prompts to show?",
    answer: "Suggested questions are generated either automatically by sampling representative FAQs from each active category, or manually curated by the business owner in the Chatbot Customizer.",
    categoryKey: "services",
    tags: ["suggested questions", "smart prompts", "chips", "recommendations"]
  },
  {
    question: "Can I customize the greeting and welcome message of the chatbot?",
    answer: "Yes. Under Dashboard > Chatbot & Embed, you can customize the chatbot display name, greeting message, placeholder text, and brand accent colors with live preview.",
    categoryKey: "services",
    tags: ["welcome message", "customization", "branding", "display name", "color"]
  },
  {
    question: "Does Sahayak AI support conversation rating and visitor feedback?",
    answer: "Yes. Every chatbot response includes Thumbs Up and Thumbs Down feedback buttons, allowing business owners to monitor answer quality and refine poorly rated responses.",
    categoryKey: "services",
    tags: ["feedback", "thumbs up", "rating", "satisfaction", "quality"]
  },
  {
    question: "Can I integrate Sahayak AI with Zendesk or Freshdesk?",
    answer: "Yes. Business tier plans support outbound webhooks that automatically forward escalated human support tickets directly to Zendesk, Freshdesk, or Jira Service Management.",
    categoryKey: "services",
    tags: ["integrations", "zendesk", "freshdesk", "jira", "helpdesk"]
  },
  {
    question: "Does Sahayak AI offer Slack or Microsoft Teams alert integrations?",
    answer: "Yes. You can connect a Slack or MS Teams webhook in Dashboard > Settings > Webhooks to receive instant channel notifications whenever an urgent support ticket is submitted.",
    categoryKey: "services",
    tags: ["slack", "teams", "notifications", "webhooks", "alerts"]
  },
  {
    question: "How does the chatbot handle questions containing sensitive PII data?",
    answer: "Before queries are stored in conversation history, our built-in privacy sanitizer detects and masks credit card numbers, email addresses, phone numbers, and Social Security IDs.",
    categoryKey: "services",
    tags: ["pii", "sanitizer", "privacy", "masking", "redaction"]
  },
  {
    question: "Can I embed the chatbot widget in mobile applications?",
    answer: "Yes. The widget can be embedded in iOS and Android applications via WebView or connected directly using our RESTful JSON Chat API.",
    categoryKey: "services",
    tags: ["mobile app", "ios", "android", "webview", "sdk"]
  },
  {
    question: "Does Sahayak AI provide a standalone full-screen chat interface?",
    answer: "Yes. Each widget comes with a dedicated standalone URL (/widget/[publicId]) that can be shared via email, QR code, or SMS for full-screen mobile interactions.",
    categoryKey: "services",
    tags: ["standalone", "full screen", "url", "direct link", "qr code"]
  },
  {
    question: "How can I test chatbot responses before deploying the widget live?",
    answer: "The Dashboard features a real-time Interactive Preview sandbox on the Chatbot page, allowing you to test questions, language switching, and voice input safely before publishing.",
    categoryKey: "services",
    tags: ["testing", "sandbox", "preview", "staging", "verification"]
  },

  // ==========================================
  // 4. PRICING & PAYMENTS (15 FAQs)
  // ==========================================
  {
    question: "What is included in the Sahayak AI Free Tier plan?",
    answer: "The Free Tier includes up to 500 monthly conversation turns, 50 FAQs, 4 categories, website embed script, Web Speech voice input, and 3-language translation at $0 per month.",
    categoryKey: "pricing",
    tags: ["free tier", "free plan", "cost", "limits", "pricing"]
  },
  {
    question: "How much does the Starter subscription plan cost and what does it include?",
    answer: "The Starter plan is $29 per month (or $24/month billed annually) and includes up to 5,000 monthly conversations, unlimited FAQs, custom branding, and CSV import/export.",
    categoryKey: "pricing",
    tags: ["starter plan", "cost", "features", "annual discount", "subscription"]
  },
  {
    question: "What features are exclusive to the Business subscription tier?",
    answer: "The Business plan ($99/month) includes 25,000 conversations, priority email and phone support, multi-member team roles, custom webhooks, Supabase database sync, and SLA guarantees.",
    categoryKey: "pricing",
    tags: ["business plan", "enterprise", "priority support", "limits", "scale"]
  },
  {
    question: "Do you offer discounts for annual billing or upfront payment?",
    answer: "Yes. We offer a 20% discount on all annual billing plans, equivalent to receiving more than 2 months of service free each year.",
    categoryKey: "pricing",
    tags: ["discount", "annual", "yearly", "savings", "billing cycle"]
  },
  {
    question: "Do you provide special pricing for non-profit organizations or universities?",
    answer: "Yes. Verified educational institutions, universities, and registered 501(c)(3) non-profit organizations receive a 35% lifetime discount across all subscription tiers.",
    categoryKey: "pricing",
    tags: ["non-profit", "education", "university", "academic discount", "grant"]
  },
  {
    question: "Are there any hidden setup fees or implementation charges?",
    answer: "No. There are zero setup fees, activation charges, or hidden transaction fees on any Sahayak AI subscription plan.",
    categoryKey: "pricing",
    tags: ["hidden fees", "setup fee", "transparent pricing", "activation"]
  },
  {
    question: "What happens if my workspace exceeds the monthly conversation quota?",
    answer: "When usage reaches 80% and 100% of your plan limit, we send email alerts. If exceeded, you can upgrade your plan or enable overage conversations at $0.005 per additional conversation.",
    categoryKey: "pricing",
    tags: ["quota", "overage", "limits", "extra usage", "conversation limit"]
  },
  {
    question: "Can I upgrade or downgrade my subscription plan at any time?",
    answer: "Yes. You can switch plans anytime in Dashboard > Settings > Billing. Upgrades take effect immediately with prorated billing, and downgrades apply at the end of the current billing cycle.",
    categoryKey: "pricing",
    tags: ["upgrade", "downgrade", "change plan", "proration", "billing"]
  },
  {
    question: "How do I download tax invoices and payment receipts?",
    answer: "All past invoices and downloadable PDF receipts with GST/VAT tax breakdown are available under Dashboard > Settings > Billing & Invoices.",
    categoryKey: "pricing",
    tags: ["invoices", "receipts", "pdf", "tax", "gst", "vat"]
  },
  {
    question: "Can I enter my corporate GSTIN or VAT tax registration number?",
    answer: "Yes. In Dashboard > Settings > Billing, enter your company legal name and GSTIN/VAT number so it appears on all generated tax invoices.",
    categoryKey: "pricing",
    tags: ["gstin", "vat number", "tax id", "corporate billing"]
  },
  {
    question: "Do you accept international currencies other than USD?",
    answer: "Yes. Through our Stripe payment gateway, we accept payments in USD ($), INR (₹), EUR (€), GBP (£), CAD, and AUD with automatic local conversion.",
    categoryKey: "pricing",
    tags: ["currency", "inr", "eur", "gbp", "international payments"]
  },
  {
    question: "What happens to my data if my subscription payment fails?",
    answer: "If a renewal payment fails, we provide a 7-day grace period with automatic retry reminders. Your chatbot remains active during the grace period before reverting to Free Tier mode.",
    categoryKey: "pricing",
    tags: ["payment failure", "grace period", "dunning", "retry", "card declined"]
  },
  {
    question: "Can I pay using bank wire transfer or ACH direct debit?",
    answer: "Annual Business and custom Enterprise tier contracts can be paid via ACH direct debit, SEPA transfer, or international wire transfer.",
    categoryKey: "pricing",
    tags: ["wire transfer", "ach", "sepa", "bank transfer", "enterprise billing"]
  },
  {
    question: "How can I pause my subscription temporarily without deleting data?",
    answer: "You can downgrade to the Free Tier to pause paid billing while keeping all your knowledge base FAQs, widget designs, and history intact.",
    categoryKey: "pricing",
    tags: ["pause", "hold", "free tier fallback", "keep data"]
  },
  {
    question: "Does Sahayak AI charge per user seat or per workspace?",
    answer: "Our pricing is workspace-based with conversation volume quotas, allowing you to invite unlimited team collaborators without paying per-seat license fees.",
    categoryKey: "pricing",
    tags: ["per seat", "user pricing", "workspace pricing", "unlimited users"]
  },

  // ==========================================
  // 5. TECHNICAL SUPPORT (15 FAQs)
  // ==========================================
  {
    question: "What browsers are supported by the Sahayak AI chatbot widget?",
    answer: "The chatbot widget supports all modern evergreen browsers including Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and Opera on desktop and mobile platforms.",
    categoryKey: "technical",
    tags: ["browsers", "compatibility", "chrome", "safari", "firefox", "edge"]
  },
  {
    question: "How do I embed the chatbot script tag on WordPress or Shopify?",
    answer: "Copy the script tag from Dashboard > Chatbot & Embed and paste it into your WordPress theme header.php file or Shopify theme.liquid file immediately before the closing </body> tag.",
    categoryKey: "technical",
    tags: ["wordpress", "shopify", "embed script", "cms", "integration"]
  },
  {
    question: "Does the embedded chatbot script affect my website load speed?",
    answer: "No. The embed script is under 15 KB, loads asynchronously with the defer attribute, and executes from a global edge CDN without blocking your core page rendering.",
    categoryKey: "technical",
    tags: ["speed", "performance", "cdn", "async", "core web vitals"]
  },
  {
    question: "How can I restrict which domain names can load my embed widget?",
    answer: "In Dashboard > Chatbot & Embed > Allowed Domains, enter your authorized website domains (e.g., example.com). Requests from unauthorized origins are rejected automatically.",
    categoryKey: "technical",
    tags: ["cors", "allowed domains", "domain whitelist", "security", "embed"]
  },
  {
    question: "What is the average response latency of the NLP matching engine?",
    answer: "Average NLP retrieval latency is between 2ms and 8ms for in-domain queries, ensuring instantaneous answers even during high-traffic spikes.",
    categoryKey: "technical",
    tags: ["latency", "speed", "response time", "performance", "benchmarks"]
  },
  {
    question: "How can I query the chatbot using our custom backend REST API?",
    answer: "Send a POST request to /api/chat with a JSON body containing workspaceId, query, and language. The API returns the matched answer, confidence score, and suggested follow-ups.",
    categoryKey: "technical",
    tags: ["api", "rest api", "backend", "post request", "integration"]
  },
  {
    question: "What should I do if the chatbot widget does not appear on my site?",
    answer: "Verify that the data-public-id attribute matches your widget ID, ensure your domain is listed in Allowed Domains, check your browser console for Content Security Policy errors, and disable aggressive ad-blockers.",
    categoryKey: "technical",
    tags: ["troubleshoot", "widget not loading", "debug", "console errors"]
  },
  {
    question: "Does Sahayak AI support Content Security Policy (CSP) headers?",
    answer: "Yes. To allow the widget under strict CSP, add our CDN domain to your script-src, connect-src, and frame-src directives.",
    categoryKey: "technical",
    tags: ["csp", "content security policy", "headers", "security", "whitelist"]
  },
  {
    question: "Can I trigger the chatbot to open automatically using JavaScript?",
    answer: "Yes. You can trigger the widget programmatically by calling window.SahayakAI.open() or window.SahayakAI.sendQuery('What are your hours?') from any custom button or script.",
    categoryKey: "technical",
    tags: ["javascript api", "sdk", "programmatic", "open bot", "trigger"]
  },
  {
    question: "How does the TF-IDF and Cosine Similarity vector model calculate relevance?",
    answer: "The preprocessor converts text into normalized n-gram token vectors with inverse document frequency weighting. Cosine similarity computes the cosine of the angle between query and FAQ vectors on a scale from 0.0 to 1.0.",
    categoryKey: "technical",
    tags: ["vector model", "tf-idf", "cosine similarity", "math", "algorithms"]
  },
  {
    question: "What threshold is used to distinguish between valid answers and fallbacks?",
    answer: "Our calibrated confidence threshold is 0.25 composite similarity. Scores above 0.25 trigger approved answers, while scores below 0.25 safely trigger graceful fallback navigation.",
    categoryKey: "technical",
    tags: ["threshold", "confidence", "fallback", "calibration", "guardrail"]
  },
  {
    question: "How do I configure incoming Webhooks to receive support requests?",
    answer: "In Dashboard > Settings > Webhooks, enter your server endpoint URL and secret key. We dispatch a JSON payload with ticket details whenever a human support request is submitted.",
    categoryKey: "technical",
    tags: ["webhooks", "endpoints", "payload", "event", "http"]
  },
  {
    question: "Can I connect Sahayak AI directly to an external Supabase PostgreSQL database?",
    answer: "Yes. You can provide your NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables to synchronize all FAQs, sessions, and tickets directly to your PostgreSQL database.",
    categoryKey: "technical",
    tags: ["supabase", "postgresql", "database", "sync", "sql"]
  },
  {
    question: "How does the speech recognition handle background noise?",
    answer: "The Web Speech API integrates your operating system's built-in noise suppression and acoustic beamforming to isolate the speaker's voice from ambient office and cafe noise.",
    categoryKey: "technical",
    tags: ["speech recognition", "noise suppression", "microphone", "audio quality"]
  },
  {
    question: "What is the technical support team's response time SLA?",
    answer: "Standard support tickets are answered within 12 business hours. Business tier customers receive 24/7 priority response within 2 hours.",
    categoryKey: "technical",
    tags: ["sla", "support response", "helpdesk", "turnaround", "hours"]
  },

  // ==========================================
  // 6. SECURITY (13 FAQs)
  // ==========================================
  {
    question: "Is Sahayak AI compliant with GDPR and CCPA data privacy laws?",
    answer: "Yes. Sahayak AI is fully compliant with GDPR and CCPA. We provide complete data export, configurable retention windows, PII masking, and right-to-be-forgotten deletion workflows.",
    categoryKey: "security",
    tags: ["gdpr", "ccpa", "compliance", "privacy", "regulation"]
  },
  {
    question: "How is multi-tenant workspace data segregated in the database?",
    answer: "Every workspace is assigned an isolated UUID. All database repositories enforce strict workspaceId filters on every query, preventing cross-tenant data leakage.",
    categoryKey: "security",
    tags: ["multi-tenant", "isolation", "tenancy", "quarantine", "segregation"]
  },
  {
    question: "What encryption standards protect data in transit and at rest?",
    answer: "All data in transit is encrypted using TLS 1.3 with forward secrecy. Data at rest is encrypted using AES-256 standard encryption across all storage tiers.",
    categoryKey: "security",
    tags: ["encryption", "tls 1.3", "aes-256", "cryptography", "security"]
  },
  {
    question: "How does the PII sanitizer identify and redact personal information?",
    answer: "The privacy sanitizer utilizes regular expression tokenizers to detect 16-digit credit card numbers, email addresses, phone numbers, and government identification strings, replacing them with [REDACTED] tokens before persistence.",
    categoryKey: "security",
    tags: ["pii", "redaction", "sanitizer", "credit card", "privacy"]
  },
  {
    question: "Does Sahayak AI train public AI models on our proprietary business data?",
    answer: "No. Your knowledge base FAQs, customer questions, and audit logs are strictly private to your workspace and are never used to train public models or shared with third parties.",
    categoryKey: "security",
    tags: ["training", "private", "confidentiality", "proprietary", "data ownership"]
  },
  {
    question: "Does Sahayak AI undergo regular third-party penetration testing?",
    answer: "Yes. We undergo bi-annual third-party penetration testing and automated daily vulnerability scans adhering to OWASP Top 10 security standards.",
    categoryKey: "security",
    tags: ["penetration testing", "vulnerability", "audit", "owasp", "security"]
  },
  {
    question: "How are administrative session tokens secured against tampering?",
    answer: "Authentication session cookies use HMAC-SHA256 signatures with HttpOnly, Secure, and SameSite=Lax flags, preventing cross-site scripting (XSS) and CSRF attacks.",
    categoryKey: "security",
    tags: ["session", "cookies", "hmac", "sha256", "csrf", "xss"]
  },
  {
    question: "Can I configure automatic chat history retention and deletion policies?",
    answer: "Yes. In Dashboard > Settings > Data Retention, you can configure conversations to automatically purge after 30, 60, 90, or 365 days, or retain indefinitely.",
    categoryKey: "security",
    tags: ["retention", "auto-purge", "data lifecycle", "compliance"]
  },
  {
    question: "How does Sahayak AI protect against Denial of Service (DoS) attacks?",
    answer: "Our edge infrastructure enforces Cloudflare DDoS mitigation alongside per-IP and per-workspace rate limiting to prevent abuse and malicious automated traffic.",
    categoryKey: "security",
    tags: ["ddos", "dos", "rate limit", "cloudflare", "firewall"]
  },
  {
    question: "Are employee access permissions governed by the Principle of Least Privilege?",
    answer: "Yes. Internal access to production customer environments requires multi-factor authentication, cryptographic key pairing, and justified approval logs with automatic expiration.",
    categoryKey: "security",
    tags: ["least privilege", "access control", "internal security", "audit"]
  },
  {
    question: "Does Sahayak AI provide SOC 2 Type II compliance reports?",
    answer: "Yes. SOC 2 Type II compliance attestation reports are available to Enterprise customers under standard non-disclosure agreement (NDA).",
    categoryKey: "security",
    tags: ["soc 2", "compliance", "audit report", "enterprise security"]
  },
  {
    question: "How are administrator passwords stored in the database?",
    answer: "Passwords are never stored in plaintext. They are cryptographically hashed using bcrypt with an adaptive work factor (salt rounds: 10).",
    categoryKey: "security",
    tags: ["bcrypt", "passwords", "hashing", "cryptography"]
  },
  {
    question: "Where can security researchers report potential vulnerabilities?",
    answer: "Security researchers can report findings to security@sahayak.ai. We operate an active responsible disclosure and bug bounty program.",
    categoryKey: "security",
    tags: ["bug bounty", "vulnerability disclosure", "researcher", "reporting"]
  },

  // ==========================================
  // 7. REFUNDS & POLICIES (12 FAQs)
  // ==========================================
  {
    question: "What is your money-back guarantee policy for new subscriptions?",
    answer: "We offer a 100% money-back guarantee within the first 14 days of subscribing to any paid plan if you are not completely satisfied with Sahayak AI.",
    categoryKey: "refunds",
    tags: ["money back", "guarantee", "satisfaction", "refund", "trial"]
  },
  {
    question: "How long does it take for an approved refund to reflect in my bank account?",
    answer: "Approved refunds are processed through our payment gateway within 24 hours and typically appear on your credit card or bank statement within 5 to 7 business days.",
    categoryKey: "refunds",
    tags: ["refund time", "processing", "timeline", "bank account", "days"]
  },
  {
    question: "How do I cancel my subscription before the next renewal date?",
    answer: "To cancel, navigate to Dashboard > Settings > Billing and click 'Cancel Subscription'. Your access remains active until the end of the paid billing period with no further charges.",
    categoryKey: "refunds",
    tags: ["cancel", "unsubscribe", "stop renewal", "cancellation"]
  },
  {
    question: "Can I receive a prorated refund if I cancel midway through an annual plan?",
    answer: "Annual plan cancellations requested after the initial 14-day guarantee period receive prorated service credit or partial refunds upon review by our customer success team.",
    categoryKey: "refunds",
    tags: ["annual refund", "prorated", "partial refund", "cancellation"]
  },
  {
    question: "Where can I read the full Terms of Service agreement?",
    answer: "Our complete Terms of Service agreement is accessible at /terms and outlines acceptable use, service availability, user responsibilities, and intellectual property terms.",
    categoryKey: "refunds",
    tags: ["terms", "tos", "legal", "agreement", "contract"]
  },
  {
    question: "Where can I review your Privacy Policy document?",
    answer: "Our Privacy Policy is available at /privacy and details our strict data collection limits, processing safeguards, cookie policy, and third-party disclosure protections.",
    categoryKey: "refunds",
    tags: ["privacy policy", "data protection", "legal", "cookie policy"]
  },
  {
    question: "What is the policy regarding automated abuse and web scraping?",
    answer: "Automated scraping, reverse engineering, or intentional flooding of chat endpoints is strictly prohibited and results in immediate account suspension under our Acceptable Use Policy.",
    categoryKey: "refunds",
    tags: ["abuse", "scraping", "acceptable use", "suspension", "terms"]
  },
  {
    question: "Do you offer a formal Service Level Agreement (SLA) credit for outages?",
    answer: "Yes. If system availability falls below our 99.9% monthly SLA commitment, affected Business tier customers are eligible for billing credits up to 30% of their monthly invoice.",
    categoryKey: "refunds",
    tags: ["sla credit", "outage credit", "compensation", "downtime"]
  },
  {
    question: "Who retains intellectual property ownership of the FAQs I upload?",
    answer: "You retain 100% intellectual property ownership of all FAQs, customer questions, brand logos, and content created or imported into your workspace.",
    categoryKey: "refunds",
    tags: ["ip ownership", "intellectual property", "content rights", "copyright"]
  },
  {
    question: "What happens to our knowledge base if Sahayak AI deprecates a feature?",
    answer: "We guarantee a minimum 6-month advance notice prior to modifying or deprecating any core API or service feature, along with automated data migration tools.",
    categoryKey: "refunds",
    tags: ["deprecation", "migration", "notice", "api lifecycle"]
  },
  {
    question: "How can I request a customized Data Processing Addendum (DPA)?",
    answer: "Customers operating under GDPR requirements can download our standard DPA or request an executed addendum by emailing legal@sahayak.ai.",
    categoryKey: "refunds",
    tags: ["dpa", "data processing addendum", "gdpr", "legal agreement"]
  },
  {
    question: "Can I change my billing country or tax residency after signing up?",
    answer: "Yes. You can update your billing address and tax jurisdiction under Dashboard > Settings > Billing. Changes take effect on the following billing cycle.",
    categoryKey: "refunds",
    tags: ["tax residency", "billing address", "jurisdiction", "country"]
  }
];
