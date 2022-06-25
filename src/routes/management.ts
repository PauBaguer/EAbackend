import { privateEncrypt } from "crypto";
import express, { Request, Response } from "express";
import { Categories, Category, CategoryModel } from "../models/category.js";
import { UserModel, UserToSend } from "../models/user.js";

async function getCategories(req: Request, res: Response) {
  try {
    let categories = await Categories();
    res.status(200).send(categories);
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function updateUserCategories(req: Request, res: Response) {
  try {
    const { categories } = req.body;
    console.log(req.body);
    const { userId: userId } = req.params;
    const user: UserToSend | null = await UserModel.findOne({
      _id: userId,
    });
    if (!user) {
      res.status(404).send({ message: `User ${userId} not found in DB` });
      return;
    } else {
      const newCategories: Category[] | null = await CategoryModel.find({
        name: String(categories).split(","),
      });
      console.log(newCategories);
      user.categories = newCategories;
      console.log(user);
      const result = await UserModel.updateOne(
        { _id: userId, disabled: false },
        user
      );
      console.log(result);
      if (!result.modifiedCount) {
        res.status(404).send({ message: `User ${userId} not found in DB` });
        return;
      }
      res.status(200).send({ message: `User ${userId} updated` });
    }
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
router.put("/updateCategories/:userId", updateUserCategories);
router.post("/addCategory", addCategory);
router.delete("/category/:id", deleteCategory);

export default router;
