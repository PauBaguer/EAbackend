import { Schema, model } from "mongoose";
import { User } from "../models/user";

const EventSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  creationDate: { type: Date, default: Date.now, required: true },
  usersList: { type: [Schema.Types.ObjectId], ref: "User" },
  category: { type: String, required: true },
  position: {
    type: {
      latitude: Number,
      longitude: Number,
    },
  },
});
export default model("Event", EventSchema);
