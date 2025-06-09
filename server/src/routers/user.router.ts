import { Router } from "express";
import {
  getLeaderBoard,
  getProfile,
} from "../controllers/user/user.controller";
import validate from "../middlewares/validate.middleware";
import { GetLeaderBoardSchema } from "../types/schema";

const userRouter = Router();

userRouter.post("/profile", getProfile);
userRouter.post("/leaderboard", validate(GetLeaderBoardSchema), getLeaderBoard);

export default userRouter;
