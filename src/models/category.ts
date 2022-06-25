import mongoose, { Document } from "mongoose";
import Dates from "./dates";
export const ADVENTURES = "ADVENTURES";
export const FANTASY = "FANTASY";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Category extends Document, Dates {
  name: String;
}

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model("Category", categorySchema);

export async function Categories() {
  return await CategoryModel.find();
}
