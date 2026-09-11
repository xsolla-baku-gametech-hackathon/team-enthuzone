# 🤖 Discord Bot Relay Documentation

The **Discord Bot Relay** is a standalone microservice that connects a game's community Discord server directly with the **Player Issue Intelligence** platform. It monitors designated feedback and bug-reporting channels in real time, buffers and queues messages, and relays them to the Core Platform Ingest API via authenticated webhooks with automated exponential backoff retries.

---

## 📑 Discord Bot Documentation Index

- [🛠️ Setup & Configuration Guide](file:///docs/discord-bot/setup-guide.md) — Discord Developer Portal setup, Bot tokens, Privileged Gateway Intents, OAuth2 permissions.
- [🔄 Ingestion & Relay Pipeline](file:///docs/discord-bot/relay-pipeline.md) — Message filtering, promise queuing, exponential backoff HTTP relay, and player reaction feedback.

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v20.0.0 or higher
- A registered Discord Application with Bot token
- Discord Privileged Intent: **Message Content Intent** enabled

### Installation & Execution
```bash
# Navigate to discord-bot directory
cd discord-bot

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

Edit `discord-bot/.env`:
```ini
DISCORD_BOT_TOKEN=your_bot_token_from_discord_portal
DISCORD_CHANNEL_ID=your_target_channel_id
DISCORD_SOURCE_ID=your_source_id_from_dashboard
DISCORD_WEBHOOK_TOKEN=your_webhook_token_from_dashboard
CORE_API_URL=http://127.0.0.1:4000
```

```bash
# Start bot in production
npm start

# Or start in hot-reload watch mode
npm run dev
```
