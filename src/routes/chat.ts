import express, { Request, Response } from "express";
import { Schema } from "mongoose";
import { ChatModel, Chat } from "../models/chat.js";
import { ChatMessage } from "../models/chatMessage.js";

async function getAllChats(req: Request, res: Response) {
  const allChats = await ChatModel.find().populate("users");
  if (!allChats) {
    res.status(500).send({ message: "Not error while querring for chats." });
    return;
  }
  res.status(200).send(allChats);
}

interface newChatBody {
  name: String;
  userIds: Schema.Types.ObjectId[];
}

async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const chat = await ChatModel.findById(id);

  if (!chat) res.status(404).send({ message: `Chat with id ${id} not in DB` });

  res.status(200).send(chat);
}

async function newChat(req: Request<{}, {}, newChatBody>, res: Response) {
  const name: String = req.body.name;
  const userIds: Schema.Types.ObjectId[] = req.body.userIds;

  const chat = new ChatModel({ name: name, users: userIds });
  await chat.save();
  res.status(201).send();
}

async function deleteById(req: Request, res: Response) {
  const { id } = req.params;
  const result = await ChatModel.deleteOne({ _id: id });

  if (!result.deletedCount)
    res.status(404).send({ message: `Chat with id ${id} not in DB` });
  res.status(200).send();
}

async function getLast10MessagesFrom(req: Request, res: Response) {
  const idFromFinalMessage = req.params.chatId;
  const chatId = req.params.chatId;

  const populatedChat: Chat | null = await ChatModel.findById(chatId).populate(
    "messages"
  );
  const sortedMessages = populatedChat?.messages.sort(
    (a: ChatMessage, b: ChatMessage) => b.date.getTime() - a.date.getTime()
  );

  const indexOfLastMessage = sortedMessages?.findIndex(
    (message) => message._id === idFromFinalMessage
  );

  if (!indexOfLastMessage) {
    res
      .status(404)
      .send({ message: `Message with id ${idFromFinalMessage} not in DB` });
    return;
  }

  const lastMessages = sortedMessages?.map(
    (message, index) =>
      index > indexOfLastMessage && index <= indexOfLastMessage + 10
  );

  res.status(200).send(lastMessages);
}

let router = express.Router();

router.get("/", getAllChats);
router.get("/:chatId/:messageId", getById);
router.get("/messages/:id", getLast10MessagesFrom);
router.post("/", newChat);
router.delete("/:id", deleteById);
export default router;
