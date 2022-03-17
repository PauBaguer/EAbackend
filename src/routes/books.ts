import {Request, response, Response, Router} from "express";

import Book from '../models/book.js';

class BookRoutes {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes(); //This has to be written here so that the method can actually be configured when called externally.
    }

    public async getBooks(req: Request, res: Response) : Promise<void> { //It returns a void, but internally it's a promise.
        const allBooks = await Book.find();
        if (allBooks.length == 0){
            res.status(404).send("There are no books yet!")
        }
        else{
            res.status(200).send(allBooks);
        }
    }

    public async getBookByName(req: Request, res: Response) : Promise<void> {
        const bookFound = await Book.findOne({name: req.params.nameBook});
        if(bookFound == null){
            res.status(404).send("The book doesn't exist!");
        }
        else{
            res.status(200).send(bookFound);
        }
    }

    public async addBook(req: Request, res: Response) : Promise<void> {
        console.log(req.body);
        const {title, category,ISBN,publicationDate,format,quantity,sells,description} = req.body;
        const newBook = new Book({title, category,ISBN,publicationDate,format,quantity,sells,description});
        await newBook.save();
        res.status(200).send('Book added!');
    }

    public async updateBook(req: Request, res: Response) : Promise<void> {
        const bookToUpdate = await Book.findOneAndUpdate ({name: req.params.nameBook}, req.body);
        if(bookToUpdate == null){
            res.status(404).send("The book doesn't exist!");
        }
        else{
            res.status(200).send('Updated!');
        }
    }

    public async deleteBook(req: Request, res: Response) : Promise<void> {
        const bookToDelete = await Book.findOneAndDelete ({name:req.params.nameBook}, req.body);
        if (bookToDelete == null){
            res.status(404).send("The book doesn't exist!")
        }
        else{
            res.status(200).send('Deleted!');
        }
    } 
    routes() {
        this.router.get('/', this.getBooks);
        this.router.get('/:nameUser', this.getBookByName);
        this.router.post('/', this.addBook);
        this.router.put('/:nameUser', this.updateBook);
        this.router.delete('/:nameUser', this.deleteBook);
    }
}
const bookRoutes = new BookRoutes();

export default bookRoutes.router;