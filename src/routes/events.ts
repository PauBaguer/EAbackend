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
      usersList: admin,
      eventDate: eventDate,
    });
    await newEvent.save();
    UserModel.findOneAndUpdate(
      { _id: userId, disabled: false },
      { $addToSet: { events: newEvent } },
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

async function joinEvent(req: Request, res: Response) {
  try {
    const { userId, eventId } = req.params;
    const event = await EventModel.findById(eventId);
    const user = await UserModel.findById(userId);
    if (!event || !user) {
      return res
        .status(404)
        .send({ message: `Event ${eventId} or user ${userId} not found` });
    }

    await EventModel.findOneAndUpdate(
      { _id: event.id },
      { $addToSet: { usersList: user } }
    )
      .then((resEvent) => {
        if (!resEvent) {
          return res.status(404).send({ message: "Error add user to event." });
        }
      })
      .catch((error) => {
        return res
          .status(400)
          .send({ message: `Error join to event ${error}` });
      });

    await UserModel.findOneAndUpdate(
      { _id: user.id },
      { $addToSet: { events: event } }
    )
      .then((resUser) => {
        if (!resUser) {
          return res.status(404).send({ message: "Error add user to event." });
        }
        res.status(200).send({
          message: `User ${user.name} has joined to ${event.name}`,
        });
      })
      .catch((error) => {
        res.status(400).send({ message: `Error join to event ${error}` });
      });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function leaveEvent(req: Request, res: Response) {
  try {
    const { userId, eventId } = req.params;
    await EventModel.findOneAndUpdate(
      { _id: eventId },
      { $pull: { usersList: userId } },
      { safe: true }
    )
      .then((event) => {
        if (!event) {
          return res.status(404).send({ message: "Event not found" });
        }
      })
      .catch((error) => {
        return res
          .status(400)
          .send({ message: `Error leave to event ${error}` });
      });

    await UserModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { events: eventId } },
      { safe: true }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: "User not found" });
        }
        res
          .status(200)
          .send({ message: `User ${user.name} leave event ${eventId}` });
      })
      .catch((error) => {
        res.status(400).send({ message: `Error leave to event ${error}` });
      });
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
      UserModel.updateMany(
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
