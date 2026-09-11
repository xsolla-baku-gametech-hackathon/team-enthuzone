require("dotenv").config({ quiet: true });
const { Client, GatewayIntentBits } = require("discord.js");
const { z } = require("zod");

// 1. Environment validation schema
const configSchema = z.object({
  DISCORD_BOT_TOKEN: z
    .string({ required_error: "DISCORD_BOT_TOKEN is required in .env" })
    .min(1, "DISCORD_BOT_TOKEN cannot be empty"),
  DISCORD_CHANNEL_ID: z
    .string({ required_error: "DISCORD_CHANNEL_ID is required in .env" })
    .min(1, "DISCORD_CHANNEL_ID cannot be empty"),
  DISCORD_SOURCE_ID: z
    .string({ required_error: "DISCORD_SOURCE_ID is required in .env" })
    .min(1, "DISCORD_SOURCE_ID cannot be empty"),
  DISCORD_WEBHOOK_TOKEN: z
    .string({ required_error: "DISCORD_WEBHOOK_TOKEN is required in .env" })
    .min(1, "DISCORD_WEBHOOK_TOKEN cannot be empty"),
  CORE_API_URL: z.string().url().default("http://127.0.0.1:4000"),
});

let config;
try {
  config = configSchema.parse(process.env);
} catch (err) {
  console.error("\n❌ [Discord Bot Config Error]: Missing or invalid configuration in .env");
  if (err instanceof z.ZodError) {
    err.issues.forEach((issue) => {
      console.error(`   👉 ${issue.path.join(".")}: ${issue.message}`);
    });
  }
  console.error("\nPlease check your discord-bot/.env file and fill in all required credentials.\n");
  process.exit(1);
}

// 2. Initialize Discord Client
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],