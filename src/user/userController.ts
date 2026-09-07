import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import DBMethods from "../db";
import getUserModel from "./userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { getEventModel } from "../content-types/events";
import { getFoodModel } from "../content-types/food";
import { getDrinkModel } from "../content-types/drinks";
import getSiteModel from "../site/siteModel";

import { Request, Response, NextFunction } from "express";

interface IData {
  events: object;
  food: object;
  drinks: object;
  publishedData: object;
}

const TOKEN_COOKIE_NAME = "token";
const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000; // matches jwt.sign's expiresIn: "2h"

// SameSite=None requires Secure, which requires HTTPS - fine in production
// (real domains, HTTPS), but would silently break local dev over plain
// HTTP. localhost:3000 and localhost:8080 are cross-origin (different
// ports) but same-site (SameSite is scoped by host, not port), so Lax
// already covers local dev correctly without needing HTTPS.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
    | "none"
    | "lax",
};

const getUserData = async (requestor: string): Promise<IData | undefined> => {
  try {
    const db = DBMethods.getConnection(requestor);
    const eventData = await getEventModel(db).find({});
    const foodData = await getFoodModel(db).find({});
    const drinkData = await getDrinkModel(db).find({});
    const publishedData = await getSiteModel(db).find({});
    return {
      events: eventData,
      food: foodData,
      drinks: drinkData,
      publishedData: publishedData,
    };
  } catch (error) {
    return undefined;
  }
};

passport.use(
  "login",
  new LocalStrategy(async (username, password, done) => {
    try {
      const User = getUserModel(DBMethods.getConnection("Users"));
      const userExists = await User.findOne({ username: username });
      if (!userExists) {
        return done(null, false, { message: "user not found" });
      }

      const passwordCheck = await bcrypt.compare(
        password,
        userExists.password
      );

      if (!passwordCheck) {
        return done(null, false, { message: "Invalid credentials" });
      }
      return done(null, userExists, { message: "Your logged in!" });
    } catch (error: any) {
      console.log(error);
      return done(null, false, { message: error });
    }
  })
);

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  passport.authenticate(
    "login",
    async (
      error: { message: string },
      user: { username: string },
      info: any
    ) => {
      if (error) {
        return next(error.message);
      }
      if (!user) {
        return res.status(401).json({ success: false, response: info });
      }

      const token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      res.cookie(TOKEN_COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: TOKEN_MAX_AGE_MS,
      });
      // the authenticated user, not the raw request body.
      const data = await getUserData(user.username);
      const results = {
        success: true,
        response: {
          user: user.username,
          events: data?.events,
          food: data?.food,
          drinks: data?.drinks,
          publishedData: data?.publishedData,
        },
      };
      return res.status(200).json(results);
    }
  )(req, res, next);
};

const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie(TOKEN_COOKIE_NAME, cookieOptions);
  return res.status(200).json({ success: true, response: "logged out" });
};

export default { loginUser, logoutUser };
