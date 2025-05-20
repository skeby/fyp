import { Router } from "express";
import { getProfile } from "../controllers/user/user.controller";
import authUser from "../middlewares/auth-user.middeware";

const userRouter = Router();

userRouter.get("/profile", authUser, getProfile);

export default userRouter;
