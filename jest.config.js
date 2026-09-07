/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  globalSetup: "<rootDir>/tests/globalSetup.js",
  globalTeardown: "<rootDir>/tests/globalTeardown.js",
  // one Mongo connection singleton (src/db) shared across every test file
  // in a worker - keep it to one worker so tenant db names can't collide.
  maxWorkers: 1,
  // src/db's base connection is a module-level singleton with no exposed
  // teardown (by design - the real server never closes it either), so it
  // keeps an open socket alive past the last test. Tests are done with
  // their assertions by then; forceExit just skips waiting for Node's
  // event loop to drain on its own.
  forceExit: true,
};
