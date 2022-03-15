import express from "express";
import mongoose from "mongoose";
import { TrackModel } from "../models/track.js";
import { UserModel, User } from "../models/user.js";

async function getAll(req, res) {
  const users: User[] = await UserModel.find();
  res.status(200).send(users);
}

async function getByName(req, res) {
  const { name } = req.params;
  const user: User | null = await UserModel.findOne({ name: name });
  if (!user) {
    res.status(404);
    return;
  }
  res.status(200).send(user);
}

async function postUser(req, res) {
  const { name, email, age } = req.body;
  if (await UserModel.findOne({ name: name })) {
    res
      .status(406)
      .send({ message: "There is already a user with the same name." });
    return;
  }

  const newUser = new UserModel({ name: name, email: email, age: age });
  await newUser.save();

  const users: User[] = await UserModel.find();
  res.status(201).send(users);
}

async function deleteById(req, res) {
  const { id } = req.params;
  const delResult = await UserModel.deleteOne({ _id: id });

  if (!delResult.deletedCount) {
    res.status(404).send({ message: `User with id ${id} not found` });
    return;
  }

  const users: User[] = await UserModel.find();
  res.status(200).send(users);
}

let router = express.Router();

router.get("/", getAll);
router.get("/:name", getByName);
router.post("/", postUser);
router.delete("/:id", deleteById);

export default router;
