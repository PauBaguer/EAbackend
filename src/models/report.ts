import mongoose, { Document } from "mongoose";
import { User } from "./user";
import Dates from "./dates";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Report extends Document, Dates {
  user: User;
  title: String;
  text: String;
}

const ReportSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    title: { type: String },
    text: { type: String, required: true},
  },
  { timestamps: true }
);

export const ReportModel = mongoose.model("Report", ReportSchema);
