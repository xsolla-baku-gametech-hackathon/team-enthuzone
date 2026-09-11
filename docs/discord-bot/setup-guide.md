# 🛠️ Discord Bot Setup & Developer Portal Guide

This guide walks you through registering your bot on the Discord Developer Portal, acquiring credentials, and configuring privileged permissions.

---

## 1. Create Application on Discord Developer Portal

1. Visit the [Discord Developer Portal](https://discord.com/developers/applications) and sign in.
2. Click **"New Application"** (e.g. `PlayerIntelligenceBot`).
3. Under **General Information**, add a description and app icon.

---

## 2. Configure Bot & Privileged Intents

1. Navigate to the **Bot** tab on the left sidebar.
2. Click **"Reset Token"** and securely copy the generated `DISCORD_BOT_TOKEN`.
   > [!WARNING]
   > Keep this token secret. Never commit it to git or share it in public repositories.
3. Scroll down to **Privileged Gateway Intents**:
   - Enable **"Message Content Intent"** (Required so the bot can read player text).
   - Enable **"Server Members Intent"** (Optional, recommended).
4. Click **"Save Changes"**.

---

## 3. Invite Bot to Your Discord Server

1. Navigate to **OAuth2 ➔ URL Generator** on the left sidebar.
2. Under **Scopes**, check:
   - `bot`
3. Under **Bot Permissions**, check:
   - `Read Messages/View Channels`
   - `Send Messages`
   - `Add Reactions`
4. Copy the generated authorization URL at the bottom of the page.
5. Paste the URL into your browser, select your Discord server, and click **Authorize**.

---

## 4. Extract Target Channel ID

1. In Discord Desktop or Web, go to **User Settings ➔ Advanced** and turn ON **"Developer Mode"**.
2. Navigate to your server and find the feedback channel (e.g. `#bug-reports` or `#feedback`).
3. Right-click the channel name and select **"Copy Channel ID"**.
4. Paste this value as `DISCORD_CHANNEL_ID` in `discord-bot/.env`.

---

## 5. Pair with Studio Dashboard

1. Open the studio web dashboard at `http://localhost:3000`.
2. Navigate to **Feedback ➔ + Add Source ➔ Discord**.
3. Enter a label (e.g. `Official Discord Community`) and confirm.
4. Copy the generated `Source ID` and `Webhook Token` and paste them into `discord-bot/.env`:
   - `DISCORD_SOURCE_ID=...`
   - `DISCORD_WEBHOOK_TOKEN=...`
