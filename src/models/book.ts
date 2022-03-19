import mongoose from "mongoose";
const Schema = mongoose.Schema;
const model = mongoose.model;
//const Editorial = mongoose.model;  To Do :)

const BookSchema = new Schema({
    title: {type: String, required:true},
    author:{type: String, required:true},
    category: {type: String, required:true},
    ISBN: {type: String, required:true},
    releaseDate: {type: Date, default:Date.now},
    publicationDate: {type: Date, required:true},
    //editorial:{type: Schema.ObjectId, ref: "Editorial"},  
    format: {type: String, required:true},
    quantity: {type: Number, required:true},
    sells: {type: Number, required: true},
    description: {type: String, required:true}
})
export default model('Book', BookSchema);