import { NextFunction, Request, Response } from "express";
import Course, { CourseDocument } from "../../models/course";
import { CourseFields, TopicFields } from "../../types/schema";

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
