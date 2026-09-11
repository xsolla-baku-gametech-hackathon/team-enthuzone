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

### 3. Start the Bot
```bash
npm start
```
Və ya inkişaf (hot-reload) rejimində:
```bash
npm run dev
```

---

## 📋 How to get credentials (Məlumatları necə əldə etməli?)

### 1. Discord Bot Token
1. [Discord Developer Portal](https://discord.com/developers/applications) saytına daxil olun.
2. **"New Application"** yaradın (məs: `PlayerFeedbackBot`).
3. Sol menyuda **Bot** bölməsinə keçin:
   - **Reset Token** düyməsinə basıb tokeni kopyalayın (`DISCORD_BOT_TOKEN`).
   - Səhifəni bir az aşağı sürüşdürüb **"Message Content Intent"** parametrini **Aktiv (ON)** edin və yadda saxlayın.
4. Sol menyuda **OAuth2** ➔ **URL Generator** bölməsinə keçin:
   - `bot` seçimini işarələyin.