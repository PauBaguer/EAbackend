import mongoose,{Document} from "mongoose";
import { User } from "./user";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Club extends Document{
  name: string;
  description: string;
  admin: User;
  users: User[];
  createdAt: Number;
  category: string; //TODO-JA: change category for an object
}

const clubSchema = new Schema<Club>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, required: true, default: Date.now(), modificable: false },
  category: { type: String, required: true },
});

export const ClubModel = mongoose.model("Club", clubSchema);
