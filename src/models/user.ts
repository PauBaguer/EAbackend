import mongoose from "mongoose";
import { Club } from "./club";
const Schema = mongoose.Schema;
const model = mongoose.model;

export interface User {
  name: String;
  email: String;
  age: Number;
  clubs: Club[];
}

const userSchema = new Schema<User>({
  name: String,
  email: String,
  age: Number,
  clubs: [{ type: Schema.Types.ObjectId, ref: "Club"}]
});

export const UserModel = mongoose.model("User", userSchema);
