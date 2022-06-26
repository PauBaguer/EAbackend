import express, { Request, Response } from "express";
import { Author, AuthorModel } from "../models/author.js";
import { Book, BookModel } from "../models/book.js";
import { Category, CategoryModel } from "../models/category.js";

async function getBooks(req: Request, res: Response): Promise<void> {
  try {
    const allBooks = await BookModel.find()
      .populate("category")
      .populate("writer", "name");
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
    const bookFound = await BookModel.findOne({ _id: req.params.id })
      .populate("category")
      .populate("writer", "name");
    if (bookFound == null) {
      res.status(404).send({ message: "The book doesn't exist!" });
    } else {
      res.status(200).send(bookFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

//get book by categories POR ID
async function getBookByCategory(req: Request, res: Response): Promise<void> {
  try {
    const bookFound = await BookModel.find({
      categories: req.params.categories,
    }).populate("category");
    if (bookFound == null || bookFound.length == 0) {
      res
        .status(404)
        .send({ message: "There are no books with this category!" });
    } else {
      res.status(200).send(bookFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}
/*
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
*/
async function getBookByReleaseDate(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const bookFound = await BookModel.find({
      releaseDate: req.params.releaseDate,
    }).populate("category");
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
    const {
      title,
      category,
      ISBN,
      photoURL,
      publishedDate,
      description,
      rate,
      editorial,
      writer,
    } = req.body;
    const categories: Category[] | null = await CategoryModel.find({
      name: category.split(","),
    });
    const author: Author | null = await AuthorModel.findById(writer);
    const newBook = new BookModel({
      title: title,
      category: categories,
      ISBN: ISBN,
      photoURL: photoURL,
      publishedDate: publishedDate,
      description: description,
      rate: rate,
      editorial: editorial,
      writer: author,
    });
    const book = await newBook.save();
    await AuthorModel.findOneAndUpdate(
      { _id: author },
      { $push: { books: book.id } },
      { safe: true }
    )
      .then(async (resAuthor) => {
        if (!resAuthor) {
          return res.status(404).send({ message: "Error add book to author." });
        }
      })
      .catch((error) => {
        return res.status(400).send({ message: `Error add book ${error}` });
      });
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
      await AuthorModel.findOneAndUpdate(
        { _id: bookToDelete.writer },
        { $pull: { books: bookToDelete._id } },
        { safe: true }
      );
      res.status(200).send({ message: "Deleted!" });
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

const router = express.Router();

router.get("/", getBooks);
router.get("/:id", getBook);
router.get("/category/:categories", getBookByCategory);
//router.get("/author/:author", getBookByAuthor);
router.get("/releaseDate/:releaseDate", getBookByReleaseDate);
router.post("/", addBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook); // en el : va la categoria que se busca

export default router;
