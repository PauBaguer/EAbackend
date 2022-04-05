import express, { Request, Response } from "express";
import { UserModel, User, UserToSend } from "../models/user.js";
import { VerifyToken } from "../middlewares/verifyToken.js";

async function getAll(req: Request, res: Response) {
  try {
    const users: User[] = await UserModel.find();
    const sortedList = users.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    res.status(200).send(sortedList);
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function getById(req: Request, res: Response) {
  try {
    const { id: id } = req.params;
    const user: UserToSend | null = await UserModel.findOne({
      _id: id,
    })
      //.select("-password")
      .populate([
        { path: "chats", populate: { path: "users" } },
        "clubs",
        "books",
        "events",
      ]);

    if (!user) {
      res.status(404).send({ message: `User ${id} not found in DB` });
      return;
    }

    res.status(200).send(user);
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

interface RegisterUser {
  name: String;
  userName: String;
  birthDate: Date;
  mail: String;
  password: String;
}

async function postUser(req: Request<{}, {}, RegisterUser>, res: Response) {
  try {
    const { name, userName, mail, birthDate, password } = req.body; // todo encrypt password and tokens
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
      birthDate: birthDate,
      password: password,
    });
    await newUser.save();

    res.status(201).send({ message: `User ${userName} created!` });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, userName, mail, birthDate } = req.body; // todo encrypt password and tokens
    const result = await UserModel.updateOne(
      { _id: id, disabled: false },
      { name: name, userName: userName, mail: mail, birthDate: birthDate }
    );

    if (!result.modifiedCount) {
      res.status(404).send({ message: `User ${id} not found in DB` });
      return;
    }
    res.status(200).send({ messge: `User ${id} updated` });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function enableUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await UserModel.updateOne(
      { _id: id, disabled: true },
      { disabled: false }
    );

    if (!result.modifiedCount) {
      res.status(404).send({ message: `user with id ${id} nod found` });
      return;
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

//!delete does not delete, i puts de disabled flag!
async function deleteById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const delResult = await UserModel.updateOne(
      { _id: id, disabled: false },
      { disabled: true }
    );

    if (!delResult.modifiedCount) {
      res.status(404).send({ message: `User with id ${id} not found` });
      return;
    }

    res.status(200).send({ message: `User ${id} deleted!` });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

//!delete does not delete, i puts de disabled flag!
async function deleteByUsername(req: Request, res: Response) {
  try {
    const { userName } = req.params;
    const delResult = await UserModel.updateOne(
      { userName: userName, disabled: false },
      { disabled: true }
    );

    if (!delResult.modifiedCount) {
      res.status(404).send({ message: `User ${userName} not found` });
      return;
    }

    res.status(200).send({ message: `User ${userName} deleted!` });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

let router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.get("/enable/:id", enableUser);
router.post("/", postUser);
router.put("/update/:id", updateUser);
router.delete("/deleteByUsername/:userName", deleteByUsername);
router.delete("/:id", deleteById);

export default router;
