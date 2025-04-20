import { Router } from "express";
import { LoginSchema, SignUpSchema } from "../types/schema";
import { login, signUp } from "../controllers/user/auth.controller";
import validate from "../middlewares/validate.middleware";

const authRouter = Router();

authRouter.post("/signup", validate(SignUpSchema), signUp);
authRouter.post("/login", validate(LoginSchema), login);

export default authRouter;
