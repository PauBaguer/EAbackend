import express, { Request, Response } from "express";
import { UserModel, User, UserToSend } from "../models/user.js";
import * as Role from "../models/role.js";
import bcrypt from "bcryptjs";

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
        { path: "clubs", populate: { path: "category" } },
        "books",
        { path: "events", populate: { path: "category" } },
        "categories",
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

async function getByUserName(req: Request, res: Response) {
  try {
    const { userName: userName } = req.params;
    const user: UserToSend | null = await UserModel.findOne({
      userName: userName,
    })
      //.select("-password")
      .populate([
        { path: "chats", populate: { path: "users" } },
        "clubs",
        "books",
        "events",
      ]);

    if (!user) {
      res.status(404).send({ message: `User ${userName} not found in DB` });
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
    res.status(200).send({ message: `User ${id} updated` });
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

async function addRoleToUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!Role.roles.includes(role)) {
      res.status(400).send({ message: `Role ${role} does not exist!` });
      return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).send({ message: `User ${userId} does not exist in DB!` });
      return;
    }

    if (user.role.includes(role)) {
      res.status(400).send({
        message: `User ${userId} does already have the role ${role}!`,
      });
      return;
    }

    await UserModel.updateOne({ _id: userId }, { $push: { role: role } });
    res.status(200).send({ message: `Role ${role} added to User ${userId}` });
    return;
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function deleteRoleFromUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!Role.roles.includes(role)) {
      res.status(400).send({ message: `Role ${role} does not exist!` });
      return;
    }

    if (role === Role.READER) {
      res.status(400).send({ message: `Role ${role} can not be deleted!` });
      return;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      res.status(404).send({ message: `User ${userId} does not exist in DB!` });
      return;
    }

    await UserModel.updateOne({ _id: userId }, { $pull: { role: role } });
    res
      .status(200)
      .send({ message: `Role ${role} deleted from User ${userId}` });
    return;
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function changePassword(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { password, old } = req.body;
    const user: User | null = await UserModel.findById(id);
    if (!user) {
      res
        .status(404)
        .send({ message: `Username password combination does not exist` });
      return;
    }
    if (!(await bcrypt.compare(old as string, user.password as string))) {
      console.log("wandering");
      res

        .status(404)
        .send({ message: `Username password combination does not exist` });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    const result = await UserModel.updateOne(
      { _id: id },
      { password: encryptedPassword }
    );

    if (!result.modifiedCount) {
      res.status(404).send({ message: `user with id ${id} nod found` });
      return;
    }
    return res.status(200).send({ message: `success` });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

let router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.get("/getbyusername/:userName", getByUserName);
router.get("/enable/:id", enableUser);
router.post("/", postUser);
router.post("/:id", changePassword);
router.put("/update/:id", updateUser);
router.put("/addrole/:id", addRoleToUser);
router.put("/deleterole/:id", deleteRoleFromUser);
router.delete("/deleteByUsername/:userName", deleteByUsername);
router.delete("/:id", deleteById);

export default router;
