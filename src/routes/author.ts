import express, { Request, Response } from "express";
import { AuthorModel, Author } from "../models/author.js";
import { Category, CategoryModel } from "../models/category.js";
import { User, UserModel } from "../models/user.js";
import { BookModel, Book } from '../models/book.js';

async function getAll(req: Request, res: Response) {
    try {
        const authors: Author[] = await AuthorModel.find();
        const sortedList = authors.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        res.status(200).send(sortedList);
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

async function getById(req: Request, res: Response) {
    try {
        const { id: id } = req.params;
        const author: Author | null = await AuthorModel.findById(id)
            .populate("categories")
            .populate("user")
        //If the id is not from an author, maybe it's an user
        if (!author) {
            getByUser(id, res);
            return;
        }

        res.status(200).send(author);
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

async function getByUser(userId: string, res: Response) {
    try {
        //comprueba que el usuario existe
        await UserModel.findById(userId)
            .then((user) => {
                if (user) {
                    //Si existe comprobar que tenga perfil de autor
                    AuthorModel.findOne({
                        user: user,
                    })
                        .populate("categories")
                        .populate("user").then((author) => {
                            if (!author) {
                                res.status(404).send({ message: `User is not an Author` });
                                return;
                            }
                            res.status(200).send(author);
                            return;
                        })
                }
                res.status(400).send({ message: `Author is not an user` });
            }).catch((error) => {
                res
                    .status(400)
                    .send({ message: `Error get author '${userId}': ${error}` });
            });
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

async function postAuthor(req: Request, res: Response) {
    try {
        const { name, birthDate, deathDate, biography, category, photoURL, userId } = req.body;
        if (await AuthorModel.findOne({ name: name })) {
            res
                .status(406)
                .send({ message: "There is already a author with the same name." });
            return;
        }
        const user: User | null = await UserModel.findById(userId).then((user) => { if (!user) return null; return user });
        const categories: Category[] | null = await CategoryModel.find({
            name: category.split(","),
        });


        const newAuthor = new AuthorModel({
            name: name,
            birthDate: birthDate,
            deathDate: deathDate,
            biography: biography,
            categories: categories,
            photoURL: photoURL,
            user: user,
        });
        await newAuthor.save();

        res.status(201).send({ message: `Author ${name} created!` });
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

async function updateAuthor(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, birthDate, deathDate, biography, category, photoURL } = req.body;
        const categories: Category[] | null = await CategoryModel.find({
            name: category.split(","),
        });
        const result = await AuthorModel.updateOne(
            { _id: id },
            { name: name, deathDate: deathDate, biography: biography, birthDate: birthDate, categories: categories, photoURL: photoURL }
        );

        if (!result.modifiedCount) {
            res.status(404).send({ message: `Author ${id} not found in DB` });
            return;
        }
        res.status(200).send({ message: `Author ${id} updated` });
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

async function addBook(req: Request, res: Response) {
    try {
        const { authorId, bookId } = req.body;
        const author = await AuthorModel.findById(authorId);
        const book = await BookModel.findById(bookId);
        if (!author || !book) {
            return res
                .status(404)
                .send({ message: `Author ${authorId} or book ${bookId} not found` });
        }

        await AuthorModel.findOneAndUpdate(
            { _id: author.id },
            { $addToSet: { books: book } }
        )
            .then((resAuthor) => {
                if (!resAuthor) {
                    return res.status(404).send({ message: "Error add book to author." });
                }
                BookModel.updateMany({ _id: author.books },
                    { $set: { writer: resAuthor } })
                    .then((resBook) => {
                        if (!resBook) {
                            return res.status(404).send({ message: "Error add book to author." });
                        }
                        return res.status(200).send({
                            message: `Book ${book.title} added ${author.name}`,
                        });
                    })
            })
            .catch((error) => {
                return res
                    .status(400)
                    .send({ message: `Error add book ${error}` });
            });
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

async function delBook(req: Request, res: Response) {
    try {
        const { authorId, bookId } = req.body;
        const author = await AuthorModel.findById(authorId);
        const book = await BookModel.findById(bookId);
        if (!author || !book) {
            return res
                .status(404)
                .send({ message: `Author ${authorId} or book ${bookId} not found` });
        }

        await AuthorModel.findOneAndUpdate(
            { _id: author.id },
            { $pull: { books: book } },
            { safe: true }
        )
            .then((resAuthor) => {
                if (!resAuthor) {
                    return res.status(404).send({ message: "Error add book to author." });
                }
                const anonymous = AuthorModel.find({ name: "anonymous" })
                BookModel.updateMany({ _id: author.books },
                    { $set: { writer: anonymous } },
                    { safe: true })
                return res.status(200).send({ message: `Book deleted!` });
            })
            .catch((error) => {
                return res
                    .status(400)
                    .send({ message: `Error add book ${error}` });
            });
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

async function deleteById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await AuthorModel.findByIdAndDelete(id)
            .then((author) => {
                if (author) {
                    const anonymous = AuthorModel.find({ name: "anonymous" })
                    BookModel.updateMany({ _id: author.books },
                        { $set: { writer: anonymous } },
                        { safe: true })
                    return res.status(200).send({ message: `Author ${id} deleted!` });
                }
                res.status(404).send({ message: `Author with id ${id} not found` });
            }).catch((error) => {
                res.status(400).send({ message: `Error delete Author ${error}` });
            });
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

let router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", postAuthor);
router.put("/:id", updateAuthor);
router.put("/", addBook);
router.put("/delBook", delBook);
router.delete("/:id", deleteById);

export default router;
