import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import clubRouter from "./routes/club.js";
import userRouter from "./routes/users.js";
import bookRouter from "./routes/books.js";
import chatRouter from "./routes/chat.js";
import eventRouter from "./routes/events.js";
import authorRouter from "./routes/author.js";
import authRouter from "./routes/auth.js";
import managementRouter from "./routes/management.js";
import commentRouter from "./routes/comment.js";
import reportRouter from "./routes/report.js";
import { VerifyToken, VeryfyAdminToken } from "./middlewares/verifyToken.js";
import logger from "morgan";
import cors from "cors";
import socket, { Server, Socket } from "socket.io";

//load envs
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });
dotenv.config({ path: ".env.secret" });

const app = express();
const PORT = process.env.HTTP_PORT || 8080;
let DB_URL = process.env.DB_URL || "mongodb://localhost:27017/thisbook";

//if (
//  process.env.NODE_ENV === "development" ||
//  process.env.NODE_ENV == undefined
//) {
DB_URL = DB_URL.replace("<user>", process.env.DB_USER!);
DB_URL = DB_URL.replace("<password>", process.env.DB_PASSWORD!);
//}

app.use(logger("dev"));
app.use(express.json());
app.use(cors());
app.use("/club", VerifyToken, clubRouter);
app.use("/user", VerifyToken, userRouter);
app.use("/book", VerifyToken, bookRouter);
app.use("/chat", VerifyToken, chatRouter);
app.use("/event", VerifyToken, eventRouter);
app.use("/author", VerifyToken, authorRouter);
app.use("/auth", authRouter);
app.use("/management", VerifyToken, managementRouter);
app.use("/comment", VerifyToken, commentRouter);
app.use("/report", VerifyToken, reportRouter);

let db = mongoose.connection;
db.on("error", () => console.log("MONGODB CONNECTION ERROR"));
db.once("open", () => console.log("MONGODB CONNECTION OPEN"));
await mongoose.connect(DB_URL);

const serv = app.listen(PORT, () => console.log(`listening on ${PORT}`)); //
const io = new Server(serv, {
  cors: {
    origin: ["http://localhost:4000"],
    methods: ["GET", "POST"],
  },
});

let openChats: String[] = [];

console.log("open socket");
io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on("test", (msg) => {
    console.log("message: " + msg);
    socket.emit("test", msg);
    console.log("emmited");
  });

  socket.on("new-chat", (msg) => {
    console.log("client joined new chat: " + msg);
    socket.join(msg);

    socket.on(msg, (chatText) => {
      console.log("received message: " + chatText);
      io.to(msg).emit("textMessage", chatText);
    });
  });

  // socket.on("new-chat", (msg) => {
  //   console.log("new-chat with id " + msg);
  //   //  if (!openChats.includes(msg)) {
  //   console.log("opened a new chat");
  //   openChats.push(msg);
  //   socket.on(msg, (chatText) => {
  //     console.log(`Send ${chatText} on ${msg}`);
  //     socket.emit(msg, chatText);
  //   });
  //   // }
  // });
});
