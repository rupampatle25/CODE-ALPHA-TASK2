# Sahayak AI: Admin Login & Role-Based Access Control (RBAC) Guide

This guide explains how the **Admin Login section** and **Role-Based Access Control (RBAC)** work in **Sahayak AI**, how to configure credentials securely via environment variables, and how to test the system during college project evaluations or production deployments.

---

## 1. Architecture Overview

In Sahayak AI, security and access control are built following industry-standard multi-tenant principles:

```
┌─────────────────────────────────────────────────────────────┐
│                    Login Page (/login)                      │
│   ┌──────────────────────────┬──────────────────────────┐   │
│   │   Workspace User Login   │    Admin Portal Tab      │   │
│   └──────────────────────────┴──────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                POST /api/auth/login
                               │
            ┌──────────────────▼──────────────────┐
            │   Server-Side Authentication       │
            │  1. Lookup user in database         │
            │  2. Verify bcrypt password hash     │
            │  3. Validate admin role if portal   │
            │  4. Sign session (HMAC-SHA256)      │
            │  5. Issue HttpOnly session cookie   │
            └──────────────────┬──────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
    [System Admin User]            [Workspace Member]
    Email: rupam@gmail.com         Email: demo@sahayak.ai
    Role: ADMIN                    Role: OWNER / MEMBER
    Permissions: Global            Permissions: Isolated Tenant
```

---

## 2. Admin Credentials Configuration

### Development Default Credentials
- **Admin Email**: `rupam@gmail.com`
- **Default Password**: `Admin@1234`
- **System Role**: `ADMIN`

### Setting a Custom Admin Password
The admin password is **never hardcoded in frontend code**. You can set or change it at any time in `.env.local`:

```env
# In .env.local
ADMIN_EMAIL=rupam@gmail.com
ADMIN_PASSWORD=YourCustomSecretPassword2026!
```

> **Why this is secure**:
> 1. Next.js variables without `NEXT_PUBLIC_` are strictly private to the server runtime.
> 2. Passwords are saved and verified using **bcrypt** (cost factor 10).
> 3. Sessions use cryptographically signed HMAC-SHA256 tokens stored in `HttpOnly`, `SameSite=Lax` cookies, preventing XSS and CSRF token theft.

---

## 3. Features of the Admin Login Section

1. **Tabbed Switcher**:
   - **Workspace Login**: Used by business team members and college evaluators (`demo@sahayak.ai`).
   - **Admin Portal**: Restricted administrative console for `rupam@gmail.com`.
2. **Show / Hide Password Toggle**:
   - Integrated eye icon (`Eye` / `EyeOff`) to easily inspect typed passwords on desktop and mobile browsers.
3. **Quick Test Helper**:
   - A 1-click **"Fill Admin"** button fills `rupam@gmail.com` and `Admin@1234` for rapid evaluation without manual typing.
4. **Credential Validation & Clear Error Messages**:
   - Submitting an empty field, incorrect password, or non-admin account into the Admin Portal triggers descriptive red alerts.
5. **Role-Based Redirect**:
   - Successful admin login directs the user to `/dashboard` with prominent **SYSTEM ADMIN** badges across the sidebar and navigation bar.

---

## 4. Administrative Privileges

Once logged in as an administrator (`rupam@gmail.com`), you have full operational control:

| Capability | Location in App | Description |
| :--- | :--- | :--- |
| **Add FAQs** | `/dashboard/faqs` | Create new ground-truth FAQs with tags, questions, and answers. |
| **Edit FAQs** | `/dashboard/faqs` | Modify existing FAQ answers, category classifications, and tags. |
| **Delete FAQs** | `/dashboard/faqs` | Remove obsolete questions from the AI knowledge base. |
| **Manage FAQ Categories** | `/dashboard/faqs` $\to$ **Categories** | Create new colored topics (e.g. *Shipping*, *Refunds*) or delete categories. |
| **View User Questions** | `/dashboard/conversations` | Inspect visitor conversation history, question logs, and PII-scrubbed queries. |
| **View Chatbot Feedback** | `/dashboard/analytics` | Monitor helpful vs. unhelpful visitor ratings and fallback rates. |
| **View Support Requests** | `/dashboard/support` | Review tickets submitted by visitors when the chatbot could not answer. |
| **Secure Logout** | Sidebar Bottom | Destroys the HMAC session cookie and returns to the login page. |

---

## 5. Role-Based Access Control (RBAC) Server Enforcement

Server-side routes enforce strict permissions using `verifyWorkspaceAccess` and `verifyAdminAccess`:

```typescript
// Non-admin or viewer accounts are blocked from administrative mutations:
const { hasAccess, role } = await verifyWorkspaceAccess(session.userId, workspaceId);
if (!hasAccess || role === 'VIEWER') {
  return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
}
```

- Unauthorized visitors or non-admin users attempting to POST, PATCH, or DELETE FAQs or categories receive **HTTP 403 Forbidden**.
- Visitors querying the public widget `/api/widget/[publicId]/chat` can only read matching answers, never alter the knowledge base.

---

## 6. Step-by-Step Testing Instructions (College Viva / Evaluation)

### Test 1: Admin Login with Correct Credentials
1. Open the app in your browser: `http://localhost:3000/login`.
2. Click the **"Admin Portal"** tab.
3. Click the **"Fill Admin"** button (or manually type `rupam@gmail.com` and `Admin@1234`).
4. Click the **Eye icon** to reveal and verify the password.
5. Click **"Sign In as System Admin"**.
6. **Expected Result**: Successfully redirected to `/dashboard`. Notice the **SYSTEM ADMIN** badge in the sidebar and top navigation bar.

### Test 2: Rejection of Invalid Password
1. Log out or navigate back to `/login`.
2. Go to **"Admin Portal"**.
3. Enter `rupam@gmail.com` and a wrong password like `WrongPassword999`.
4. Click **"Sign In as System Admin"**.
5. **Expected Result**: Login rejected with HTTP 401: *"Invalid email or password"*.

### Test 3: Rejection of Non-Admin into Admin Portal
1. On the **Admin Portal** tab, enter a regular user email (e.g., `member@example.com` or non-admin account).
2. Click **"Sign In as System Admin"**.
3. **Expected Result**: Rejection with *"Access denied: This account does not possess administrator privileges"*.

### Test 4: Admin FAQ & Category Management
1. In the dashboard, navigate to **Knowledge Base (FAQs)** (`/dashboard/faqs`).
2. Click **Categories** $\to$ Add a new category (e.g. `Admissions & Enrollment`, color `#10B981`).
3. Click **Add FAQ** $\to$ Create a question assigned to the new category.
4. Verify the FAQ appears in the list and can be edited or deleted.

### Test 5: Secure Logout
1. Click the **Logout** button (door icon) at the bottom of the left sidebar.
2. **Expected Result**: Session cookie cleared and redirected back to `/login`. Attempting to visit `/dashboard` directly redirects back to `/login`.
