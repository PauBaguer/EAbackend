import express, { Request, Response } from "express";
import { Schema } from "mongoose";
import { ChatModel, Chat } from "../models/chat.js";
import { ChatMessage } from "../models/chatMessage.js";
import { UserModel, User } from "../models/user.js";

async function getAllChats(req: Request, res: Response) {
  const allChats = await ChatModel.find().populate("users");
  if (!allChats) {
    res.status(500).send({ message: "Not error while querring for chats." });
    return;
  }

  const sortedList = allChats.sort((a, b) => {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  res.status(200).send(sortedList);
}

interface NewChatBody {
  name: String;
  userIds: Schema.Types.ObjectId[];
}

async function getById(req: Request, res: Response) {
  const { id } = req.params;
  const chat = await ChatModel.findById(id).populate("users");

  if (!chat) res.status(404).send({ message: `Chat with id ${id} not in DB` });

  res.status(200).send(chat);
}

async function newChat(req: Request<{}, {}, NewChatBody>, res: Response) {
  const name: String = req.body.name;
  const userIds: Schema.Types.ObjectId[] = req.body.userIds;

  const chat = new ChatModel({ name: name, users: userIds });
  await chat.save();

  const result = await UserModel.updateMany(
    { _id: userIds },
    { $push: { chats: chat._id } }
  );

  console.log(result);

  res.status(201).send();
}

async function joinChat(req: Request, res: Response) {
  const { chatId, username } = req.params;

  const chat: Chat | null = await ChatModel.findById(chatId);

  if (!chat) {
    res.status(404).send({ message: `Chat with id ${chatId} not found` });
    return;
  }

  const user: User | null = await UserModel.findOne({
    userName: username,
    disabled: false,
  });

  if (!user) {
    res.status(404).send({ message: `User ${username} not found` });
    return;
  }

  const usrResult = await UserModel.updateOne(
    { userName: username, disabled: false },
    { $push: { chats: chatId } }
  );

  if (!usrResult.modifiedCount) {
    res.status(500).send({ message: `User not modified` });
    return;
  }

  const result = await ChatModel.updateOne(
    { _id: chatId },
    { users: chat.users.push(user._id) }
  );

  if (!result.modifiedCount) {
    res.status(500).send({ message: `Chat not modified` });
    return;
  }

  res.status(200).send();
}

async function leaveChat(req: Request, res: Response) {
  const { chatId, username } = req.params;

  const chat: Chat | null = await ChatModel.findById(chatId);

  if (!chat) {
    res.status(404).send({ message: `Chat with id ${chatId} not found` });
    return;
  }

  const user: User | null = await UserModel.findOne({
    userName: username,
    disabled: false,
  });

  if (!user) {
    res.status(404).send({ message: `User ${username} not found` });
    return;
  }

  const usrResult = await UserModel.updateOne(
    { userName: username },
    { $pop: { chats: chatId } }
  );

  if (!usrResult.modifiedCount) {
    res.status(500).send({ message: `User not modified` });
    return;
  }

  const chatResult = await chat.update({ $pop: { users: user._id } });

  if (!usrResult.modifiedCount) {
    res.status(500).send({ message: `User not modified` });
    return;
  }
}

async function deleteById(req: Request, res: Response) {
  const { id } = req.params;

  const chat = await ChatModel.findById(id);

  if (!chat) {
    res.status(404).send({ message: `Chat with id ${id} not in DB` });
    return;
  }

  const resultUsers = await UserModel.updateMany(
    { _id: chat.users },
    { $pull: { chats: chat._id } }
  );

  if (resultUsers.modifiedCount < 1) {
    res.status(404).send({ message: `No users where able to be modified` });
    return;
  }

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
router.get("/:id", getById);
router.get("/messages/:id", getLast10MessagesFrom);
router.post("/", newChat);
router.post("/join/:chatId/:username", joinChat);
router.delete("/leave/:chatId/:username", leaveChat);
router.delete("/:id", deleteById);
export default router;
