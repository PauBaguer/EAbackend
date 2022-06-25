import mongoose, { Document } from "mongoose";
import { User } from "./user";
import { Chat } from "./chat.js";
import Dates from "./dates";
import { Category } from "./category";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Club extends Document, Dates {
  name: string;
  description: string;
  admin: User;
  chat: Chat;
  usersList: User[];
  category: Category[];
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new Schema<Club>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    usersList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    category: [
      { type: Schema.Types.ObjectId, required: true, ref: "Category" },
    ],
  },
  { timestamps: true }
);

export const ClubModel = mongoose.model("Club", clubSchema);
