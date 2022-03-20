import express, { Request, Response } from "express";
import { UserModel, User } from "../models/user.js";

async function getAll(req: Request, res: Response) {
  const users: User[] = await UserModel.find().populate();
  res.status(200).send(users);
}

async function getByName(req: Request, res: Response) {
  const { name } = req.params;
  const user: User | null = await UserModel.findOne({ user: name });
  if (!user) {
    res.status(404);
    return;
  }

  res.status(200).send(user);
}

interface RegisterUser {
  name: String;
  userName: String;
  age: Number;
  mail: String;
  password: String;
}

async function postUser(req: Request<{}, {}, RegisterUser>, res: Response) {
  const { name, userName, mail, age, password } = req.body; // todo encrypt password and tokens
  if (await UserModel.findOne({ userName: userName })) {
    res
      .status(406)
      .send({ message: "There is already a user with the same username." });
    return;
  }

  const newUser = new UserModel({
    name: name,
    userName: userName,
    mail: mail,
    age: age,
    password: password,
  });
  await newUser.save();

  res.status(201).send();
}

async function deleteById(req: Request, res: Response) {
  const { id } = req.params;
  const delResult = await UserModel.deleteOne({ _id: id });

  if (!delResult.deletedCount) {
    res.status(404).send({ message: `User with id ${id} not found` });
    return;
  }

  res.status(200).send();
}

let router = express.Router();

router.get("/", getAll);
router.get("/:name", getByName);
router.post("/", postUser);
router.delete("/:id", deleteById);

export default router;
