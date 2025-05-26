import { Router } from "express";
import {
  createCourse,
  createTopic,
  getCourse,
  getCourses,
  getTopic,
  submitAnswer,
  startTest,
  addQuestions,
} from "../controllers/user/course.controller";
import authAdmin from "../middlewares/auth-admin.middleware";
import authUser from "../middlewares/auth-user.middeware";
import {
  AddQuestionsSchema,
  CourseSchema,
  GetTopicSchema,
  TopicSchema,
} from "../types/schema";
import validate from "../middlewares/validate.middleware";

const courseRouter = Router();

courseRouter.post("/create", authAdmin, validate(CourseSchema), createCourse);
courseRouter.post(
  "/topic/create", // /course/topic/create
  authAdmin,
  validate(TopicSchema),
  createTopic
);
courseRouter.post(
  "/topic/question",
  authAdmin,
  validate(AddQuestionsSchema),
  addQuestions
);
courseRouter.post("/", getCourse); // /course
courseRouter.get("/all", getCourses); // /course/all
courseRouter.post("/topic", authUser, getTopic); // /course/topic
courseRouter.post("/topic/start-test", authUser, startTest); // /course/topic/test
courseRouter.post("/topic/submit-answer", authUser, submitAnswer); // /course/topic/submit-answer

export default courseRouter;
