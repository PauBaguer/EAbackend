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
  photoURL: String;
}

const clubSchema = new Schema<Club>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    usersList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    photoURL: {
      type: String,
      default:
        "https://res.cloudinary.com/tonilovers-inc/image/upload/v1656076995/istockphoto-499373254-612x612_hxhwzg.jpg",
    },
    category: [
      { type: Schema.Types.ObjectId, required: true, ref: "Category" },
    ],
  },
  { timestamps: true }
);

export const ClubModel = mongoose.model("Club", clubSchema);
