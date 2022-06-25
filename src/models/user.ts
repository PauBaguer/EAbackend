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
  name: string;
  userName: string;
  birthDate: Date;
  mail: string;
  password: string;
  location: { latidude: number; longitude: number };
  books: Book[];
  events: Event[];
  clubs: Club[];
  chats: Chat[];
  disabled: boolean;
  categories: Category[];
  photoURL: string;
  role: string[];
  google: boolean;
}

export interface UserToSend {
  name: string;
  userName: string;
  birthDate: Date;
  mail: string;
  location: { latidude: number; longitude: number };
  books: Book[];
  events: Event[];
  clubs: Club[];
  chats: Chat[];
  categories: Category[];
  photoURL: string;
  role: string[];
  google: boolean;
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
