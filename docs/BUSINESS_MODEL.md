# FAQPilot AI: SaaS Business Model & Unit Economics

This document outlines the commercial strategy, pricing models, unit economics, and market positioning for **FAQPilot AI**.

---

## 1. Customer Pain Points & Value Proposition

| Customer Segment | Pain Point | FAQPilot AI Solution |
|---|---|---|
| **Coaching Institutes & Colleges** | Staff spends 4+ hours daily answering repetitive admission, fee, and syllabus questions. | Instant 24/7 self-service widget trained on official prospectuses. |
| **E-Commerce Stores** | High cart abandonment due to unanswered return policy, shipping time, and size queries. | Lightweight floating widget with zero latency and verified answers. |
| **Local Clinics & Doctors** | Receptionist phone lines tied up with visiting hours, consultation fees, and appointment queries. | Clear, grounded virtual assistant with medical safety disclaimers. |
| **SaaS Startups** | Expensive support software (Intercom/Zendesk) costing $100s/month per seat. | Flat-rate self-hosted or affordable multi-tenant support at a fraction of the cost. |

---

## 2. Subscription Pricing Strategy

| Tier | Monthly Price | Monthly Conversations | FAQs | Target Audience |
|---|---|---|---|---|
| **Free Tier** | **$0** | 500 | 50 | Students, early testing, micro projects |
| **Starter** | **$29 / mo** | 5,000 | Unlimited | Growing small businesses, clinics |
| **Business** | **$99 / mo** | 25,000 | Unlimited | Colleges, institutions, e-commerce |

---

## 3. Unit Economics & Gross Margin Analysis

Unlike LLM-heavy architectures that incur $0.005 to $0.02 per conversation turn on external OpenAI / Claude API tokens, **FAQPilot AI uses a deterministic vector math pipeline (TF-IDF + Cosine dot products)** executing locally in under 4ms:

- **Compute Cost Per 1,000 Queries**: $\approx \$0.002$ (CPU memory execution).
- **Database & Storage Cost**: $\approx \$0.001$ per active workspace per month.
- **Hosting (Vercel Serverless / VPS)**: $\$20 / \text{month}$ handles up to $500,000+$ requests.

### Gross Margin Calculation (Starter Tier @ $29/mo):
- **Revenue**: $\$29.00$
- **Payment Processing Fee (Stripe/Razorpay 2.9% + $0.30)**: $-\$1.14$
- **Compute & Storage Infrastructure**: $-\$0.15$
- **Net Contribution Margin**: $\mathbf{\$27.71}$ (**95.5% Gross Margin**).

---

## 4. Competitive Differentiation

| Capability | Generic LLM Chatbots | Traditional Live Chat (Zendesk) | FAQPilot AI |
|---|---|---|---|
| **Hallucination Risk** | High (Can invent policies) | N/A (Human required) | **Zero (Strictly Grounded)** |
| **Response Latency** | 2,000 – 4,000 ms | Minutes to Hours | **&lt; 5 ms** |
| **Monthly Cost** | High (Token billing) | $50 - $150 / agent seat | **Affordable Flat Tier** |
| **Setup Time** | Complex prompt engineering | Days of onboarding | **&lt; 2 Minutes (CSV Import)** |
| **Deployment** | Heavy multi-service API | Heavy client scripts | **Single Lightweight Script** |
