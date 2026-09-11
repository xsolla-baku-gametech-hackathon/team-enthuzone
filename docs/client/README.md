# 📊 Web Dashboard & Landing Documentation

The **Client Dashboard** (`client/dashboard`) is a modern web application built on **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS**. It provides an evidence-based, data-dense operational environment for game studio Product Managers, QA Leads, and Game Designers to triage correlated player issues, compare game builds, inspect telemetry trends, and manage bot relays.

---

## 📑 Client Documentation Index

- [🏛️ Web Application Architecture](file:///docs/client/architecture.md) — Next.js 16 App Router structure, typed HTTP clients, component hierarchy, and design tokens.
- [🎨 User Experience & Operational Surfaces](file:///docs/client/user-experience.md) — Issue triage workflows, paired feedback/telemetry evidence cards, A/B build comparison, and marketing landing page.

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v20.0.0 or higher
- Running Core Platform Server on `http://127.0.0.1:4000`

### Installation & Execution
```bash
# Navigate to client dashboard directory
cd client/dashboard

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Edit `client/dashboard/.env`:
```ini
CORE_API_URL=http://127.0.0.1:4000
```

```bash
# Start development server with Turbopack
npm run dev

# Or build and start production server
npm run build
npm start
```

The web application will be accessible at `http://localhost:3000`.

---

## 🗺️ Key Routes Summary

| Route | Purpose | Audience |
|:---|:---|:---|
| `/landing` | High-conversion marketing showcase ("Signal Merge Program") | Public / Studios |
| `/login` | Secure JWT authentication entry | Registered Users |
| `/register` | Organization creation and Owner onboarding | New Studios |
| `/` | Operational Overview & Critical Issue highlights | Authenticated Studios |
| `/issues` | Correlated issues triage queue and detail views | PMs & QA Leads |
| `/feedback` | Live qualitative feedback stream with sentiment filters | Community Leads |
| `/telemetry` | Quantitative telemetry metrics, dropoffs, and completion rates | Game Designers |
| `/compare` | A/B Build Comparison (Baseline vs Current build deltas) | Release Engineers |
| `/bots` | Discord bot connection management and live playtest bots | QA & Leads |
| `/admin` | Super Admin governance, organization audits, and system logs | Super Admins |
