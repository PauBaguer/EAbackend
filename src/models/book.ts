import mongoose from "mongoose";
const Schema = mongoose.Schema;
const model = mongoose.model;



export interface Book{
    
        title: String,
        category:[String],
        ISBN: String,
        photoURL: String,
        releaseDate: Date,
        publicationDate:Date,    
        format:String,
        description: String,
        location : {latitude : Number, longitude: Number},
        rate: Number,
        editorial: String
        //comments: Comment[],
        //writer:Writer,
        //editorial: Schema,  
        //quantity:Number,
        //sells:Number,
   
}
const bookSchema = new Schema({
    title: {type: String, required:true},
    //writer:{type:Schema.ObjectId, ref: "Writer"},
    category: {type:[String]},
    ISBN: {type: String, required:true, unique:true},
    photoURL:  {type: String, required:true},
    releaseDate: {type: Date, default:Date.now},
    publicationDate: {type: Date, required:true},  
    format: {type: String, required:true},    
    description: {type: String, required:true},
    //location : {type: Number, latitude : Number, longitude: Number},
    location: {latitude: { type: Number }, longitude: { type: Number }},
    rate: {type: Number, required:true},
    editorial:{type: String, required:true}
    


    //quantity: {type: Number, required:true},
    //sells: {type: Number, required: true},
    //editorial : { type: Schema.Types.ObjectId, ref: "Editorial", required: true }
})

//export const  BookModel = mongoose.model('Book', bookSchema); not sure
export default model("Book", bookSchema);
