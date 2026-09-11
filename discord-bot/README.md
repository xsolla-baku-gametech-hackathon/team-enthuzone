# Player Issue Intelligence — Discord Bot Relay

Standalone Discord bot microservice that listens to feedback/bug report channels in Discord and streams real-time messages into the Player Issue Intelligence platform for AI analysis.

---

## 🚀 Setup & Run (Qurulum və İşə Salma)

### 1. Install Dependencies
```bash
cd discord-bot
npm install
```

### 2. Configure Environment (`.env`)
Faylı redaktə edin: `discord-bot/.env`
```env
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CHANNEL_ID=your_discord_channel_id_here
DISCORD_SOURCE_ID=your_source_id_here
DISCORD_WEBHOOK_TOKEN=your_webhook_token_here
CORE_API_URL=http://127.0.0.1:4000
```