import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./src/db/index.js";

import postRoute from "./src/routes/post.routes.js";
import userRoute from "./src/routes/user.routes.js";
import commentRoute from "./src/routes/comment.routes.js";
import likeRoute from "./src/routes/like.routes.js";
<<<<<<< HEAD

import clerkWebhook from "./src/routes/clerk.webhook.routes.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
=======
import otpRoute from "./src/routes/otp.routes.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express"; //  Clerk middleware import
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c

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

<<<<<<< HEAD
// ✅ Clerk middleware for authentication
=======
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
app.use(clerkMiddleware());

// ✅ Example public route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

<<<<<<< HEAD
=======
// ✅ Protect all routes under /api/v1/* by default
//    If you want some public routes, don’t apply this here — only in specific routes
// app.use("/api/v1", ClerkExpressRequireAuth());

>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
// ✅ Routes
app.use("/api/v1", userRoute);
app.use("/api/v1", postRoute);
app.use("/api/v1", commentRoute);
app.use("/api/v1", likeRoute);
<<<<<<< HEAD

// ✅ Clerk webhook route (must be raw body)
app.use("/api/webhooks", clerkWebhook);

// 🚫 REMOVE THIS (not needed):
// app.use(requireAuth(), syncClerkUser);
=======
app.use("/api/v1", otpRoute);
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c

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
