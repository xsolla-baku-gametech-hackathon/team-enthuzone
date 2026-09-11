# 🧠 AI Intelligence Service Documentation

The **AI Intelligence Service** (`ai-service`) is an isolated microservice that bridges unstructured player communication with actionable game engineering insights. Powered by **Google Gemini 2.5 Flash** and deterministic mathematical normalization engines, it classifies issues, extracts targets, detects spam/prompt injections, calculates correlation confidence scores against telemetry anomalies, and generates grounded patch advice.

---

## 📑 AI Service Documentation Index

- [🏛️ AI Architecture & Gemini Integration](file:///docs/ai-service/architecture.md) — LLM structured outputs, JSON schema enforcement, prompt injection defense, rate limiting.
- [📐 Normalization & Correlation Math](file:///docs/ai-service/correlation-engine.md) — Unicode NFKC, Roman numeral mappings, anomaly detection thresholds, confidence scoring algorithms.

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v20.0.0 or higher
- **Gemini API Key**: Valid API key with access to `gemini-2.5-flash`

### Installation & Execution
```bash
# Navigate to ai-service directory
cd ai-service

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Edit `ai-service/.env`:
```ini
PORT=4001
GEMINI_API_KEY=your_gemini_api_key_here
AI_INTERNAL_TOKEN=replace-with-at-least-32-random-characters
```

```bash
# Run unit tests
npm test

# Start the service
npm start

# Or start in watch mode
npm run dev
```

---

## 🧪 Service Endpoints

| Method | Path | Auth Header | Purpose |
|:---|:---|:---|:---|
| `GET` | `/health` | None | Service liveness and health probe |
| `POST` | `/internal/ai/analyze-feedback` | `Bearer {AI_INTERNAL_TOKEN}` | Extracts structured issue from raw player feedback |
| `POST` | `/internal/ai/correlate` | `Bearer {AI_INTERNAL_TOKEN}` | Evaluates issue against quantitative telemetry anomalies |
| `POST` | `/internal/ai/recommend` | `Bearer {AI_INTERNAL_TOKEN}` | Generates grounded, actionable studio patch suggestions |
