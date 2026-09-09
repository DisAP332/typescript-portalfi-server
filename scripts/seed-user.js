// Provisions (or resets the password for) a venue's login. The tenant a
// user can manage is exactly the username they log in with (see
// src/user/userController.ts) - this is how a new venue deployment gets
// its first admin account.
require("dotenv/config");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const [username, password] = process.argv.slice(2);

async function main() {
  if (!username || !password) {
    console.error("Usage: npm run seed-user -- <username> <password>");
    process.exit(1);
  }
  if (!process.env.DATABASE) {
    console.error("DATABASE must be set (see .env.example)");
    process.exit(1);
  }

  await mongoose.connect(
    `${process.env.DATABASE}Users?retryWrites=true&w=majority`
  );
  const hashed = await bcrypt.hash(password, 10);
  await mongoose.connection
    .collection("users")
    .updateOne(
      { username },
      { $set: { username, password: hashed } },
      { upsert: true }
    );
  console.log(`Seeded user: ${username}`);
  await mongoose.disconnect();
}

main();
