# FAQPilot AI: Production Deployment Guide

This guide covers deploying **FAQPilot AI** to production platforms such as Vercel, Railway, Render, or a custom VPS.

---

## 1. Environment Variables Template (`.env.example`)

Create a `.env.local` or configure environment variables in your hosting provider:

```env
# Node Environment
NODE_ENV=production

# Cryptographic Session Secret (Generate a 32+ character random string)
SESSION_SECRET=a8f93e7c10b42d6a5e8f19c3b7a2d4e689f0123456789abcdef0123456789abc

# Application Base URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Managed PostgreSQL Database (For cloud production scale)
# DATABASE_URL=postgresql://user:password@host:5432/faqpilot?sslmode=require
```

---

## 2. Deploying to Vercel (Recommended)

1. Push your project to a GitHub repository:
   ```powershell
   git add .
   git commit -m "feat: complete FAQPilot AI production release"
   git push origin main
   ```
2. Log in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the Framework Preset to **Next.js**.
5. Add the `SESSION_SECRET` environment variable in the Vercel dashboard.
6. Click **Deploy**.

Vercel will run `npm run build` and automatically provision serverless Route Handlers and Edge CDN caching!

---

## 3. Production Build & Self-Hosting

To run on an Ubuntu / Debian VPS or Docker container:

```bash
# 1. Clone repository
git clone https://github.com/your-username/faqpilot-ai.git
cd faqpilot-ai

# 2. Install dependencies
npm ci

# 3. Create production build
npm run build

# 4. Start production server (default port 3000)
npm run start
```

Use a process manager like **PM2** to keep the server running continuously:
```bash
npm install -g pm2
pm2 start "npm run start" --name "faqpilot"
pm2 save
pm2 startup
```

---

## 4. Reverse Proxy & SSL (Nginx Configuration)

```nginx
server {
    server_name support.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Secure with Let's Encrypt SSL:
```bash
sudo certbot --nginx -d support.yourdomain.com
```
