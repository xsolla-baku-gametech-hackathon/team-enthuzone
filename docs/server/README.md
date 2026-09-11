# 🖥️ Core Platform Server Documentation

The **Core Platform Server** is the central backbone of the **Player Issue Intelligence** platform. It provides high-throughput ingestion gateways, multi-tenant organization boundaries, atomic database operations via MongoDB, issue clustering, evidence linkage, and operational REST APIs consumed by the Next.js frontend.

---

## 📑 Server Documentation Index

- [🏛️ Server Architecture](file:///docs/server/architecture.md) — Hexagonal vertical slices, dependency inversion, modules breakdown.
- [📡 API Reference](file:///docs/server/api-reference.md) — Comprehensive endpoints guide, authentication headers, request/response schemas.
- [🍃 Data Models & Schemas](file:///docs/server/data-models.md) — MongoDB collections, Mongoose schemas, compound indexes, and multi-tenancy guarantees.

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **MongoDB**: v6.0 or higher (Must be running as a **replica set** or Atlas cluster for multi-document transaction support)

### Installation & Execution
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Start server in production mode
npm start

# Or start in watch mode for development
npm run dev
```

### Environment Variables (`server/.env`)
```ini
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/player_issue_intelligence
CORS_ORIGINS=*
HTTP_BODY_LIMIT=1mb
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
JWT_EXPIRES_IN=15m
PASSWORD_HASH_ROUNDS=12
AI_SERVICE_URL=http://127.0.0.1:4001
AI_INTERNAL_TOKEN=replace-with-at-least-32-random-characters
```

---

## 🧪 Automated Testing

The server includes isolated unit tests (using memory adapters) and end-to-end integration tests:

```bash
# Run test suite
npm test
```
