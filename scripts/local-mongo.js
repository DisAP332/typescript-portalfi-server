// Local dev replacement for a system mongod: this machine's kernel (7.0.0)
// hits a hard version check in MongoDB 8.0+ (see SERVER-121912), so we run
// an older, unaffected binary via mongodb-memory-server instead. Not used
// in production - the real deploy connects to Atlas via DATABASE in .env.
const { MongoMemoryServer } = require("mongodb-memory-server");
const path = require("path");
const fs = require("fs");

async function main() {
  const dbPath = path.join(__dirname, "..", ".local-mongo-data");
  fs.mkdirSync(dbPath, { recursive: true });

  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      ip: "127.0.0.1",
      dbPath,
      storageEngine: "wiredTiger",
    },
    binary: {
      version: "6.0.14",
    },
  });

  console.log(`Local MongoDB running at ${mongod.getUri()}`);
  console.log("Data persists in .local-mongo-data/ across restarts.");
  console.log("Press Ctrl+C to stop.");

  const shutdown = async () => {
    console.log("\nStopping local MongoDB...");
    await mongod.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Failed to start local MongoDB:", err);
  process.exit(1);
});
