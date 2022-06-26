import mongoose, { Document } from "mongoose";
import { Category } from "./category";
import { Chat } from "./chat";
import Dates from "./dates";
import { User } from "./user";
const Schema = mongoose.Schema;

export interface Event extends Document, Dates {
  name: string;
  description: string;
  location: {
    type: {
      latitude: number;
      longitude: number;
    };
  };
  admin: User;
  chat: Chat;
  eventDate: Date;
  usersList: User[];
  category: Category[];
  photoURL: string;
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
    photoURL: {
      type: String,
      default:
        "https://res.cloudinary.com/tonilovers-inc/image/upload/v1656077605/images_xdx4t4.jpg",
    },
    category: [
      { type: Schema.Types.ObjectId, required: true, ref: "Category" },
    ],
  },
  { timestamps: true }
);
export const EventModel = mongoose.model("Event", eventSchema);
