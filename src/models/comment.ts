import mongoose, { Document } from "mongoose";
import { User } from "./user";
import Dates from "./dates";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Comment extends Document, Dates {
  user: User;
  title: string;
  text: string;
  type: string;
  users: string[];
  likes: number;
}

const commentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String },
    text: { type: String, required: true },
    type: { type: String, required: true },
    users: { type: [String], default: [""] },
    likes: { type: Number },
  },
  { timestamps: true }
);

export const CommentModel = mongoose.model("Comment", commentSchema);
