// Explicit local development database; does not connect to the configured remote database.
const path = require("node:path");
const fs = require("node:fs");
const { MongoMemoryReplSet } = require("mongodb-memory-server");
async function main() {
  const dbPath = path.resolve(__dirname, "../../.data/mongo");
  try {
    fs.rmSync(dbPath, { recursive: true, force: true });
  } catch {}
  fs.mkdirSync(dbPath, { recursive: true });
  const database = await MongoMemoryReplSet.create({
    instanceOpts: [{ dbPath }],
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  process.env.MONGODB_URI = database.getUri("player_issue_intelligence");
  process.env.ENABLE_LEGACY_INGESTION = "false";
  const { bootstrap } = require("./server");
  await bootstrap();
  const stop = async () => {
    await database.stop({ doCleanup: true });
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  console.log(
    "Local development database is ready; data stored under .data/mongo",
  );
}
main().catch((err) => {
  console.error("Local development stack failed to start", err);
  process.exitCode = 1;
});
