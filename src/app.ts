import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
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
if (!process.env.ALLOWED_ORIGINS) {
  throw new Error("ALLOWED_ORIGINS must be set");
}

const app: Express = express();

// comma-separated frontend origin(s) allowed to call this API with
// credentials - the only thing a new venue deployment needs to change
// here is its .env, not this file.
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",").map((origin) =>
  origin.trim()
);

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
    // the auth cookie is only sent cross-origin if both sides opt in:
    // this on the server, withCredentials on the frontend's axios calls.
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes

app.use("/user", userRouter);
app.use("/events", verifyJWT, eventsRouter);
app.use("/food", verifyJWT, foodRouter);
app.use("/drinks", verifyJWT, drinksRouter);
// siteRouter applies verifyJWT itself, per-route - it also serves a public,
// unauthenticated route for the venue's separate public-facing website.
app.use("/site", sitesRouter);

app.get("/", async (req: Request, res: Response) => {
  res.send("we here");
});

export default app;
