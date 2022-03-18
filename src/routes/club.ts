import express from "express";
import { Club, ClubModel } from "../models/club.js";
import { User, UserModel } from "../models/user.js";

async function getClubs(req, res) {
  const clubs = await ClubModel.find()
    .populate('admin', 'name');
  res.status(200).send(clubs);
}

async function newClub(req, res) {
  const { clubName, admin, description, category } = req.body;
  if (await ClubModel.findOne({ name: clubName })) {
    res.status(406).send({ message: "Club name already in the system." });
    return;
  }

  const user: User | null = await UserModel.findOne({ name: admin });
  if (!user) {
    res.status(404).send({ message: "User not found." });
    return;
  }

  const newClub = new ClubModel({ name: clubName, description: description, admin: user, category: category });
  await newClub.save();

  const club = await ClubModel.findOne({ name: clubName });
  res.status(201).send(club);
}

async function deleteByName(req, res) {
  const { name } = req.params;
  const delResult = await ClubModel.deleteOne({ name: name });

  if (!delResult.deletedCount) {
    res.status(404).send({ message: `Club with name ${name} not found` });
    return;
  }

  const club = await ClubModel.find();
  res.status(200).send(club);
}

async function subscribeUserClub(req, res) {
  const { userName, clubName } = req.body;
  const club = await ClubModel.findOne({ name: clubName });
  const user = await UserModel.findOne({ name: userName });
  if(!club || !user) {
    res.status(404).send({ message: `Club with name ${userName}, ${clubName} not found` });
    return;
  }
  console.log(club.id);
  ClubModel.findOneAndUpdate(
    { _id: club.id},
    { $push: { users: user }},
    function (error, success) {
      if (error) {
        res.status(400).send({ message: "Error add user to club." });
      }
      res.status(200).send(club);
    });
}

let router = express.Router();

router.get("/", getClubs);
router.post("/", newClub);
router.delete("/:name", deleteByName);
router.put("/", subscribeUserClub);
export default router;
