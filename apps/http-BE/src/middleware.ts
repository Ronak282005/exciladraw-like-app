import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
// import { ENV } from "./config";
import {ENV} from "@repo/backend-common"

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  try {
    const decode = jwt.verify(token as string, ENV.JWT_SECRET);
    if (!decode) {
      return res.status(403).json({
        msg: "Invalid Token!",
      });
    }
    if ((decode as JwtPayload).userId) {
      // @ts-ignore
      res.userId = (decode as JwtPayload).userId;
      next();
    } else {
      return res.status(403).json({
        msg: "Invalid Token2!",
      });
    }
  } catch (error) {
    res.json({
      error,
    });
  }
};
