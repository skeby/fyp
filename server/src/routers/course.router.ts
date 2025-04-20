import { Router } from "express";
import {
  createCourse,
  createTopic,
  getCourse,
  getTopic,
} from "../controllers/user/course.controller";
import authAdmin from "../middlewares/auth-admin.middleware";
import authUser from "../middlewares/auth-user.middeware";
import { CourseSchema, TopicSchema } from "../types/schema";
import validate from "../middlewares/validate.middleware";

const courseRouter = Router();

courseRouter.post("/", getCourse);
courseRouter.post("/topic", authUser, getTopic);
courseRouter.post("/create", authAdmin, validate(CourseSchema), createCourse);
courseRouter.post(
  "/topic/create",
  authAdmin,
  validate(TopicSchema),
  createTopic
);

export default courseRouter;
