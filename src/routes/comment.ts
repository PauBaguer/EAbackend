import express, { Request, Response } from "express";
import { Comment, CommentModel } from "../models/comment.js";
import { UserModel } from "../models/user.js";

async function getComments(req: Request, res: Response): Promise<void> {
  try {
    const allComments = await CommentModel.find().populate("user");
    if (allComments.length == 0) {
      res.status(404).send({ message: "There are no comments yet!" });
    } else {
      res.status(200).send(allComments);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function getCommentByType(req: Request, res: Response): Promise<void> {
  try {
    const commentsFound = await CommentModel.find({ type: req.params.type}).populate("user");
    if (commentsFound.length == 0) {
      res.status(404).send({ message: "There are no comments yet!" });
    } else {
      res.status(200).send(commentsFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}


async function getComment(req: Request, res: Response): Promise<void> {
  try {
    const commentFound = await CommentModel.findOne({ _id: req.params.id, }).populate("user");
    if (commentFound == null) {
      res.status(404).send({ message: "The comment doesn't exist!" });
    } else {
      res.status(200).send(commentFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function addComment(req: Request, res: Response): Promise<void> {
  try {
    const {
      user,
      title,
      text,
      type,
      users,
      likes,
      dislikes,
    } = req.body;
    
    const userC = await UserModel.findById(user);

    const NewComment = new CommentModel({
      user: userC,
      title: title,
      text: text,
      type: type,
      users: users,
      likes: likes,
      dislikes: dislikes,
    });
    await NewComment.save();
    res.status(200).send({ message: "Comment added!" });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function updateComment(req: Request, res: Response): Promise<void> {
  try {
    const commentToUpdate = await CommentModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );
    if (commentToUpdate == null) {
      res.status(404).send({ message: "The comment doesn't exist!" });
    } else {
      res.status(200).send({ message: "Updated!" });
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function deleteComment(req: Request, res: Response): Promise<void> {
  try {
    const commentToDelete = await CommentModel.findOneAndDelete(
      { _id: req.params.id },
      req.body
    );
    if (commentToDelete == null) {
      res.status(404).send({ message: "The comment doesn't exist!" });
    } else {
      res.status(200).send({ message: "Deleted!" });
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

let router = express.Router();

router.get("/", getComments);
router.get("/type/:type", getCommentByType);
router.get("/:id", getComment);
router.post("/", addComment);
router.put("/:id", updateComment);
router.delete("/:id", deleteComment); // en el : va la categoria que se busca

export default router;
