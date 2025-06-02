import { z } from "zod";

export const SignUpSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({ message: "Invalid email format" }),
  first_name: z
    .string({
      required_error: "First name is required",
      invalid_type_error: "First name must be a string",
    })
    .min(1, { message: "First name must be at least one character long" }),
  last_name: z
    .string({
      required_error: "Last name is required",
      invalid_type_error: "Last name must be a string",
    })
    .min(1, { message: "Last name must be at least one character long" }),
  username: z
    .string({
      required_error: "Username is required",
      invalid_type_error: "Username must be a string",
    })
    .min(3, { message: "Username must be at least three characters long" })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Username can only contain letters, numbers, hyphens, and underscores",
    }),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least eight characters" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});

export const LoginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email({ message: "Invalid email format " }),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(8, { message: "Password must be at least eight characters" })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
});

export const CourseSchema = z.object({
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }),
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
  }),
});

export const TopicSchema = z.object({
  course_id: z.string({
    required_error: "Course ID is required",
    invalid_type_error: "Course ID must be a string",
  }),
  title: z.string({
    required_error: "Title is required",
    invalid_type_error: "Title must be a string",
  }),
  description: z.string({
    required_error: "Description is required",
    invalid_type_error: "Description must be a string",
  }),
  questions: z.array(
    z.object({
      question: z.string({
        required_error: "Question is required",
        invalid_type_error: "Question must be a string",
      }),
      options: z.array(
        z.object({
          id: z.string({
            required_error: "Option ID is required",
            invalid_type_error: "Option ID must be a string",
          }),
          text: z.string({
            required_error: "Option text is required",
            invalid_type_error: "Option text must be a string",
          }),
        })
      ),
      correct_answer: z.string({
        required_error: "Correct answer is required",
        invalid_type_error: "Correct answer must be a string",
      }),
      explanation: z
        .string({
          invalid_type_error: "Explanation must be a string",
        })
        .optional(),
      difficulty: z.number({
        required_error: "Difficulty is required",
        invalid_type_error: "Difficulty must be a number",
      }),
      discrimination: z.number({
        required_error: "Discrimination is required",
        invalid_type_error: "Discrimination must be a number",
      }),
      guessing_probability: z.number({
        required_error: "Guessing probability is required",
        invalid_type_error: "Guessing probability must be a number",
      }),
    })
  ),
});

export const AddQuestionsSchema = z.object({
  course_id: z.string({
    required_error: "Course ID is required",
    invalid_type_error: "Course ID must be a string",
  }),
  topic_id: z.string({
    required_error: "Topic ID is required",
    invalid_type_error: "Topic ID must be a string",
  }),
  questions: z.array(
    z.object({
      question: z.string({
        required_error: "Question is required",
        invalid_type_error: "Question must be a string",
      }),
      options: z.array(
        z.object({
          id: z.string({
            required_error: "Option ID is required",
            invalid_type_error: "Option ID must be a string",
          }),
          text: z
            .string({
              invalid_type_error: "Option ID must be a string",
            })
            .optional(),
        })
      ),
      correct_answer: z.string({
        required_error: "Correct answer is required",
        invalid_type_error: "Correct answer must be a string",
      }),
      explanation: z.string({
        required_error: "Explanation is required",
        invalid_type_error: "Explanation must be a string",
      }),
      difficulty: z.number({
        required_error: "Difficulty is required",
        invalid_type_error: "Difficulty must be a number",
      }),
      discrimination: z.number({
        required_error: "Discrimination is required",
        invalid_type_error: "Discrimination must be a number",
      }),
      guessing_probability: z.number({
        required_error: "Guessing probability is required",
        invalid_type_error: "Guessing probability must be a number",
      }),
    })
  ),
});

export const GetTopicSchema = z.object({
  course_slug: z.string({
    required_error: "Course is required",
    invalid_type_error: "Course must be a string",
  }),
  topic_slug: z.string({
    required_error: "Topic is required",
    invalid_type_error: "Topic must be a string",
  }),
});

export const GetLeaderBoardSchema = z.object({
  limit: z
    .number({
      required_error: "Limit is required",
      invalid_type_error: "Limit must be a number",
    })
    .nonnegative({
      message: "Limit must be equal to or greater than 0",
    }),
  page: z
    .number({
      required_error: "Page is required",
      invalid_type_error: "Page must be a number",
    })
    .nonnegative({
      message: "Page must be equal to or greater than 0",
    }),
});

export type SignUpFields = z.infer<typeof SignUpSchema>;
export type LoginFields = z.infer<typeof LoginSchema>;
export type CourseFields = z.infer<typeof CourseSchema>;
export type TopicFields = z.infer<typeof TopicSchema>;
export type GetTopicFields = z.infer<typeof GetTopicSchema>;
export type AddQuestionsFields = z.infer<typeof AddQuestionsSchema>;
export type GetLeaderBoardFields = z.infer<typeof GetLeaderBoardSchema>;
