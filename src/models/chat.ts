import mongoose from "mongoose";
import { User } from "./user.js";
import { ChatMessage } from ".chatMessage.js";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Chat {
  name: String;
  messages: ChatMessage[];
  users: User[];
}

const chatSchema = new Schema<Chat>({
  name: { type: String, required: true },
  messages: [{ type: Schema.Types.ObjectId, ref: "ChatMessage" }],
  users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
});

export const ChatModel = model<Chat>("Chat", chatSchema);
