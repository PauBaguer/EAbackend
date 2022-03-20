import mongoose from "mongoose";
import { User } from "./user";
const Schema = mongoose.Schema;

export interface Event {
  name: String;
  description: String;
  admin: User;
  creationDate: Date;
  usersList: User[];
  category: String;
  position: {
    type: {
      latitude: Number;
      longitude: Number;
    };
  };
}

const eventSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  creationDate: { type: Date, default: Date.now, required: true },
  usersList: [{ type: Schema.Types.ObjectId, ref: "User" }],
  category: { type: String, required: true },
  position: {
    type: {
      latitude: Number,
      longitude: Number,
    },
  },
});
export const EventModel = mongoose.model("Event", eventSchema);
