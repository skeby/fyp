import { Router } from "express";
import {
  getLeaderBoard,
  getProfile,
  getUserProfile,
} from "../controllers/user/user.controller";
import validate from "../middlewares/validate.middleware";
import { GetLeaderBoardSchema } from "../types/schema";
import authUser from "../middlewares/auth-user.middeware";

const userRouter = Router();

userRouter.post("/profile", getProfile);
userRouter.get("/profile/me", authUser, getUserProfile);
userRouter.post("/leaderboard", validate(GetLeaderBoardSchema), getLeaderBoard);

export default userRouter;
