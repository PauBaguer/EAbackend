import express, { Request, Response } from "express";
import { Book, BookModel } from "../models/book.js";

async function getBooks(req: Request, res: Response): Promise<void> {
  try {
    const allBooks = await BookModel.find();
    if (allBooks.length == 0) {
      res.status(404).send({ message: "There are no books yet!" });
    } else {
      res.status(200).send(allBooks);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function getBook(req: Request, res: Response): Promise<void> {
  try {
    const bookFound = await BookModel.findOne({ _id: req.params.id }, req.body);
    if (bookFound == null) {
      res.status(404).send({ message: "The book doesn't exist!" });
    } else {
      res.status(200).send(bookFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}
async function getBookByCategory(req: Request, res: Response): Promise<void> {
  try {
    const bookFound = await BookModel.find({ category: req.params.category });
    if (bookFound == null) {
      res.status(404).send({ message: "The book doesn't exist!" });
    } else {
      res.status(200).send(bookFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}
async function getBookByAuthor(req: Request, res: Response): Promise<void> {
  try {
    const bookFound = await BookModel.find({ author: req.params.author });
    if (bookFound == null) {
      res.status(404).send({ message: "The book doesn't exist!" });
    } else {
      res.status(200).send(bookFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}
async function getBookByReleaseDate(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const bookFound = await BookModel.find({
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

async function addBook(req: Request, res: Response): Promise<void> {
  try {
    const { title, category, ISBN, photoURL, publicationDate, description, rate, editorial, } = req.body;
    const newBook = new BookModel({
      title: title,
      ISBN: ISBN,
      photoURL: photoURL,
      description: description,
      publishedDate: publicationDate,
      editorial: editorial,
      rate: rate,
      categories: category,
    });
    await newBook.save();
    res.status(200).send({ message: "Book added!" });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function updateBook(req: Request, res: Response): Promise<void> {
  try {
    const bookToUpdate = await BookModel.findOneAndUpdate(
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

async function deleteBook(req: Request, res: Response): Promise<void> {
  try {
    const bookToDelete = await BookModel.findOneAndDelete(
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

let router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBook);
router.get("/category/:category", getBookByCategory);
router.get("/author/:author", getBookByAuthor);
router.get("/releaseDate/:releaseDate", getBookByReleaseDate);
router.post("/", addBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook); // en el : va la categoria que se busca

export default router;
