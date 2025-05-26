import { NextFunction, Request, Response } from "express";
import Course, { CourseDocument } from "../../models/course";
import {
  AddQuestionsFields,
  CourseFields,
  TopicFields,
} from "../../types/schema";
import { AuthenticatedRequest } from "../../types";
import { MODEL_BASE_URL } from "../../static";

export const createCourse = async (
  req: Request<any, any, CourseFields>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description } = req.body;

    // Remove special characters from the title and generate a slug
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, ""); // Remove special characters
    const slug = sanitizedTitle.toLowerCase().replace(/ /g, "-"); // Convert to slug

    // Check if a course with the same slug already exists
    const courseExists = await Course.findOne({ slug });
    if (courseExists) {
      res.status(400).json({
        status: "error",
        message: "A course with this title already exists",
      });
      return;
    }

    // Create the course with the generated slug
    const course = await Course.create({
      title: sanitizedTitle,
      description,
      slug,
    });

    res.status(201).json({
      status: "success",
      message: "Course created successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (
  req: Request<any, any, TopicFields>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { course_id, title, description, questions } = req.body;

    // Find the course by ID and ensure it's active
    const course = await Course.findOne({ _id: course_id, status: "active" });

    if (!course) {
      res.status(404).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    // Remove special characters from the title and generate a slug
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, ""); // Remove special characters
    const slug = sanitizedTitle.toLowerCase().replace(/ /g, "-"); // Convert to slug

    // Check if a topic with the same slug already exists
    const topicExists = course.topics.some((topic: any) => topic.slug === slug);
    if (topicExists) {
      res.status(400).json({
        status: "error",
        message: "A topic with this title already exists in the course",
      });
      return;
    }

    // Add the new topic to the course's topics array
    course.topics.push({
      title: sanitizedTitle,
      description,
      slug,
      questions,
    });

    // Save the updated course
    await course.save();

    res.status(201).json({
      status: "success",
      message: "Topic created successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const addQuestions = async (
  req: Request<any, any, AddQuestionsFields>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { course_id, topic_id, questions } = req.body;

    // Find the course by ID and ensure it's active
    const course = await Course.findOne({ _id: course_id, status: "active" });

    if (!course) {
      res.status(404).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    const topic = course.topics.find((t: any) => t.id === topic_id);
    if (!topic) {
      res.status(400).json({
        status: "error",
        message: "Topic not found in the course",
      });
      return;
    }

    // Add the questions to the topic

    // Save the updated course
    await course.save();

    res.status(201).json({
      status: "success",
      message: "Questions added successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const getCourses = async (
  req: Request<any, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courses: CourseDocument[] | null = await Course.find({
      status: "active",
    });

    // TODO: Find a way to use .select to remove the questions from the topics

    if (!courses) {
      res.status(401).json({
        status: "error",
        message: "Courses not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Courses fetched successfully",
      data: { courses },
    });
  } catch (error) {
    next(error);
  }
};

export const getCourse = async (
  req: Request<any, any, { slug: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.body;

    if (!slug) {
      res.status(400).json({
        status: "error",
        message: "Course slug is required",
      });
      return;
    }

    const course: CourseDocument | null = await Course.findOne({
      slug,
      status: "active",
    });

    // TODO: Find a way to use .select to remove the questions from the topics

    if (!course) {
      res.status(401).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Course fetched successfully",
      data: { course },
    });
  } catch (error) {
    next(error);
  }
};

export const getTopic = async (
  req: Request<any, any, { course_slug: string; topic_slug: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { course_slug, topic_slug } = req.body;

    if (!course_slug || !topic_slug) {
      res.status(400).json({
        status: "error",
        message: "Course slug and topic slug are required",
      });
      return;
    }

    const course: CourseDocument | null = await Course.findOne({
      slug: course_slug,
      status: "active",
    });

    if (!course) {
      res.status(401).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    const topic = course?.topics.find((t) => t.slug === topic_slug);

    if (!topic) {
      res.status(401).json({
        status: "error",
        message: "Topic not found",
      });
      return;
    }

    // TODO: Find a way to find only the topic needed instead of fetching all

    res.status(200).json({
      status: "success",
      message: "Topic fetched successfully",
      data: {
        topic: course?.topics.find((t) => t.slug === topic_slug) ?? null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const startTest = async (
  req: AuthenticatedRequest<
    any,
    any,
    { course_slug: string; topic_slug: string }
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { course_slug, topic_slug } = req.body;

    if (!course_slug || !topic_slug) {
      res.status(400).json({
        status: "error",
        message: "Course slug and topic slug are required",
      });
      return;
    }

    const course: CourseDocument | null = await Course.findOne({
      slug: course_slug,
      status: "active",
    });

    if (!course) {
      res.status(401).json({
        status: "error",
        message: "Course not found",
      });
      return;
    }

    const topic = course?.topics.find((t) => t.slug === topic_slug);

    if (!topic) {
      res.status(404).json({
        status: "error",
        message: "Topic not found",
      });
      return;
    }

    if (topic.questions.length === 0) {
      res.status(400).json({
        status: "error",
        message: "Provided topic has no questions",
      });
    }

    if (!MODEL_BASE_URL) {
      res.status(400).json({
        status: "error",
        message: "Adaptive testing model not available",
      });
    }
    try {
      const modelResponse = await fetch(MODEL_BASE_URL.concat("/start_test"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": req.user?.id,
        },
        body: JSON.stringify(
          topic.questions.map((q) => ({
            "Question ID": q.id,
            "Question Text": q.question,
            "Option A": q.options?.[0]?.text ?? "",
            "Option B": q.options?.[1]?.text ?? "",
            "Option C": q.options?.[2]?.text ?? "",
            "Option D": q.options?.[3]?.text ?? "",
            "Correct Answer": q.correct_answer,
            Explanation: q.explanation,
            Difficulty: 1.0,
            Discrimination: 1.0,
            "Guessing Probability": 0.25,
          }))
        ),
      });

      console.log("modelResponse", modelResponse);

      if (!modelResponse.ok) {
        res.status(400).json({
          status: "error",
          message: "An error occured while generating question",
        });
        return;
      }

      const modelQuestion: { id: string; test_id: string } | undefined =
        await modelResponse.json();

      if (modelQuestion) {
        res.status(200).json({
          status: "success",
          message: "Question generated successfully",
          data: {
            question: topic.questions.find((q) => q.id === modelQuestion?.id),
            test_id: modelQuestion?.test_id,
          },
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "An error occured while generating question",
        });
      }
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: "An error occured while generating question",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (
  req: AuthenticatedRequest<any, any, { test_id: string; answer: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { test_id, answer } = req.body;

    if (!test_id || !answer) {
      res.status(400).json({
        status: "error",
        message: "Test ID and answer are required",
      });
      return;
    }

    if (!MODEL_BASE_URL) {
      res.status(400).json({
        status: "error",
        message: "Adaptive testing model not available",
      });
    }
    try {
      const modelResponse = await fetch(MODEL_BASE_URL.concat("/start_test"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": req.user?.id,
          "X-Test-ID": test_id,
        },
        body: JSON.stringify({ answer }),
      });

      if (!modelResponse.ok) {
        res.status(400).json({
          status: "error",
          message: "An error occured while generating question",
        });
        return;
      }

      const modelJSON:
        | {
            test_id: string;
            submitted_answer: string;
            correct_answer: string;
            was_correct: boolean;
            explanation: string; // TODO: Add this to model
            current_theta: number;
            target_difficulty?: number;
            next_question: {
              id: string; // TODO: Add this to model
              question: string;
              options: { A: string; B: string; C: string; D: string };
            };
            result: {
              administered: string[];
              correct_ids: string[];
              wrong_ids: string[];
            };
          }
        | undefined = await modelResponse.json();

      if (modelJSON) {
        // const responseData = modelJSON?.message ?
        res.status(200).json({
          status: "success",
          message: "Answer submitted successfully",
          data: modelJSON,
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "An error occured while submitting answer",
        });
      }
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: "An error occured while submitting answer",
      });
    }
  } catch (error) {
    next(error);
  }
};
