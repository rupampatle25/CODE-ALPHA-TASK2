# Sahayak AI: Supabase (PostgreSQL) Integration & Setup Guide

This beginner-friendly guide walks you step-by-step through setting up **Supabase (PostgreSQL)**, connecting it to **Sahayak AI**, creating the database tables, and verifying live database CRUD operations.

---

## 🌟 Overview & Architecture

Sahayak AI features a **hybrid database adapter pattern**:
- **With Supabase Configured**: All FAQs, categories, chat sessions, user dialogue turns, and visitor feedback synchronize to your cloud PostgreSQL database in Supabase.
- **Without Supabase Configured / Offline Fallback**: If `.env.local` contains empty placeholders (e.g., during offline lab presentations or automated testing), the application seamlessly uses its local JSON store so it **never crashes**.

---

## 1. How to Create the Database on Supabase

1. **Sign Up / Log In**:
   - Navigate to **[https://supabase.com](https://supabase.com)** and create a free account (or sign in with GitHub).
2. **Create a New Project**:
   - On the Supabase dashboard, click the **"New Project"** button.
   - Choose an Organization (or create one, e.g., `FAQPilot Organization`).
   - Fill in the project details:
     - **Name**: `faqpilot-ai`
     - **Database Password**: Choose a strong password (save it in a safe place).
     - **Region**: Select a region close to your location (e.g., `East US`, `South Asia / Mumbai`, `Central Europe`).
     - **Pricing Plan**: Select **Free Plan** ($0/month).
   - Click **"Create new project"**.
   - Supabase will take approximately 1 to 2 minutes to deploy and provision your PostgreSQL cluster.

---

## 2. How to Connect Supabase to Your Project

1. **Retrieve API Credentials**:
   - Once your project is ready, click the **Project Settings** (gear icon) in the left sidebar.
   - Click on **API** in the settings menu.
   - You will see two important sections:
     - **Project URL**: Starts with `https://xxxxxxxxxxxx.supabase.co`.
     - **Project API Keys**:
       - `anon` `public`: Safe for frontend / browser access.
       - `service_role` `secret`: **CONFIDENTIAL!** Grants full administrative backend access.
2. **Configure `.env.local`**:
   - In your project root folder (`c:\Users\l\OneDrive\Desktop\task 2`), open `.env.local` (or copy `.env.example` to `.env.local`):
     ```bash
     cp .env.example .env.local
     ```
   - Paste your copied keys into `.env.local`:
     ```env
     # Public Supabase Project URL
     NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

     # Public Anonymous Key
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

     # Secret Service Role Key (NEVER exposed to frontend browser)
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

> [!SECURITY]
> The `SUPABASE_SERVICE_ROLE_KEY` is exclusively consumed by server-side Next.js route handlers (`src/lib/supabase/server.ts`). It is **never** bundled or transmitted to the client's browser.

---

## 3. Where Database Code is Located in the Project

The database integration is organized into a clean, modular structure:

| File / Folder | Purpose |
|---|---|
| [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/l/OneDrive/Desktop/task%202/supabase/migrations/001_initial_schema.sql) | Complete SQL migration script defining tables, foreign keys, and indexes. |
| [`src/lib/supabase/client.ts`](file:///c:/Users/l/OneDrive/Desktop/task%202/src/lib/supabase/client.ts) | Public Supabase client for browser contexts using the `anon` key. |
| [`src/lib/supabase/server.ts`](file:///c:/Users/l/OneDrive/Desktop/task%202/src/lib/supabase/server.ts) | Administrative server-side client with `isSupabaseConfigured()` detector. |
| [`src/lib/supabase/repository.ts`](file:///c:/Users/l/OneDrive/Desktop/task%202/src/lib/supabase/repository.ts) | Supabase PostgreSQL queries for FAQs, chat sessions, messages, and feedback. |
| [`src/lib/db/index.ts`](file:///c:/Users/l/OneDrive/Desktop/task%202/src/lib/db/index.ts) | Unified repository layer providing dual-sync and fallback handling. |

---

## 4. How to Create the Tables in Supabase

1. Open your **Supabase Dashboard** in your browser.
2. In the left navigation bar, click on **"SQL Editor"** (icon looks like `>_`).
3. Click **"New Query"**.
4. Open the SQL migration file in your project:
   [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/l/OneDrive/Desktop/task%202/supabase/migrations/001_initial_schema.sql).
5. Copy the entire contents of `001_initial_schema.sql` and paste them into the Supabase SQL Editor box.
6. Click the green **"Run"** button (or press `Ctrl + Enter`).
7. **Verify Table Creation**:
   - In the left sidebar, click **"Table Editor"** (table grid icon).
   - You should see all 11 tables created with pre-seeded data:
     - `faqs` (Pre-seeded with 10 approved TechNova FAQs)
     - `faq_categories` (`cat_billing`, `cat_technical`, etc.)
     - `chat_sessions`
     - `chat_messages`
     - `chat_feedback`
     - `workspaces` (`ws_technova_demo`)
     - `users` (`demo@faqpilot.ai`)
     - `widget_configs`
     - `usage_quotas`
     - `support_tickets`

---

## 5. How to Run the Project

1. Open your terminal in the project directory:
   ```powershell
   cd "c:\Users\l\OneDrive\Desktop\task 2"
   ```
2. Start the development server:
   ```powershell
   npm run dev
   ```
3. Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 6. How to Test Database Operations (Step-by-Step)

### Test A: FAQ Management (CRUD Operations)
1. Navigate to **[http://localhost:3000/login](http://localhost:3000/login)**.
2. Click **"Fill Demo"** (`demo@faqpilot.ai` / `demo1234`) and click **"Sign In to Dashboard"**.
3. In the sidebar, click **"Knowledge Base (FAQs)"** (`/dashboard/faqs`).
4. **Create**: Click **"+ Add New FAQ"**:
   - **Question**: `Do you offer weekend customer support?`
   - **Answer**: `Yes, our emergency on-call team provides 24/7 coverage on weekends for Enterprise accounts.`
   - **Category**: Technical & API
   - **Tags**: `weekend, support, hours, emergency`
   - Click **"Create FAQ"**.
5. Check your Supabase Dashboard under **Table Editor > faqs**: the new row appears with its assigned UUID and timestamps.
6. **Update**: Click the **Edit** (pencil) icon next to the question, change the answer slightly, and click **"Save Changes"**. Check Supabase to confirm the updated answer.
7. **Delete**: Click the **Trash** icon to delete an FAQ. Check Supabase to verify the row is removed.

### Test B: Grounded Retrieval Matching from the Database
1. Go to the chatbot preview on the landing page or `/dashboard/chatbot`.
2. Ask the question you just created:
   ```text
   Do you offer weekend customer support?
   ```
3. The chatbot matches the question using Vector Cosine Similarity and returns your answer directly from the database!

### Test C: Chat History Logging & Feedback
1. Ask any question in the chatbot.
2. In Supabase Table Editor:
   - Check `chat_sessions`: A new conversation session record is logged.
   - Check `chat_messages`: Both the user's question and the chatbot's answer are logged. If sensitive numbers were provided, verify they were scrubbed before write.
3. Click the **Thumbs Up** (Helpful) button beneath the chatbot's answer.
4. Check `chat_feedback` in Supabase: The feedback record is created with rating `'HELPFUL'`.
