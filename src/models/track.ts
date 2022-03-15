import mongoose from "mongoose";
const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Track {
  name: String;
  author: String;
}

const trackSchema = new Schema<Track>({
  name: String,
  author: String,
});

export const TrackModel = model<Track>("Track", trackSchema);
