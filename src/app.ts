import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import clubRouter from "./routes/club.js";
import userRouter from "./routes/users.js";
import logger from "morgan";
import cors from "cors";

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();
const PORT = process.env.HTTP_PORT || 8080;
const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/thisbook";

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use("/club", clubRouter);
app.use("/user", userRouter);

let db = mongoose.connection;
db.on("error", () => console.log("MONGODB CONNECTION ERROR"));
db.once("open", () => console.log("MONGODB CONNECTION OPEN"));
await mongoose.connect(DB_URL);

app.listen(PORT, () => console.log(`listening on ${PORT}`));
