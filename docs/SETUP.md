# FAQPilot AI: Local Setup & Getting Started Guide

This guide walks you through running **FAQPilot AI** locally on your machine with zero configuration.

---

## 1. Prerequisites

- **Node.js**: Version 18.0 or higher (Tested and verified on Node.js `v20.18.0`).
- **npm**: Version 9.0 or higher (Tested on npm `10.8.2`).
- **Operating System**: Windows, macOS, or Linux.
- **Git**: Optional (for version control).

---

## 2. Quick Start (1-Minute Run)

Open your terminal or PowerShell inside the project directory:

```powershell
# 1. Install dependencies (if not already installed)
npm install

# 2. Run the development server
npm run dev
```

Open your browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## 3. Demo Credentials (For Evaluation & Testing)

The system includes pre-seeded demo data for instant evaluation:

- **Login URL**: `http://localhost:3000/login`
- **Email**: `demo@faqpilot.ai`
- **Password**: `demo1234`
- **Workspace Name**: `Sahayak AI`
- **Public Widget ID**: `tn-public-bot-982`

*(Tip: On the login page, you can simply click the **"Fill Demo"** button to populate credentials in one click).*

---

## 4. Available NPM Scripts

| Command | Action |
|---|---|
| `npm run dev` | Starts local Next.js development server on `http://localhost:3000` |
| `npm run build` | Builds optimized production bundle with full TypeScript check |
| `npm run start` | Runs the production server after building |
| `npm run lint` | Runs ESLint analysis across codebase |
| `npx tsx evaluation/run_eval.ts` | Runs the automated NLP benchmark evaluation suite |

---

## 5. Running the NLP Benchmark Evaluation

To verify the mathematical NLP accuracy and out-of-domain rejection:

```powershell
npx --yes tsx evaluation/run_eval.ts
```

Expected output:
- **In-Domain Top-1 Accuracy**: ~92.3%
- **Out-of-Domain Fallback Rate**: 100.0% (Zero false positives)
- **Average NLP Latency**: ~3 ms

---

## 6. Testing the Embeddable Chatbot on External Websites

You can test the embeddable chatbot on any web page by copying this snippet:

```html
<!-- Add right before closing </body> tag -->
<script
  src="http://localhost:3000/widget.js"
  data-public-id="tn-public-bot-982"
  defer>
</script>
```

Or preview the standalone widget directly in your browser:
**`http://localhost:3000/widget/tn-public-bot-982`**

---

## 7. Troubleshooting

- **Port 3000 already in use**:
  ```powershell
  npx next dev -p 3001
  ```
- **Resetting data**:
  Delete `data/faqpilot.json`. The application will automatically regenerate clean seed data upon next request.
