import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import "dotenv/config";
import DBMethods from "./db";
import cookieParser from "cookie-parser";
import userRouter from "./user/userRouter";
import eventsRouter from "./events/eventsRouter";
import foodRouter from "./food/foodRouter";
import drinkRouter from "./drinks/drinksRouter";
import jwt from "jsonwebtoken";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// JWT

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token) {
    console.log("no token provided");
    res.send("No token provided.");
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        console.log("Token auth failed.");
        return res.json({
          auth: false,
          message: "failed auth, token doesnt match / is expired",
        });
      } else {
        console.log("Token auth succeeded");
        next();
      }
    });
  }
};

// Routes

app.use("/user", userRouter);
app.use("/events", eventsRouter);
app.use("/food", foodRouter);
app.use("/drinks", drinkRouter);

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
