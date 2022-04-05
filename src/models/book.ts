import mongoose, { Document } from "mongoose";
import Dates from "./dates";
const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Book extends Document, Dates {
  title: String;
  ISBN: String;
  photoURL: String[];
  description: String;
  publishedDate: Date;
  editorial: String;
  rate: Number;
  categories: String[];
}

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    categories: { type: [String], required: true },
    ISBN: { type: String, required: true, unique: true },
    photoURL: { type: String },
    publishedDate: { type: Date },
    format: { type: String },
    description: { type: String, required: true },
    location: { latitude: { type: Number }, longitude: { type: Number } },
    rate: { type: Number },
    editorial: { type: String },
  },
  { timestamps: true }
);

export const BookModel = mongoose.model("Book", bookSchema);
