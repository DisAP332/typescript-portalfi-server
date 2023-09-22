import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import DBMethods from "../db";
import User from "./userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { Request, Response, NextFunction } from "express";

passport.use(
  "login",
  new LocalStrategy(async (username, password, done) => {
    try {
      await DBMethods.Connect("Users").then(async () => {
        let userExists = await User.findOne({ username: username });
        console.log(userExists);
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
        return res.send({ loggedIn: false, message: info });
      }
      if (user) {
        let token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
          expiresIn: "2h",
        });
        return res.status(200).json({
          loggedIn: true,
          token,
          user: user.username,
        });
      }
    }
  )(req, res, next);
};

export default { loginUser };
