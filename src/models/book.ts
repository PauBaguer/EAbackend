import mongoose from "mongoose";
const Schema = mongoose.Schema;
const model = mongoose.model;



export interface Book{
    
    _id?: string;
    title: string;
    ISBN: string;
    //writer: Writer;
    photoURL: string [];
    description: string;
    publishedDate: Date;
    editorial: string;
    rate : number;
    categories: string[];
    //comments: Comment[];
   
}
const bookSchema = new Schema({
    title: {type: String, required:true},
    //writer:{type:Schema.ObjectId, ref: "Writer"},
    categories: {type:[String], required:true},
    ISBN: {type: String, required:true, unique:true},
    photoURL:  {type: String},
    publishedDate: {type: Date},  
    format: {type: String},    
    description: {type: String, required:true},
    //comments : {type:Schema.ObjectId, ref: "Comment"},
    location: {latitude: { type: Number }, longitude: { type: Number }},
    rate: {type: Number},
    editorial:{type: String}
    
})

//export const  BookModel = mongoose.model('Book', bookSchema); not sure
export default model("Book", bookSchema);
