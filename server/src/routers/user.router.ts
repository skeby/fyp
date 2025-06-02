import { Router } from "express";
import {
  getLeaderBoard,
  getProfile,
} from "../controllers/user/user.controller";
import authUser from "../middlewares/auth-user.middeware";
import validate from "../middlewares/validate.middleware";
import { GetLeaderBoardSchema } from "../types/schema";

const userRouter = Router();

userRouter.get("/profile", authUser, getProfile);
userRouter.post("/leaderboard", validate(GetLeaderBoardSchema), getLeaderBoard);

export default userRouter;
