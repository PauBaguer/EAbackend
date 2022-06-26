import mongoose, { Document } from "mongoose";
import { Author } from "./author";
import { Category } from "./category";
import Dates from "./dates";
const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Book extends Document, Dates {
  title: string;
  ISBN: string;
  photoURL: string;
  description: string;
  publishedDate: Date;
  editorial: string;
  rate: number;
  category: Category[];
  writer: Author;
}

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    category: [
      { type: Schema.Types.ObjectId, required: true, ref: "Category" },
    ],
    ISBN: { type: String, required: true, unique: true },
    photoURL: { type: String },
    publishedDate: { type: Date },
    
    description: { type: String, required: true },
    
    rate: { type: Number },
    editorial: { type: String },
    writer: { type: Schema.Types.ObjectId, required: true, ref: "Author" },
  },
  { timestamps: true }
);

export const BookModel = mongoose.model("Book", bookSchema);
