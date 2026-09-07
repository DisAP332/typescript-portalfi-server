import "dotenv/config";
import app from "./app";
import DBMethods from "./db";

const httpPort = process.env.HTTP_PORT;
const httpsPort = process.env.HTTPS_PORT;

async function main() {
  await DBMethods.connect();

  app.listen(httpPort, () => {
    console.log(`HTTP server running on ${httpPort}`);
  });
  app.listen(httpsPort, () => {
    console.log(`HTTPS server running on httpsPort`);
  });
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
