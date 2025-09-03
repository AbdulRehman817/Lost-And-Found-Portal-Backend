import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./src/db/index.js";

import postRoute from "./src/routes/post.routes.js";
import userRoute from "./src/routes/user.routes.js";
import commentRoute from "./src/routes/comment.routes.js";
import likeRoute from "./src/routes/like.routes.js";
import otpRoute from "./src/routes/otp.routes.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express"; //  Clerk middleware import

const app = express();

// ✅ CORS setup
let corsOptions = {
  origin: "http://localhost:5173", // frontend URL
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.use(clerkMiddleware());

// ✅ Example public route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// ✅ Protect all routes under /api/v1/* by default
//    If you want some public routes, don’t apply this here — only in specific routes
// app.use("/api/v1", ClerkExpressRequireAuth());

// ✅ Routes
app.use("/api/v1", userRoute);
app.use("/api/v1", postRoute);
app.use("/api/v1", commentRoute);
app.use("/api/v1", likeRoute);
app.use("/api/v1", otpRoute);

// ✅ Start DB + Server
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("❌ MONGO DB connection failed !!! ", err);
  });
