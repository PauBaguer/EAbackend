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

async function getEventById(req: Request, res: Response): Promise<void> {
  const eventFound = await EventModel.findOne({
    _id: req.params.eventId,
  }).populate("usersList", "name userName age mail");
  if (eventFound == null) {
    res.status(404).send("The event doesn't exist!");
  } else {
    res.status(200).send(eventFound);
  }
}

async function createEvent(req: Request, res: Response): Promise<void> {
  console.log(req.body);
  const { name, description, location, category } = req.body;
  const { userId } = req.params;
  const admin: User | null = await UserModel.findOne({
    _id: userId,
    disabled: false,
  });
  if (admin == null || admin._id != userId) {
    res.status(404).send({ message: "Error. User not found." });
    return;
  }
  const newEvent = new EventModel({
    name: name,
    description: description,
    location: location,
    admin: admin,
    category: category,
    usersList: admin,
  });
  UserModel.findOneAndUpdate(
    { _id: userId, disabled: false },
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
  const { userId, eventId } = req.params;
  const user: User | null = await UserModel.findOne({
    _id: userId,
    disabled: false,
  });
  if (user == null || user._id != userId) {
    res.status(404).send({ message: "Error. User not found." });
    return;
  }
  const event: Event | null = await EventModel.findOne({ _id: eventId });
  if (event == null) {
    res.status(404).send({ message: "Error. Event not found." });
    return;
  }
  UserModel.findOneAndUpdate(
    { _id: userId, disabled: false },
    { $push: { events: event } },
    function (error, success) {
      if (error) {
        res.status(500).send({ message: "Error adding the event to user." });
        return;
      }
    }
  );
  EventModel.findOneAndUpdate(
    { _id: eventId },
    { $push: { usersList: user } },
    function (error, success) {
      if (error) {
        res.status(500).send({ message: "Error adding the user to event." });
        return;
      }
    }
  );
  res
    .status(200)
    .send({ message: "Event added successfully to " + user.userName });
}

async function leaveEvent(req: Request, res: Response): Promise<void> {
  const { userId, eventId } = req.params;
  const user = await UserModel.findOne({ _id: userId, disabled: false });
  if (user == null || user._id != userId) {
    res.status(404).send({ message: "Error. User not found." });
    return;
  }
  const event = await EventModel.findOne({ _id: eventId });
  if (event == null) {
    res.status(404).send({ message: "Error. Event not found." });
    return;
  }
  UserModel.findOneAndUpdate(
    { _id: userId, disabled: false },
    { $pull: { events: event._id } },
    function (error, success) {
      if (error) {
        res.status(500).send({ message: "Error deleting the event to user." });
        return;
      }
    }
  );
  EventModel.findOneAndUpdate(
    { _id: eventId },
    { $pull: { usersList: user._id } },
    function (error, success) {
      if (error) {
        console.log(error);
        res.status(500).send({ message: "Error deleting the user to event." });
        return;
      } else {
        res
          .status(200)
          .send({ message: "Event deleted successfully to " + user.userName });
      }
    }
  );
}

async function updateEvent(req: Request, res: Response): Promise<void> {
  const { eventId } = req.params;
  const eventToUpdate = await EventModel.findOneAndUpdate(
    { _id: eventId },
    req.body
  );
  if (eventToUpdate == null) {
    res.status(404).send({ message: "The event doesn't exist!" });
  } else {
    res.status(200).send({ message: "Updated!" });
  }
}

async function deleteEvent(req: Request, res: Response): Promise<void> {
  const { eventId } = req.params;
  const eventToDelete = await EventModel.findOneAndDelete({
    _id: eventId,
  });
  if (eventToDelete == null) {
    res.status(404).send("The event doesn't exist!");
  } else {
    UserModel.findOneAndUpdate(
      { _id: eventToDelete.usersList, disabled: false },
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
router.get("/:eventId", getEventById);
router.post("/:userId", createEvent);
router.put("/join/:userId/:eventId", joinEvent);
router.put("/leave/:userId/:eventId", leaveEvent);
router.put("/:eventId", updateEvent);
router.delete("/:eventId", deleteEvent);

export default router;
