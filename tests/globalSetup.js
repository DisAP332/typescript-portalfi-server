// Runs once before the whole test run, outside of any test file's module
// registry - mirrors scripts/local-mongo.js's kernel workaround (see
// SERVER-121912) but on a random free port instead of hardcoding 27017,
// so it can't collide with a dev instance of local-mongo.js.
const { MongoMemoryServer } = require("mongodb-memory-server");

module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create({
    binary: { version: "6.0.14" },
  });
  global.__MONGOD__ = mongod;
  process.env.DATABASE = mongod.getUri();
  process.env.JWT_SECRET = "test-secret-do-not-use-in-production";
  process.env.NODE_ENV = "test";
};
