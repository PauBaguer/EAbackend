import express, { Request, Response } from "express";
import { EventModel, Event } from "../models/event.js";
import { User, UserModel } from "../models/user.js";

async function getEvents(req: Request, res: Response): Promise<void> {
  //It returns a void, but internally it's a promise.
  const allEvents = await EventModel.find().populate(
    "usersList",
    "name userName age mail"
  );
  if (allEvents.length == 0) {
    res.status(404).send("There are no events yet!");
  } else {
    res.status(200).send(allEvents);
  }
}

async function getEventByName(req: Request, res: Response): Promise<void> {
  const eventFound = await EventModel.findOne({
    name: req.params.name,
  }).populate("usersList", "name userName age mail");
  if (eventFound == null) {
    res.status(404).send("The event doesn't exist!");
  } else {
    res.status(200).send(eventFound);
  }
}

async function createEvent(req: Request, res: Response): Promise<void> {
  console.log(req.body);
  const { name, description, category } = req.body;
  const { userName } = req.params;
  const admin: User | null = await UserModel.findOne({ userName: userName });
  if (admin == null || admin.userName != userName) {
    res.status(404).send({ message: "Error. User not found." });
    return;
  }
  const newEvent = new EventModel({
    name: name,
    description: description,
    admin: admin,
    category: category,
    usersList: admin,
  });
  UserModel.findOneAndUpdate(
    { userName: userName },
    { $push: { events: newEvent } },
    function (error, success) {
      if (error) {
        res.status(500).send({ message: "Error adding the event to user." });
        return;
      }
    }
  );
  await newEvent.save();
  res.status(201).send(newEvent);
}

async function joinEvent(req: Request, res: Response): Promise<void> {
  const { userName, nameEvent } = req.params;
  const user: User | null = await UserModel.findOne({ userName: userName });
  if (user == null || user.userName != userName) {
    res.status(404).send({ message: "Error. User not found." });
    return;
  }
  const event: Event | null = await EventModel.findOne({ name: nameEvent });
  if (event == null) {
    res.status(404).send({ message: "Error. Event not found." });
    return;
  }
  UserModel.findOneAndUpdate(
    { userName: user.userName },
    { $push: { events: event } },
    function (error, success) {
      if (error) {
        res.status(500).send({ message: "Error adding the event to user." });
        return;
      }
    }
  );
  EventModel.findOneAndUpdate(
    { name: nameEvent },
    { $push: { usersList: user } },
    function (error, success) {
      if (error) {
        res.status(500).send({ message: "Error adding the user to event." });
        return;
      }
    }
  );
  res.status(200).send({ message: "Event added successfully to " + userName });
}

async function leaveEvent(req: Request, res: Response): Promise<void> {
  const { userName, nameEvent } = req.params;
  const user = await UserModel.findOne({ userName: userName });
  if (user == null || user.userName != userName) {
    res.status(404).send({ message: "Error. User not found." });
    return;
  }
  const event = await EventModel.findOne({ name: nameEvent });
  if (event == null) {
    res.status(404).send({ message: "Error. Event not found." });
    return;
  }
  UserModel.findOneAndUpdate(
    { userName: user.userName },
    { $pull: { events: event._id } },
    function (error, success) {
      if (error) {
        res.status(500).send({ message: "Error deleting the event to user." });
        return;
      }
    }
  );
  EventModel.findOneAndUpdate(
    { name: nameEvent },
    { $pull: { usersList: user._id } },
    function (error, success) {
      if (error) {
        console.log(error);
        res.status(500).send({ message: "Error deleting the user to event." });
        return;
      } else {
        res
          .status(200)
          .send({ message: "Event deleted successfully to " + userName });
      }
    }
  );
}

async function updateEvent(req: Request, res: Response): Promise<void> {
  const { nameEvent } = req.params;
  const eventToUpdate = await EventModel.findOneAndUpdate(
    { name: nameEvent },
    req.body
  );
  if (eventToUpdate == null) {
    res.status(404).send({ message: "The event doesn't exist!" });
  } else {
    res.status(200).send({ message: "Updated!" });
  }
}

async function deleteEvent(req: Request, res: Response): Promise<void> {
  const { nameEvent } = req.params;
  const eventToDelete = await EventModel.findOneAndDelete({
    name: nameEvent,
  });
  if (eventToDelete == null) {
    res.status(404).send("The event doesn't exist!");
  } else {
    UserModel.findOneAndUpdate(
      { _id: eventToDelete.usersList },
      { $pull: { events: eventToDelete._id } },
      { safe: true },
      function (error, success) {
        if (error) {
          res
            .status(500)
            .send({ message: "Error deleting the event to user." });
          return;
        }
      }
    );
    res.status(200).send("Deleted!");
  }
}

let router = express.Router();

router.get("/", getEvents);
router.get("/:name", getEventByName);
router.post("/:userName", createEvent);
router.put("/join/:userName/:nameEvent", joinEvent);
router.put("/leave/:userName/:nameEvent", leaveEvent);
router.put("/:nameEvent", updateEvent);
router.delete("/:nameEvent", deleteEvent);

export default router;
