import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./src/db/index.js";
import postRoute from "./src/routes/post.routes.js";
import userRoute from "./src/routes/user.routes.js";
import commentRoute from "./src/routes/comment.routes.js";
import likeRoute from "./src/routes/like.routes.js";
import connectionRoutes from "./src/routes/connection.routes.js";
import clerkWebhook from "./src/routes/clerk.webhook.routes.js";
import chatRoute from "./src/routes/chat.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { createServer } from "http";
import { Server } from "socket.io";
import { User } from "./src/models/user.models.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

global.io = io; // ✅ use in controller

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return;

  // ✅ Mark user online
  await User.findByIdAndUpdate(userId, { isOnline: true });
  io.emit("user-status", { userId, isOnline: true });

  socket.join(userId.toString());

  socket.on("disconnect", async () => {
    await User.findByIdAndUpdate(userId, { isOnline: false });
    io.emit("user-status", { userId, isOnline: false });
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Backend!");
});

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(clerkMiddleware());

app.use("/api/v1", userRoute);
app.use("/api/v1", postRoute);
app.use("/api/v1", commentRoute);
app.use("/api/v1", likeRoute);
app.use("/api/v1", connectionRoutes);
app.use("/api/v1/chat", chatRoute);
app.use((req, res, next) => {});

// ✅ Clerk webhook route (must be raw body)
app.use("/api/webhooks", clerkWebhook);

connectDB().then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
  });
});
