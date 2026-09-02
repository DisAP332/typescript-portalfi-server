import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import DBMethods from "./db";
import cookieParser from "cookie-parser";
import userRouter from "./user/userRouter";
import eventsRouter from "./events/eventsRouter";
import foodRouter from "./food/foodRouter";
import drinkRouter from "./drinks/drinksRouter";
import sitesRouter from "./site/siteRouter";
import verifyJWT from "./auth/verifyJWT";

const app: Express = express();

const allowedOrigins = [
  "https://www.portalfi-jbw.com",
  "https://pandemoniumky.com",
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
app.use("/drinks", verifyJWT, drinkRouter);
app.use("/site", verifyJWT, sitesRouter);

app.get("/", async (req: Request, res: Response) => {
  await DBMethods.Connect("user").then((response) => {
    console.log(response);
  });
  res.send("we here");
});

const httpPort = process.env.HTTP_PORT;
const httpsPort = process.env.HTTPS_PORT;

app.listen(httpPort, () => {
  console.log(`HTTP server running on ${httpPort}`);
});
app.listen(httpsPort, () => {
  console.log(`HTTPS server running on httpsPort`);
});
