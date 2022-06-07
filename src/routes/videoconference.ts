import express, { Request, Response } from "express";
import { Schema } from "mongoose";
import { VideoconferenceModel, Videoconference } from "../models/videoconference";
import { UserModel, User } from "../models/user.js";

async function getToken(req: Request, res: Response) {
    const { channelName } = req.params;
    res.status(200).send({ rtcToken: "00618672b0a455f4f21b03710e91fbb417fIACy39vgbFQwU+q48YZKEnWePhopQ3ofbhqhn3z9plCTZVygsJIAAAAAEACKRNzQmImgYgEAAQCYiaBi" });
}

let router = express.Router();

router.get("/:channelName", getToken);
export default router;