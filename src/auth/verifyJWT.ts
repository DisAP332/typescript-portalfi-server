import jwt from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";

// ************* types ************* //

// the login route signs { user: <user document> }, so the tenant name we
// connect the database with lives inside the signed token. it is never read
// from a header again - a client could set that to anything it liked.
interface ITokenPayload {
  user: { username: string };
}

interface IResults {
  success: boolean;
  response: string | object | unknown;
}

// ************* middleware ************* //

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const results: IResults = {
      success: false,
      response: "No token provided.",
    };
    return res.status(401).json(results);
  }

  // the dashboard sends the bare token, but accept "Bearer <token>" too.
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : authHeader;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET) as ITokenPayload;

    if (!payload.user || !payload.user.username) {
      const results: IResults = {
        success: false,
        response: "Token is missing a user.",
      };
      return res.status(401).json(results);
    }

    req.tenant = payload.user.username;
    return next();
  } catch (error) {
    // shape kept as-is: the dashboard checks for auth === false to know it
    // should send the user back to the login screen.
    return res.status(401).json({
      auth: false,
      message: "failed auth, token doesnt match / is expired",
    });
  }
};

export default verifyJWT;
