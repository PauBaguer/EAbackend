import mongoose, { Document } from "mongoose";
import { Book } from "./book.js";
import Dates from "./dates.js";
import { Category } from "./category.js";
import { User } from "./user.js";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Author extends Document, Dates {
    name: String;
    birthDate: Date;
    deathDate: Date;
    biography: String;
    books: Book[];
    categories: Category[];
    photoURL: String;
    user: User;
}

const authorSchema = new Schema<Author>(
    {
        name: { type: String, required: true, unique: true },
        birthDate: Date,
        deathDate: Date,
        biography: { type: String, required: true },
        books: [{ type: Schema.Types.ObjectId, ref: "Book" }],
        categories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
        photoURL: { type: String, default: "" },
        user: { type: Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
);

export const AuthorModel = mongoose.model("Author", authorSchema);
