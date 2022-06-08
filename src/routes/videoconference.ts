import express, { Request, Response } from "express";
import pkg from 'agora-access-token'; const { RtcTokenBuilder, RtcRole } = pkg;
import * as dotenv from "dotenv";

dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
const appID = process.env.APP_ID || "";
const appCertificate = process.env.APP_CERTIFICATE || "";
const role = RtcRole.PUBLISHER;
const expirationTimeInSeconds = 3600

const currentTimestamp = Math.floor(Date.now() / 1000)

const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

async function getToken(req: Request, res: Response) {
    const { channelName } = req.params;
    const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, 0, role, privilegeExpiredTs);
    res.status(200).send({ rtcToken: tokenA });
}

let router = express.Router();

router.get("/:channelName", getToken);
export default router;