import "module-alias/register";

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { dbConnect } from "./config/mongo.config";
import authRouter from "./routers/auth.router";
import courseRouter from "./routers/course.router";
import userRouter from "./routers/user.router";
// import crypto from "crypto";
import logger from "./helpers/logger";

dotenv.config();
dbConnect("adaptlearn");
const app = express();

app.use(express.json());
app.use(cors());
// Middleware to log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get("/", (_, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the backend service of AdaptLearn",
  });
});

app.use("/auth", authRouter);
app.use("/course", courseRouter);
app.use("/user", userRouter);

const startServer = async () => {
  const port = process.env.PORT;
  try {
    app.listen(port, () => {
      console.log(`Server running on port ${port || 2000}`);
      // console.log(crypto.randomBytes(32).toString("hex")); // Random bytes for secrets
    });
    // Authenticate mongodb
  } catch (err) {
    console.error("Error launching server", err);
  }
};

startServer();
