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
const app = express();
let corsOptions = {
  origin: "https://localhost:3000",
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
app.use("/api/v1", likeRoute);
app.use("/api/v1", otpRoute);
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });
