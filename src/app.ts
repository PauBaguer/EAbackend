import express from "express";
import mongoose from "mongoose";
import clubRouter from "./routes/club.js";
import userRouter from "./routes/users.js";
import logger from "morgan";
import cors from "cors";
import { production, development, envConf } from "./config/env.js";

console.log(`Running ${process.env.NODE_ENV} configuration`);

let envSettings: envConf;
if (process.env.NODE_ENV === "production") {
  envSettings = production;
} else {
  envSettings = development;
}

const app = express();
const PORT = envSettings.port || 8080;

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use("/club", clubRouter);
app.use("/user", userRouter);

let db = mongoose.connection;
db.on("error", () => console.log("MONGODB CONNECTION ERROR"));
db.once("open", () => console.log("MONGODB CONNECTION OPEN"));
await mongoose.connect(envSettings.dbUrl || "mongodb://localhost:27017/test");

app.listen(PORT, () => console.log(`listening on ${PORT}`));
