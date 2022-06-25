import express, { Request, Response } from "express";
import { Rate, RateModel } from "../models/rate.js";


async function getRates(req: Request, res: Response): Promise<void> {
  try {
    const allRates = await RateModel.find().populate("rating","userId","rate");
    if (allRates.length == 0) {
      res.status(404).send({ message: "There are no rates yet!" });
    } else {
      res.status(200).send(allRates);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function getBookRate(req: Request, res: Response): Promise<void> {
  try {
    const rateFound = await RateModel.findOne({ bookId: req.params.bookId, }).populate("rating","userId","rate");
    if (rateFound == null) {
      res.status(404).send({ message: "The rate doesn't exist!" });
    } else {
      res.status(200).send(rateFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}


async function addRate(req: Request, res: Response): Promise<void> {
  try {
    const {
      bookId,
      totalRate,
      rating,
      
    } = req.body;
    const newRate = new RateModel({
      bookId: bookId,
      rating: rating, 
      totalRate: totalRate,    
    });
    await newRate.save();
    res.status(200).send({ message: "Rate added!" });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function updateTotalRate(req: Request, res: Response): Promise<void> {
  try {
    const rateToUpdate = await RateModel.findOneAndUpdate(
      { bookId: req.params.bookId },
      req.body
    );
    if (rateToUpdate == null) {
      res.status(404).send({ message: "The rate doesn't exist!" });
    } else {
      res.status(200).send({ message: "Updated!" });
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function deleteUserRate(req: Request, res: Response): Promise<void> {
  try {

    const { rating } = req.body;
    await RateModel.findOneAndUpdate(
      { bookId: req.params.bookId },
      { $pull: { rating: rating } },
      req.body
    )
    .then((resRate) => {
      if (!resRate) {
        return res.status(404).send({ message: "Error add userRate to book." });
      }
      else  {
        res.status(200).send({ message: "Updated!" });
      }
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error rate a book ${error}` });
    })
    ;
    
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function rateBook(req: Request, res: Response): Promise<void> {
  try {

    const { rating } = req.body;
    await RateModel.findOneAndUpdate(
      { bookId: req.params.bookId },
      { $addToSet: { rating: rating } },
      req.body
    )
    .then((resRate) => {
      if (!resRate) {
        return res.status(404).send({ message: "Error add userRate to book." });
      }
      else  {
        res.status(200).send({ message: "Updated!" });
      }
    })
    .catch((error) => {
      return res
        .status(400)
        .send({ message: `Error rate a book ${error}` });
    })
    ;
    
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function deleteRate(req: Request, res: Response): Promise<void> {
  try {
    const rateToDelete = await RateModel.findOneAndDelete(
      { _id: req.params.id },
      req.body
    );
    if (rateToDelete == null) {
      res.status(404).send({ message: "The rate doesn't exist!" });
    } 
    else {
      res.status(200).send({ message: "Deleted!" });
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

let router = express.Router();

router.get("/", getRates);
router.get("/:bookId", getBookRate);
router.post("/", addRate);
router.put("/:bookId", updateTotalRate);
router.put("/rating/:bookId", rateBook);
router.put("/deleteUserRate/:bookId", deleteUserRate);
router.delete("/:id", deleteRate); // en el : va la categoria que se busca

export default router;
