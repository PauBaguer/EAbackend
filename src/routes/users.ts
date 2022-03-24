import express, { Request, Response } from "express";
import { UserModel, User, UserToSend } from "../models/user.js";

async function getAll(req: Request, res: Response) {
  const users: User[] = await UserModel.find();
  const sortedList = users.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  res.status(200).send(sortedList);
}

async function getByName(req: Request, res: Response) {
  const { name } = req.params;
  const user: UserToSend | null = await UserModel.findOne({
    userName: name,
  }).select("-password");
  if (!user) {
    res.status(404).send({ message: `User ${name} not found in DB` });
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

async function updateUser(req: Request, res: Response) {
  const { oldUserName } = req.params;
  const { name, userName, mail, age } = req.body; // todo encrypt password and tokens
  const result = await UserModel.updateOne(
    { userName: oldUserName },
    { name: name, userName: userName, mail: mail, age: age }
  );

  if (!result.modifiedCount) {
    res.status(404).send({ message: `User ${oldUserName} not found in DB` });
    return;
  }
  res.status(200).send();
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

async function deleteByUsername(req: Request, res: Response) {
  const { userName } = req.params;
  const delResult = await UserModel.deleteOne({ userName: userName });

  if (!delResult.deletedCount) {
    res.status(404).send({ message: `User ${userName} not found` });
    return;
  }

  res.status(200).send();
}

let router = express.Router();

router.get("/", getAll);
router.get("/:name", getByName);
router.post("/", postUser);
router.put("/update/:oldUserName", updateUser);
router.delete("/deleteById/:id", deleteById);
router.delete("/:userName", deleteByUsername);

export default router;
