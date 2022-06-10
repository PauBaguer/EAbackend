import mongoose, { Document } from "mongoose";
import { Book } from "./book.js";
import { Event } from "./event";
import { Club } from "./club.js";
import { Chat } from "./chat.js";
import Dates from "./dates.js";
import { Category } from "./category.js";
import * as Role from "./role.js";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface User extends Document, Dates {
  name: String;
  userName: String;
  birthDate: Date;
  mail: String;
  password: String;
  location: { latidude: Number; longitude: Number };
  books: Book[];
  events: Event[];
  clubs: Club[];
  chats: Chat[];
  disabled: Boolean;
  categories: Category[];
  photoURL: String;
  role: String[];
  google: Boolean;
}

export interface UserToSend {
  name: String;
  userName: String;
  birthDate: Date;
  mail: String;
  location: { latidude: Number; longitude: Number };
  books: Book[];
  events: Event[];
  clubs: Club[];
  chats: Chat[];
  categories: Category[];
  photoURL: String;
  role: String[];
  google: Boolean;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    birthDate: Date,
    mail: { type: String, required: true, unique: true },
    password: String,
    location: { type: { latidude: Number, longitude: Number } },
    books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    clubs: [{ type: Schema.Types.ObjectId, ref: "Club" }],
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    disabled: { type: Boolean, default: false },
    categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    photoURL: { type: String, default: "" },
    role: { type: [String], default: ["READER"] },
    google: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
