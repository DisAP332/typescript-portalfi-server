import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import DBMethods from "../db";
import User from "./userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import Event from "../events/eventsModel";
import Food from "../food/foodModel";
import Drink from "../drinks/drinksModel";

import { Request, Response, NextFunction } from "express";
import SiteData from "../site/siteModel";

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

let results: IResults;

interface IData {
  events: object;
  food: object;
  drinks: object;
  publishedData: object;
}

const getUserData = async (requestor: string) => {
  try {
    await DBMethods.Connect(requestor);
    const eventData = await Event.find({});
    const foodData = await Food.find({});
    const drinkData = await Drink.find({});
    const publishedData = await SiteData.find({});
    const data: IData = {
      events: eventData,
      food: foodData,
      drinks: drinkData,
      publishedData: publishedData,
    };
    return data;
  } catch (error) {
    results = {
      success: false,
      response: "Error in user info retrieval",
    };
  }
};

passport.use(
  "login",
  new LocalStrategy(async (username, password, done) => {
    try {
      await DBMethods.Connect("Users").then(async () => {
        let userExists = await User.findOne({ username: username });
        if (!userExists) {
          return done(null, false, { message: "user not found" });
        }

        let passwordCheck = await bcrypt.compare(password, userExists.password);

        if (!passwordCheck) {
          return done(null, false, { message: "Invalid credentials" });
        }
        return done(null, userExists, { message: "Your logged in!" });
      });
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
        results = {
          success: false,
          response: info,
        };
        return res.status(401).json(results);
      }
      if (user) {
        let token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
          expiresIn: "2h",
        });
        getUserData(req.body.username).then((data) => {
          results = {
            success: true,
            response: {
              token: token,
              user: user.username,
              events: data?.events,
              food: data?.food,
              drinks: data?.drinks,
              publishedData: data?.publishedData,
            },
          };
          return res.status(200).json(results);
        });
      }
    }
  )(req, res, next);
};

export default { loginUser };
