// One-off dev helper: creates a login for local testing against
// .local-mongo-data. Not used in production.
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const USERNAME = "testvenue";
const PASSWORD = "testpassword123";

async function main() {
  await mongoose.connect(
    "mongodb://127.0.0.1:27017/Users?retryWrites=true&w=majority"
  );
  const hashed = await bcrypt.hash(PASSWORD, 10);
  await mongoose.connection.collection("users").updateOne(
    { username: USERNAME },
    { $set: { username: USERNAME, password: hashed } },
    { upsert: true }
  );
  console.log(`Seeded user: ${USERNAME} / ${PASSWORD}`);
  await mongoose.disconnect();
}

main();
