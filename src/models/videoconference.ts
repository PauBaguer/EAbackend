import mongoose from "mongoose";
import { User } from "./user.js";
import Dates from "./dates.js";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Videoconference extends mongoose.Document, Dates {
    name: String;
    token: String;
    users: User[];
}

const videoconferenceSchema = new Schema<Videoconference>(
    {
        name: { type: String, required: true },
        token: { type: String, required: true },
        users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    },
    { timestamps: true }
);

export const VideoconferenceModel = model<Videoconference>("Videoconference", videoconferenceSchema);
