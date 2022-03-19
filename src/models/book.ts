import mongoose from "mongoose";

const Schema = mongoose.Schema;
const model = mongoose.model;
//const Editorial = mongoose.model;  To Do :)

export interface Book{
    
        title: String,
        author:String,
        category:String,
        ISBN: String,
        releaseDate: Date,
        publicationDate:Date,
        //editorial: Schema,  
        format:String,
        quantity:Number,
        sells:Number,
        description: String
   
}
const bookSchema = new Schema({
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
//export const  BookModel = mongoose.model('Book', bookSchema);
export default model("Book", bookSchema);
