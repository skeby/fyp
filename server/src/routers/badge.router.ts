import { Router } from "express";
import { BadgeSchema, LoginSchema } from "../types/schema";
import { login, signUp } from "../controllers/user/auth.controller";
import validate from "../middlewares/validate.middleware";
import authAdmin from "../middlewares/auth-admin.middleware";
import { createBadge } from "../controllers/user/badge.controller";

const badgeRouter = Router();

badgeRouter.post("/create", authAdmin, validate(BadgeSchema), createBadge);

export default badgeRouter;
