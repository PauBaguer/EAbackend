import express, { Request, Response } from "express";
import { Category, CategoryModel } from "../models/category.js";
import { EventModel, Event } from "../models/event.js";
import { User, UserModel } from "../models/user.js";

async function getEvents(req: Request, res: Response): Promise<void> {
  try {
    const allEvents = await EventModel.find()
      .populate(
        "usersList",
        "name userName birthDate mail location books events clubs chats categories photoURL role"
      )
      .populate(
        "admin",
        "name userName birthDate mail location books events clubs chats categories photoURL role"
      )
      .populate("category");
    if (allEvents.length == 0) {
      res.status(404).send({ message: "There are no events yet!" });
    } else {
      res.status(200).send(allEvents);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function getEventById(req: Request, res: Response): Promise<void> {
  try {
    const eventFound = await EventModel.findOne({
      _id: req.params.eventId,
    })
      .populate("usersList", "name userName age mail")
      .populate("admin", "name userName age mail")
      .populate("category");
    if (eventFound == null) {
      res.status(404).send({ message: "The event doesn't exist!" });
    } else {
      res.status(200).send(eventFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function createEvent(req: Request, res: Response): Promise<void> {
  try {
    console.log(req.body);
    const { name, description, location, category, eventDate, usersList } =
      req.body;
    const { userId } = req.params;
    const admin: User | null = await UserModel.findOne({
      _id: userId,
      disabled: false,
    });
    if (admin == null || admin._id != userId) {
      res.status(404).send({ message: "Error. User not found." });
      return;
    }
    const categories: Category[] | null = await CategoryModel.find({
      name: category.split(","),
    });
    const newEvent = new EventModel({
      name: name,
      description: description,
      location: location,
      admin: admin,
      category: categories,
      usersList: usersList,
      eventDate: eventDate,
    });
    await newEvent.save();
    UserModel.findOneAndUpdate(
      { _id: userId, disabled: false },
      { $push: { events: newEvent } },
      function (error, success) {
        if (error) {
          res.status(500).send({ message: `Server error: ${error}` });
          return;
        }
      }
    );
    res.status(201).send(newEvent);
  } catch (e) {
    res
      .status(500)
      .send({ message: `Server error adding user to event: ${e}` });
  }
}

async function joinEvent(req: Request, res: Response): Promise<void> {
  try {
    const { userId, eventId } = req.params;
    console.log("User: " + userId);
    console.log("Event: " + eventId);
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
          res
            .status(500)
            .send({ message: `Server error adding event to user: ${error}` });
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
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function leaveEvent(req: Request, res: Response): Promise<void> {
  try {
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
          res
            .status(500)
            .send({ message: `Error deleting the event to user: ${error}` });
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
          res
            .status(500)
            .send({ message: "Error deleting the user to event." });
          return;
        } else {
          res.status(200).send({
            message: "Event deleted successfully to " + user.userName,
          });
        }
      }
    );
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function updateEvent(req: Request, res: Response): Promise<void> {
  try {
    const event = req.body;
    const categories: Category[] | null = await CategoryModel.find({
      name: event.category.split(","),
    });
    event.category = categories;
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
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function deleteEvent(req: Request, res: Response): Promise<void> {
  try {
    const { eventId } = req.params;
    const eventToDelete = await EventModel.findOneAndDelete({
      _id: eventId,
    });
    if (eventToDelete == null) {
      res.status(404).send({ message: "The event doesn't exist!" });
    } else {
      UserModel.findOneAndUpdate(
        { _id: eventToDelete.usersList, disabled: false },
        { $pull: { events: eventToDelete._id } },
        { safe: true },
        function (error, success) {
          if (error) {
            res
              .status(500)
              .send({ message: `Error deleting the event to user: ${error}` });
            return;
          }
        }
      );
      res.status(200).send({ message: "Deleted!" });
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
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
