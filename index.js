import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./src/db/index.js";
import postRoute from "./src/routes/post.routes.js";
import { clerkMiddleware } from "@clerk/express";
import userRoute from "./src/routes/user.routes.js";
import commentRoute from "./src/routes/comment.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();
let corsOptions = {
  origin: "https://e-commerce-website-react-js-gules.vercel.app",
  optionSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1", userRoute);
app.use("/api/v1", postRoute);
app.use("/api/v1", commentRoute);
app.use(clerkMiddleware());
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });
