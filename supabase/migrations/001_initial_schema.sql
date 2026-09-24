-- =====================================================================
-- FAQPilot AI: Supabase PostgreSQL Initial Migration Schema
-- Fulfilling College Assignment Task 2 & Multi-Tenant SaaS Architecture
-- =====================================================================

-- 1. Enable UUID Extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 2. CORE MULTI-TENANT TABLES
-- =====================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'OWNER' CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces Table (Tenant Isolation Boundary)
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    retention_days INTEGER DEFAULT 90,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE IF NOT EXISTS workspace_members (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) DEFAULT 'OWNER' CHECK (role IN ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- =====================================================================
-- 3. KNOWLEDGE BASE TABLES (TASK 2 CORE)
-- =====================================================================

-- FAQ Categories Table
CREATE TABLE IF NOT EXISTS faq_categories (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(32) DEFAULT '#6B7280',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQs Table (Knowledge Base Ground-Truth)
CREATE TABLE IF NOT EXISTS faqs (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    category_id VARCHAR(64) REFERENCES faq_categories(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_enabled BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 4. CONVERSATIONAL AUDIT & MESSAGING TABLES
-- =====================================================================

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    channel VARCHAR(32) DEFAULT 'DASHBOARD' CHECK (channel IN ('DASHBOARD', 'WIDGET', 'TEST')),
    session_type VARCHAR(32) DEFAULT 'VISITOR' CHECK (session_type IN ('VISITOR', 'ADMIN')),
    status VARCHAR(32) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED', 'FALLBACK')),
    message_count INTEGER DEFAULT 0,
    last_message_snippet TEXT,
    visitor_id VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages Table (With PII Flags)
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('USER', 'ASSISTANT')),
    content TEXT NOT NULL,
    matched_faq_id VARCHAR(64) REFERENCES faqs(id) ON DELETE SET NULL,
    similarity_score NUMERIC(5, 4),
    is_fallback BOOLEAN DEFAULT FALSE,
    latency_ms INTEGER DEFAULT 0,
    has_pii BOOLEAN DEFAULT FALSE,
    redacted_types TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor Feedback Ratings
CREATE TABLE IF NOT EXISTS chat_feedback (
    id VARCHAR(64) PRIMARY KEY,
    message_id VARCHAR(64) NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    rating VARCHAR(32) NOT NULL CHECK (rating IN ('HELPFUL', 'UNHELPFUL')),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id)
);

-- =====================================================================
-- 5. WIDGET, QUOTA & SUPPORT TICKETS
-- =====================================================================

-- Embeddable Widget Configuration
CREATE TABLE IF NOT EXISTS widget_configs (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    public_id VARCHAR(64) UNIQUE NOT NULL,
    bot_name VARCHAR(255) DEFAULT 'Virtual Assistant',
    welcome_message TEXT DEFAULT 'Hello! How can I help you today?',
    primary_color VARCHAR(32) DEFAULT '#2563EB',
    suggested_questions TEXT[] DEFAULT '{}',
    allowed_domains TEXT[] DEFAULT '{"*"}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Quotas Table
CREATE TABLE IF NOT EXISTS usage_quotas (
    id VARCHAR(64) PRIMARY KEY,
    workspace_id VARCHAR(64) UNIQUE NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    plan_tier VARCHAR(32) DEFAULT 'FREE' CHECK (plan_tier IN ('FREE', 'STARTER', 'BUSINESS')),
    monthly_limit INTEGER DEFAULT 500,
    current_usage INTEGER DEFAULT 0,
    billing_cycle_start TIMESTAMPTZ DEFAULT NOW()
);

-- Support Escalation Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(32) NOT NULL,
    workspace_id VARCHAR(64) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    session_id VARCHAR(64) REFERENCES chat_sessions(id) ON DELETE SET NULL,
    visitor_name VARCHAR(255) NOT NULL,
    visitor_email VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(64),
    question TEXT NOT NULL,
    details TEXT,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    priority VARCHAR(32) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    resolved_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 6. PERFORMANCE INDEXES
-- =====================================================================

CREATE INDEX IF NOT EXISTS idx_faqs_workspace ON faqs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_enabled ON faqs(workspace_id, is_enabled);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_workspace ON chat_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_type ON chat_sessions(workspace_id, session_type);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_workspace ON chat_messages(workspace_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_workspace ON support_tickets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(workspace_id, status);

CREATE INDEX IF NOT EXISTS idx_widget_public_id ON widget_configs(public_id);

-- =====================================================================
-- 7. PRE-SEEDED DEMO WORKSPACE DATA (SAHAYAK AI)
-- =====================================================================

-- Demo User (Alex Rivera - password: demo1234)
INSERT INTO users (id, email, password_hash, name, role)
VALUES (
    'usr_demo_admin',
    'demo@faqpilot.ai',
    '$2a$10$wEkg/jG5r55W0M/K5w6JPe8z9sR3yL2XW.M2qQx0M5w1uW4fB4Y1C',
    'Alex Rivera',
    'OWNER'
) ON CONFLICT (id) DO NOTHING;

-- System Administrator User (Rupam - password configured via ADMIN_PASSWORD)
INSERT INTO users (id, email, password_hash, name, role)
VALUES (
    'usr_admin_rupam',
    'rupam@gmail.com',
    '$2a$10$7ARDRMrWGYPrq0rYGzBMyO0m8sUHYvGmHeurh6uk1nApKNthC3AkO',
    'Rupam (System Admin)',
    'ADMIN'
) ON CONFLICT (id) DO NOTHING;

-- Demo Workspace
INSERT INTO workspaces (id, name, slug, description, owner_id, retention_days)
VALUES (
    'ws_technova_demo',
    'Sahayak AI',
    'sahayak-ai',
    'Official Sahayak AI customer support and automated knowledge base.',
    'usr_demo_admin',
    90
) ON CONFLICT (id) DO NOTHING;

-- Workspace Membership
INSERT INTO workspace_members (id, workspace_id, user_id, role)
VALUES (
    'wsm_demo_owner',
    'ws_technova_demo',
    'usr_demo_admin',
    'OWNER'
),
(
    'wsm_admin_rupam',
    'ws_technova_demo',
    'usr_admin_rupam',
    'ADMIN'
) ON CONFLICT (id) DO NOTHING;

-- Categories
INSERT INTO faq_categories (id, workspace_id, name, color) VALUES
('cat_billing', 'ws_technova_demo', 'Billing & Plans', '#10B981'),
('cat_technical', 'ws_technova_demo', 'Technical & API', '#3B82F6'),
('cat_account', 'ws_technova_demo', 'Account & Security', '#8B5CF6'),
('cat_general', 'ws_technova_demo', 'General Inquiries', '#6B7280')
ON CONFLICT (id) DO NOTHING;

-- 10 Approved FAQs
INSERT INTO faqs (id, workspace_id, category_id, question, answer, tags, is_enabled, view_count) VALUES
('faq_1', 'ws_technova_demo', 'cat_billing', 'What subscription pricing plans do you offer?', 'We offer three transparent subscription tiers: Starter ($29/month) for small teams, Professional ($79/month) with advanced analytics, and Enterprise ($199/month) with dedicated support and custom integrations. All plans include a 14-day free trial with no credit card required.', ARRAY['pricing', 'plans', 'cost', 'subscription', 'tiers'], true, 84),
('faq_2', 'ws_technova_demo', 'cat_billing', 'What is your refund policy if I am not satisfied?', 'We offer a full 14-day money-back guarantee on all first-time subscriptions. If you are unsatisfied for any reason within the first 14 days of purchase, contact billing@technova.example.com for an immediate full refund.', ARRAY['refund', 'money back', 'guarantee', 'cancellation', 'return'], true, 52),
('faq_3', 'ws_technova_demo', 'cat_technical', 'What are the API rate limits for requests?', 'Standard API plans include a rate limit of 60 requests per minute and 5,000 requests per day. Business tier accounts can request custom rate limits up to 300 requests per minute by contacting our engineering support team.', ARRAY['api', 'rate limit', 'limits', 'requests', 'throttle'], true, 29),
('faq_4', 'ws_technova_demo', 'cat_account', 'How do I reset my account password if I forgot it?', 'Click the "Forgot Password" link on the login screen, enter your registered email address, and we will send you a secure password reset link valid for 60 minutes.', ARRAY['password', 'reset', 'forgot', 'login', 'account'], true, 19),
('faq_5', 'ws_technova_demo', 'cat_account', 'Is two-factor authentication (2FA) supported?', 'Yes, two-factor authentication (2FA) using TOTP apps such as Google Authenticator, Authy, or 1Password is supported and recommended for all workspace members under Account Settings > Security.', ARRAY['2fa', 'security', 'authenticator', 'totp', 'mfa'], true, 15),
('faq_6', 'ws_technova_demo', 'cat_technical', 'How do I embed the chatbot widget onto my website?', 'Go to your Dashboard > Chatbot Embed page, copy the generated <script> code snippet, and paste it right before the closing </body> tag of your website HTML or theme file. It works on plain HTML, WordPress, Shopify, Next.js, and Webflow.', ARRAY['embed', 'widget', 'integrate', 'website', 'script'], true, 65),
('faq_7', 'ws_technova_demo', 'cat_billing', 'Which payment methods do you accept?', 'We accept all major credit and debit cards (Visa, MasterCard, American Express), Net Banking, and UPI (via Razorpay in supported regions). Invoicing with bank transfers is available for annual Business plans.', ARRAY['payment', 'credit card', 'upi', 'cards', 'billing'], true, 24),
('faq_8', 'ws_technova_demo', 'cat_technical', 'Where is customer data hosted and is it encrypted?', 'All data is encrypted in transit using TLS 1.3 and encrypted at rest using AES-256. Our primary databases are hosted in ISO 27001 and SOC 2 Type II certified data centers with strict tenant isolation.', ARRAY['security', 'encryption', 'data', 'hosting', 'compliance', 'privacy'], true, 31),
('faq_9', 'ws_technova_demo', 'cat_billing', 'What happens if my workspace exceeds the monthly conversation limit?', 'If you reach your plan limit, your widget continues running, but subsequent incoming queries will display a friendly rate limit notification unless you upgrade your tier or enable burst allowance in billing settings.', ARRAY['limit', 'quota', 'exceed', 'usage', 'overage'], true, 18),
('faq_10', 'ws_technova_demo', 'cat_technical', 'How do I contact customer support if my issue is not answered?', 'You can email our support team directly at support@technova.example.com or submit a ticket through the dashboard. Priority support response time is within 2 hours during business hours (9 AM - 6 PM EST).', ARRAY['support', 'contact', 'help', 'email', 'agent'], true, 44)
ON CONFLICT (id) DO NOTHING;

-- Widget Config
INSERT INTO widget_configs (id, workspace_id, public_id, bot_name, welcome_message, primary_color, suggested_questions)
VALUES (
    'wc_technova',
    'ws_technova_demo',
    'tn-public-bot-982',
    'Sahayak AI',
    'Hello! I am Sahayak AI. Ask me about features, API limits, refunds, or technical support.',
    '#2563EB',
    ARRAY['What pricing plans do you offer?', 'What is your refund policy?', 'How do I embed the chatbot widget?', 'What are the API rate limits?']
) ON CONFLICT (id) DO NOTHING;

-- Usage Quota
INSERT INTO usage_quotas (id, workspace_id, plan_tier, monthly_limit, current_usage)
VALUES (
    'uq_technova',
    'ws_technova_demo',
    'FREE',
    500,
    12
) ON CONFLICT (id) DO NOTHING;
