require("dotenv").config({ quiet: true });
const { Client, GatewayIntentBits } = require("discord.js");
const { z } = require("zod");
const config = z
  .object({
    DISCORD_BOT_TOKEN: z.string().min(1),
    DISCORD_CHANNEL_ID: z.string().min(1),
    DISCORD_SOURCE_ID: z.string().min(1),
    DISCORD_WEBHOOK_TOKEN: z.string().min(1),
    CORE_API_URL: z.string().url().default("http://127.0.0.1:4000"),
  })
  .parse(process.env);
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,