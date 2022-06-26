import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, UserModel } from "../models/user.js";
import jwt from "jsonwebtoken";
import { Category, CategoryModel } from "../models/category.js";

async function singup(req: Request, res: Response) {
  try {
    const {
      name,
      userName,
      mail,
      birthDate,
      password,
      role,
      category,
      google,
    } = req.body;

    let encryptedPassword;
    if (google == false) {
      const salt = await bcrypt.genSalt(10);
      encryptedPassword = await bcrypt.hash(password, salt);
    } else encryptedPassword = null;

    if (await UserModel.findOne({ userName: userName })) {
      res
        .status(406)
        .send({ message: "There is already a user with the same username." });
      return;
    }
    const categories: Category[] | null = await CategoryModel.find({
      name: category,
    });

    const newUser = new UserModel({
      name: name,
      userName: userName,
      mail: mail,
      birthDate: birthDate,
      password: encryptedPassword,
      categories: categories,
      role: role,
      google: google,
    });

    const SECRET = process.env.JWT_SECRET;

    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, userName: savedUser.userName, role: savedUser.role },
      SECRET!,
      {
        expiresIn: 86400, //24 hours
      }
    );

    res.status(201).send({ message: `User singed up`, token });
    return;
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function singin(req: Request, res: Response) {
  try {
    const { userName, password } = req.body;

    const user: User | null = await UserModel.findOne({
      userName: userName,
      disabled: false,
    });
    if (!user) {
      res
        .status(404)
        .send({ message: `Username password combination does not exist` });
      return;
    }

    if (!user.google) {
      if (
        !(await bcrypt.compare(password as string, user.password as string))
      ) {
        res
          .status(404)
          .send({ message: `Username password combination does not exist` });
        return;
      }
    }

    const SECRET = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: user._id, userName: user.userName, role: user.role },
      SECRET!,
      {
        expiresIn: 86400, //24 hours
      }
    );

    res.status(200).send({ message: "singin", token });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function verifyToken(req: Request, res: Response) {
  try {
    const token = req.body.token;
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

    res.status(200).send({ message: "User Logged in" });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
    return;
  }
}

const router = express.Router();

router.post("/singup", singup);
router.post("/singin", singin);
router.post("/verifyToken", verifyToken);

export default router;
