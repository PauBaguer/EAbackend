import express, { Request, Response } from "express";
import { AuthorModel, Author } from "../models/author.js";
import { Category, CategoryModel } from "../models/category.js";
import * as Role from "../models/role.js";
import { UserModel } from "../models/user.js";

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
        const { name, birthDate, deathDate, biography, books, category, photoURL, userId } = req.body;
        if (await AuthorModel.findOne({ name: name })) {
            res
                .status(406)
                .send({ message: "There is already a author with the same name." });
            return;
        }
        if (await AuthorModel.findOne({ name: name })) {
            res
                .status(406)
                .send({ message: "There is already a author with the same name." });
            return;
        }
        const user = await UserModel.findById(userId);
        const categories: Category[] | null = await CategoryModel.find({
            name: category.split(","),
        });

        const newAuthor = new AuthorModel({
            name: name,
            birthDate: birthDate,
            deathDate: deathDate,
            biography: biography,
            books: books,
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

async function updateUser(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { name, birthDate, deathDate, biography, category, photoURL } = req.body;
        const result = await AuthorModel.updateOne(
            { _id: id },
            { name: name, deathDate: deathDate, biography: biography, birthDate: birthDate, category: category, photoURL: photoURL }
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
//TODO CHANGE
async function deleteById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const delResult = await AuthorModel.updateOne(
            { _id: id, disabled: false },
            { disabled: true }
        );

        if (!delResult.modifiedCount) {
            res.status(404).send({ message: `Author with id ${id} not found` });
            return;
        }

        res.status(200).send({ message: `User ${id} deleted!` });
    } catch (e) {
        res.status(500).send({ message: `Server error: ${e}` });
    }
}

let router = express.Router();

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", postAuthor);
router.put("/update/:id", updateUser);
router.delete("/:id", deleteById);

export default router;
