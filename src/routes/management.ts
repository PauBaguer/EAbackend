import express, { Request, Response } from "express";
import { Categories, CategoryModel } from "../models/category.js";

async function getCategories(req: Request, res: Response) {
  try {
    let categories = await Categories();
    res.status(200).send(categories);
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function addCategory(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const category = new CategoryModel({ name });
    await category.save();
    res.status(201).send({ message: `Category created!` });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function deleteCategory(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await CategoryModel.findOneAndDelete({ _id: id });
    res.status(200).send({ message: `Category deleted!` });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

let router = express.Router();
router.get("/categories", getCategories);
router.post("/addCategory", addCategory);
router.delete("/category/:id", deleteCategory);

export default router;
