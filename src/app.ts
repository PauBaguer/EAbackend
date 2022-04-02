import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import clubRouter from "./routes/club.js";
import userRouter from "./routes/users.js";
import bookRouter from "./routes/books.js";
import chatRouter from "./routes/chat.js";
import eventRouter from "./routes/events.js";
import authRouter from "./routes/auth.js";
import { VerifyToken } from "./middlewares/verifyToken.js";
import logger from "morgan";
import cors from "cors";

//load envs
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
dotenv.config({ path: ".env.secret" });

const app = express();
const PORT = process.env.HTTP_PORT || 8080;
let DB_URL = process.env.DB_URL || "mongodb://localhost:27017/thisbook";

if (
  process.env.NODE_ENV === "development" ||
  process.env.NODE_ENV == undefined
) {
  DB_URL = DB_URL.replace("<user>", process.env.DB_USER!);
  DB_URL = DB_URL.replace("<password>", process.env.DB_PASSWORD!);
}

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use("/club", VerifyToken, clubRouter);
app.use("/user", VerifyToken, userRouter);
app.use("/book", VerifyToken, bookRouter);
app.use("/chat", VerifyToken, chatRouter);
app.use("/event", VerifyToken, eventRouter);
app.use("/auth", authRouter);

let db = mongoose.connection;
db.on("error", () => console.log("MONGODB CONNECTION ERROR"));
db.once("open", () => console.log("MONGODB CONNECTION OPEN"));
await mongoose.connect(DB_URL);

app.listen(PORT, () => console.log(`listening on ${PORT}`)); //
