import mongoose from "mongoose";
import { User } from "./user.js";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface ChatMessage {
  user: User;
  message: String;
  date: Date;
}

const chatMessageSchema = new Schema<ChatMessage>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  date: { type: Date, default: new Date() },
});

export const ChatMessageModel = model<ChatMessage>(
  "ChatMessage",
  chatMessageSchema
);
