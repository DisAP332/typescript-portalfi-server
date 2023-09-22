import express, { Express, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import DBMethods from "./db";
import cookieParser from "cookie-parser";
import userRouter from "./user/userRouter";
import eventsRouter from "./events/eventsRouter";
import foodRouter from "./food/foodRouter";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes

app.use("/user", userRouter);
app.use("/events", eventsRouter);
app.use("/food", foodRouter);

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
