import express from "express";
import { TrackModel } from "../models/track.js";

async function getTraks(req, res) {
  const tracks = await TrackModel.find();
  res.status(200).send(tracks);
}

async function postTrack(req, res) {
  const { name, author } = req.body;
  if (await TrackModel.findOne({ name: name, author: author })) {
    res.status(406).send({ message: "Track already in the system." });
    return;
  }

  const newTrack = new TrackModel({ name: name, author: author });
  await newTrack.save();

  const tracks = await TrackModel.find();
  res.status(201).send(tracks);
}

async function deleteById(req, res) {
  const { id } = req.params;
  const delResult = await TrackModel.deleteOne({ _id: id });

  if (!delResult.deletedCount) {
    res.status(404).send({ message: `Track with id ${id} not found` });
    return;
  }

  const tracks = await TrackModel.find();
  res.status(200).send(tracks);
}

async function deleteByName(req, res) {
  const { name } = req.params;
  const delResult = await TrackModel.deleteOne({ name: name });

  if (!delResult.deletedCount) {
    res.status(404).send({ message: `Track with name ${name} not found` });
    return;
  }

  const tracks = await TrackModel.find();
  res.status(200).send(tracks);
}

let router = express.Router();

router.get("/", getTraks);
router.post("/", postTrack);
router.delete("/:id", deleteById);
router.delete("/deleteByName/:name", deleteByName);
export default router;
