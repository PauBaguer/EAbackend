import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.js";
import * as Role from "../models/role.js";

export const VerifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).send({ message: "No authorized" });
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
      res.status(403).send({ message: "Invalid token" });
      return;
    }

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

export const VeryfyAdminToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).send({ message: "No authorized" });
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

    const user = await UserModel.findOne({ _id: decoded!.id, disabled: false });
    if (!user) {
      res.status(403).send({ message: "User not authorized" });
      return;
    }

    const role: Array<String> = decoded.role;
    if (!role.includes(Role.ADMIN)) {
      res.status(403).send({ message: "Role not authorized" });
      return;
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
    return;
  }
  next();
};

export const VerifyWriterToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).send({ message: "No authorized" });
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

    const user = await UserModel.findOne({ _id: decoded!.id, disabled: false });
    if (!user) {
      res.status(403).send({ message: "User not authorized" });
      return;
    }
    const role: Array<String> = decoded.role;
    if (!role.includes(Role.WRITER)) {
      res.status(403).send({ message: "Role not authorized" });
      return;
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
    return;
  }
  next();
};
