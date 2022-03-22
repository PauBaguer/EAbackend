import mongoose, { Document } from "mongoose";
import { Book } from "./book.js";
import { Event } from "./event";
import { Club } from "./club.js";
import { Chat } from "./chat.js";
//import { Category } from "./category";
//import { Payment } from "./payment";
const Schema = mongoose.Schema;
const model = mongoose.model;

export interface User extends Document {
  name: String;
  userName: String;
  age: Number;
  mail: String;
  password: String;
  location: { latidude: Number; longitude: Number };
  money: Number;
  books: Book[];
  events: Event[];
  clubs: Club[];
  chats: Chat[];
  createdAt: Date;
  updatedAt: Date;
  //  categories: Category[];
  //  payments: Payment[];
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true },
    age: Number,
    mail: { type: String, required: true },
    password: { type: String, required: true },
    location: { type: { latidude: Number, longitude: Number } },
    money: Number,
    books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    clubs: [{ type: Schema.Types.ObjectId, ref: "Club" }],
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    // categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    // payments: [{ type: Schema.Types.ObjectId, ref: "Payment" }],
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
