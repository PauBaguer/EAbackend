import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;
const model = mongoose.model;

export interface Rate extends Document {

  bookId: String;
  rating: {type: 
    {userId: String, 
      rate: Number};
    }[];
  totalRate: Number;

}

const rateSchema = new Schema(
  {
    bookId: {type: String, required: true},
    rating: [{userId:{type: String, required: true}, rate : {type: Number,required: true}}],
    totalRate: {type: Number, required: true},
  },
  { timestamps: true }
);

export const RateModel = mongoose.model("Rate", rateSchema);
