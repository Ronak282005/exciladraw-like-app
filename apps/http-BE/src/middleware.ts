import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { ENV } from "./config";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization
    try {
        const decode = jwt.verify(token as string, ENV.JWT_SECRET)
        if (!decode) {
            return res.status(403).json({
                msg: "Invalid Token!"
            })
        }
    } catch (error) {
        res.json({
            error
        })
    }
}