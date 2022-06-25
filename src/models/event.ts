import mongoose, { Document } from "mongoose";
import { Category } from "./category";
import { Chat } from "./chat";
import Dates from "./dates";
import { User } from "./user";
const Schema = mongoose.Schema;

export interface Event extends Document, Dates {
  name: String;
  description: String;
  location: {
    type: {
      latitude: Number;
      longitude: Number;
    };
  };
  admin: User;
  chat: Chat;
  eventDate: Date;
  usersList: User[];
  category: Category[];
}

const eventSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    location: {
      type: {
        latitude: Number,
        longitude: Number,
      },
    },
    admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    eventDate: { type: Date },
    usersList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    category: [
      { type: Schema.Types.ObjectId, required: true, ref: "Category" },
    ],
  },
  { timestamps: true }
);
export const EventModel = mongoose.model("Event", eventSchema);
