import mongoose from "mongoose";
import { Track } from "./track.js";
const Schema = mongoose.Schema;
const model = mongoose.model;

export interface User {
  name: String;
  email: String;
  age: Number;
}

const userSchema = new Schema<User>({
  name: String,
  email: String,
  age: Number,
});

export const UserModel = model<User>("User", userSchema);
