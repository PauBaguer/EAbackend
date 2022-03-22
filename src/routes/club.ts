import express from "express";
import { Club, ClubModel } from "../models/club.js";
import { User, UserModel } from "../models/user.js";

async function getClubs(req, res) {
  const clubs = await ClubModel.find().populate("admin", "userName mail");
  res.status(200).send(clubs);
}

async function getClub(req, res) {
  const club = await ClubModel.findOne({ name: req.params.name })
    .populate("admin", "userName mail")
    .populate("users", "userName mail");
  res.status(200).send(club);
}

async function newClub(req, res) {
  const { clubName, admin, description, category } = req.body;
  if (await ClubModel.findOne({ name: clubName })) {
    res.status(406).send({ message: "Club name already in the system." });
    return;
  }
  console.log(admin);

  const user = await UserModel.findOne({ userName: admin, disabled: false });
  if (!user) {
    res.status(404).send({ message: "User not found." });
    return;
  }
  console.log(user);

  const newClub = new ClubModel({
    name: clubName,
    description: description,
    admin: user,
    users: [user],
    category: category,
  });
  const club = await newClub.save();

  console.log(club);
  await UserModel.findOneAndUpdate(
    { _id: user.id, disabled: false },
    { $addToSet: { clubs: club } }
  )
    .then((resUser) => {
      if (!resUser) {
        return res.status(404).send({ message: "Error add user to club." });
      } else {
        return res.status(200).send({ message: `Club add to user ${admin}` });
      }
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error subscribe to club ${error}` });
    });
}

async function deleteClub(req, res) {
  const { name } = req.params;
  await ClubModel.findOneAndDelete({ name: name })
    .then(async (club) => {
      if (club) {
        await club.remove();
        return res
          .status(200)
          .send({ message: `Club with name ${name} success deleted` });
      } else {
        return res
          .status(404)
          .send({ message: `Club with name ${name} not found` });
      }
    })
    .catch((error) => {
      return res.status(400).send({ message: `Error delete club ${error}` });
    });
}

async function subscribeUserClub(req, res) {
  const { userName, clubName } = req.body;
  const club = await ClubModel.findOne({ name: clubName });
  const user = await UserModel.findOne({ userName: userName, disabled: false });
  if (!club || !user) {
    return res
      .status(404)
      .send({ message: `Club with name ${userName}, ${clubName} not found` });
  }

  await ClubModel.findOneAndUpdate(
    { _id: club.id },
    { $addToSet: { users: user } }
  )
    .then((resClub) => {
      if (!resClub) {
        return res.status(404).send({ message: "Error add user to club." });
      }
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `1 Error subscribe to club ${error}` });
    });

  await UserModel.findOneAndUpdate(
    { _id: user.id, disabled: false },
    { $addToSet: { clubs: club } }
  )
    .then((resUser) => {
      if (!resUser) {
        return res.status(404).send({ message: "2 Error add user to club." });
      } else {
        return res
          .status(200)
          .send({ message: `Club add to user ${userName}` });
      }
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error subscribe to club ${error}` });
    });
}

let router = express.Router();

router.get("/", getClubs);
router.get("/:name", getClub);
router.post("/", newClub);
router.delete("/:name", deleteClub);
router.put("/", subscribeUserClub);
export default router;
