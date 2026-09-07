import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import DBMethods from "./db";
import cookieParser from "cookie-parser";
import userRouter from "./user/userRouter";
import { eventsRouter } from "./content-types/events";
import { foodRouter } from "./content-types/food";
import { drinksRouter } from "./content-types/drinks";
import sitesRouter from "./site/siteRouter";
import verifyJWT from "./auth/verifyJWT";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set");
}

const app: Express = express();

const allowedOrigins = [
  "https://www.portalfi-jbw.com",
  "https://pandemoniumky.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes

app.use("/user", userRouter);
app.use("/events", verifyJWT, eventsRouter);
app.use("/food", verifyJWT, foodRouter);
app.use("/drinks", verifyJWT, drinksRouter);
app.use("/site", verifyJWT, sitesRouter);

app.get("/", async (req: Request, res: Response) => {
  res.send("we here");
});

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
