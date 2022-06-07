import express, { Request, Response } from "express";
import { Report, ReportModel } from "../models/report.js";
import { UserModel } from "../models/user.js";

async function getReports(req: Request, res: Response): Promise<void> {
  try {
    const allReports = await ReportModel.find().populate("user");
    if (allReports.length == 0) {
      res.status(404).send({ message: "There are no reports yet!" });
    } else {
      res.status(200).send(allReports);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function getReportByUser(req: Request, res: Response): Promise<void> {
    try {
      const reportsFound = await ReportModel.find({ user: req.params.user}).populate("user");
      if (reportsFound.length == 0) {
        res.status(404).send({ message: "There are no reports yet!" });
      } else {
        res.status(200).send(reportsFound);
      }
    } catch (e) {
      res.status(500).send({ message: `Server error: ${e}` });
    }
  }

async function getReport(req: Request, res: Response): Promise<void> {
  try {
    const reportFound = await ReportModel.findOne({ _id: req.params.id, }).populate("user");
    if (reportFound == null) {
      res.status(404).send({ message: "The report doesn't exist!" });
    } else {
      res.status(200).send(reportFound);
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function addReport(req: Request, res: Response): Promise<void> {
  try {
    const {
      user,
      title,
      text,
    } = req.body;
    
    const userC = await UserModel.findById(user);

    const NewReport = new ReportModel({
      user: userC,
      title: title,
      text: text
    });
    await NewReport.save();
    res.status(200).send({ message: "Report added!" });
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function updateReport(req: Request, res: Response): Promise<void> {
  try {
    const reportToUpdate = await ReportModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body
    );
    if (reportToUpdate == null) {
      res.status(404).send({ message: "The report doesn't exist!" });
    } else {
      res.status(200).send({ message: "Updated!" });
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

async function deleteReport(req: Request, res: Response): Promise<void> {
  try {
    const reportToDelete = await ReportModel.findOneAndDelete(
      { _id: req.params.id },
      req.body
    );
    if (reportToDelete == null) {
      res.status(404).send({ message: "The report doesn't exist!" });
    } else {
      res.status(200).send({ message: "Deleted!" });
    }
  } catch (e) {
    res.status(500).send({ message: `Server error: ${e}` });
  }
}

let router = express.Router();

router.get("/", getReports);
router.get("/user/:user", getReportByUser);
router.get("/:id", getReport);
router.post("/", addReport);
router.put("/:id", updateReport);
router.delete("/:id", deleteReport); // en el : va la categoria que se busca

export default router;