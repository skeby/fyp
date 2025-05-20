import { Router } from "express";
import {
  createCourse,
  createTopic,
  getCourse,
  getCourses,
  getTopic,
  takeTest,
} from "../controllers/user/course.controller";
import authAdmin from "../middlewares/auth-admin.middleware";
import authUser from "../middlewares/auth-user.middeware";
import { CourseSchema, GetTopicSchema, TopicSchema } from "../types/schema";
import validate from "../middlewares/validate.middleware";

const courseRouter = Router();

courseRouter.post("/create", authAdmin, validate(CourseSchema), createCourse);
courseRouter.post(
  "/topic/create",
  authAdmin,
  validate(TopicSchema),
  createTopic
);
courseRouter.post("/", getCourse);
courseRouter.get("/courses", getCourses);
courseRouter.post("/topic", authUser, validate(GetTopicSchema), getTopic);
courseRouter.post("/topic/test", authUser, validate(GetTopicSchema), takeTest);

export default courseRouter;
