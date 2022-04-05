import { Request, response, Response, Router } from "express";

import Book from "../models/book.js";

class BookRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.routes(); //This has to be written here so that the method can actually be configured when called externally.
  }

  public async getBooks(req: Request, res: Response): Promise<void> {
    try {
      const allBooks = await Book.find();
      if (allBooks.length == 0) {
        res.status(404).send({ message: "There are no books yet!" });
      } else {
        res.status(200).send(allBooks);
      }
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }

  public async getBook(req: Request, res: Response): Promise<void> {
    try {
      const bookFound = await Book.findOne({ _id: req.params.id }, req.body);
      if (bookFound == null) {
        res.status(404).send({ message: "The book doesn't exist!" });
      } else {
        res.status(200).send(bookFound);
      }
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }
  public async getBookByCategory(req: Request, res: Response): Promise<void> {
    try {
      const bookFound = await Book.find({ category: req.params.category });
      if (bookFound == null) {
        res.status(404).send({ message: "The book doesn't exist!" });
      } else {
        res.status(200).send(bookFound);
      }
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }
  public async getBookByAuthor(req: Request, res: Response): Promise<void> {
    try {
      const bookFound = await Book.find({ author: req.params.author });
      if (bookFound == null) {
        res.status(404).send({ message: "The book doesn't exist!" });
      } else {
        res.status(200).send(bookFound);
      }
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }
  public async getBookByReleaseDate(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const bookFound = await Book.find({
        releaseDate: req.params.releaseDate,
      });
      if (bookFound == null) {
        res.status(404).send({ message: "The book doesn't exist!" });
      } else {
        res.status(200).send(bookFound);
      }
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }

  public async addBook(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.body);
      const {
        title,
        category,
        ISBN,
        photoURL,
        publicationDate,
        format,
        description,
        location,
        rate,
        editorial,
      } = req.body;
      const newBook = new Book({
        title,
        category,
        ISBN,
        photoURL,
        publicationDate,
        format,
        description,
        location,
        rate,
        editorial,
      });
      await newBook.save();
      res.status(200).send({ message: "Book added!" });
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }

  public async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const bookToUpdate = await Book.findOneAndUpdate(
        { _id: req.params.id },
        req.body
      );
      if (bookToUpdate == null) {
        res.status(404).send({ message: "The book doesn't exist!" });
      } else {
        res.status(200).send({ message: "Updated!" });
      }
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }

  public async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const bookToDelete = await Book.findOneAndDelete(
        { _id: req.params.id },
        req.body
      );
      if (bookToDelete == null) {
        res.status(404).send({ message: "The book doesn't exist!" });
      } else {
        res.status(200).send({ message: "Deleted!" });
      }
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }
  routes() {
    this.router.get("/", this.getBooks);
    this.router.get("/:id", this.getBook);
    this.router.get("/category/:category", this.getBookByCategory);
    this.router.get("/author/:author", this.getBookByAuthor);
    this.router.get("/releaseDate/:releaseDate", this.getBookByReleaseDate);
    this.router.post("/", this.addBook);
    this.router.put("/:id", this.updateBook);
    this.router.delete("/:id", this.deleteBook); // en el : va la categoria que se busca
  }
}

const bookRoutes = new BookRoutes();

export default bookRoutes.router;
