import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.js";

export const VerifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization) return res.status(401).send({ message: "No authorized" });
    const token = req.headers.authorization;

    if (!token) {
      res.status(403).send({ message: "Token not provided" });
      return;
    }
    if (!(typeof token === "string")) throw "Token not a string";

    const SECRET = process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(token!, SECRET!);
    } catch (e) {
      res.status(403).send({ message: "User not authorized" });
      return;
    }

    console.log(decoded!);

    const user = await UserModel.findOne({ _id: decoded!.id, disabled: false });
    if (!user) {
      res.status(403).send({ message: "User not authorized" });
      return;
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
    return;
  }
  next();
};