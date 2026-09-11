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
});

// 3. Relay message to Core Platform API with exponential backoff retry
async function relay(message) {
  const targetUrl = `${config.CORE_API_URL}/api/platform/ingest/discord/${encodeURIComponent(
    config.DISCORD_SOURCE_ID
  )}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        signal: AbortSignal.timeout(65000),
        headers: {
          "Content-Type": "application/json",
          "x-webhook-token": config.DISCORD_WEBHOOK_TOKEN,
        },
        body: JSON.stringify({
          id: message.id,
          author: message.author.tag || message.author.username || message.author.id,
          content: message.content.slice(0, 6000),
        }),
      });

      if (response.ok) {
        console.log(
          `[Relay OK] Message ${message.id} from @${message.author.username} sent to Core API.`
        );
        try {
          // Add a subtle reaction so players know their review was registered
          await message.react("🎮");
        } catch {}
        return;
      }

      if (response.status < 500 && response.status !== 429) {
        console.error(
          `[Relay Rejected] Status ${response.status} from Core API for message ${message.id}.`
        );
        return;
      }
    } catch (e) {
      console.warn(
        `[Relay Warning] Attempt ${attempt}/3 failed to reach Core API: ${e.message}`
      );
    }

    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
    }
  }

  console.error(
    `[Relay Failed] Could not deliver message ${message.id} after 3 attempts.`
  );
}

// 4. Message Ingestion Queue
let queue = Promise.resolve();

bot.on("messageCreate", (message) => {
  // Ignore bot messages, system messages, messages in other channels, or empty content
  if (
    message.author.bot ||
    message.channelId !== config.DISCORD_CHANNEL_ID ||
    !message.content.trim()
  ) {
    return;
  }

  console.log(
    `[Incoming Feedback] From @${message.author.username}: "${message.content.slice(0, 60)}..."`
  );

  queue = queue
    .then(() => relay(message))
    .catch((err) => {
      console.error("[Queue Error]:", err.message);
    });
});

// 5. Bot Lifecycle Events
bot.once("clientReady", async () => {
  console.log("\n=======================================================");
  console.log(`🤖 [Discord Bot Ready]: Logged in as ${bot.user.tag}`);

  const guilds = bot.guilds.cache.map((g) => `"${g.name}"`);
  if (guilds.length === 0) {
    console.warn("⚠️  [Server Check]: Bot hələ heç bir serverə əlavə olunmayıb!");
    console.warn(`   Dəvət linki: https://discord.com/oauth2/authorize?client_id=${bot.user.id}&permissions=68672&scope=bot`);
  } else {
    console.log(`🏠 [Joined Servers]: ${guilds.join(", ")}`);
  }

  try {
    const channel = await bot.channels.fetch(config.DISCORD_CHANNEL_ID);
    if (channel) {
      console.log(`✅ [Target Channel Found]: #${channel.name} (Server: "${channel.guild?.name}")`);
    }
  } catch (err) {
    console.warn(`⚠️  [Channel Access]: Bot "${config.DISCORD_CHANNEL_ID}" kanalını görə bilmir (${err.message}).`);
    console.warn("   Kanal gizlidirsə (private), kanalın Settings -> Permissions bölməsindən bota 'View Channel' icazəsi verin.");
  }

  console.log(`📡 [Target Channel ID]: ${config.DISCORD_CHANNEL_ID}`);
  console.log(`🎯 [Source ID]: ${config.DISCORD_SOURCE_ID}`);
  console.log(`🚀 [Core API]: ${config.CORE_API_URL}`);
  console.log("Listening for new player feedback messages in real-time...");
  console.log("=======================================================\n");
});

bot.on("error", (err) => {
  console.error("[Discord Gateway Error]:", err.message);
});

// 6. Login
bot.login(config.DISCORD_BOT_TOKEN).catch((err) => {
  console.error("\n❌ [Discord Login Failed]: Could not connect to Discord.");
  console.error(`   Reason: ${err.message}`);
  if (err.message.includes("disallowed intents")) {
    console.error("\n⚠️  [ÇOX VACİB / REQUIRED ACTION]:");
    console.error("   Discord bu bot üçün 'Message Content Intent' icazəsini tələb edir.");
    console.error("   Addımlar:");
    console.error("   1. https://discord.com/developers/applications saytına daxil olun.");
    console.error("   2. Botunuzu seçin və sol menyudan 'Bot' bölməsinə keçin.");
    console.error("   3. Aşağı sürüşdürün, 'Privileged Gateway Intents' başlığı altında:");
    console.error("      👉 'Message Content Intent' düyməsini AKTİV (ON) edin.");
    console.error("   4. 'Save Changes' düyməsinə basıb yadda saxlayın və botu yenidən başladın.\n");
  } else {
    console.error("   Please verify DISCORD_BOT_TOKEN in your discord-bot/.env file.\n");