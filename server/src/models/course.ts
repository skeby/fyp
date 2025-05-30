import mongoose, { HydratedDocument, InferSchemaType } from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    cover_image: { type: String, required: false },
    topics: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        slug: { type: String, required: true },
        cover_image: { type: String, required: false },
        questions: [
          {
            question: { type: String, required: true },
            options: [
              {
                id: { type: String, required: true },
                text: { type: String, required: false },
              },
            ],
            correct_answer: { type: String, required: true },
            explanation: { type: String, required: true },
            difficulty: { type: Number, required: true },
            discrimination: { type: Number, required: true },
            guessing_probability: { type: Number, required: true },
          },
        ],
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: {
      createdAt: "created_on",
      updatedAt: "updated_on",
    },
  }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course;

// This gives you the raw type of the document (fields only)
export type CourseType = InferSchemaType<typeof courseSchema> & {
  id: string;
};

// Optional: With methods & Mongoose hydration
export type CourseDocument = HydratedDocument<CourseType>;
