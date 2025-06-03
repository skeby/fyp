import mongoose, { HydratedDocument, InferSchemaType, Types } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Badge",
      },
    ],
    topics: {
      type: Map,
      of: {
        administered: [{ type: String, required: true }],
        correct_responses: [{ type: String, required: true }],
        wrong_responses: [{ type: String, required: true }],
        current_index: { type: Number, default: 0 },
        questions: [
          {
            "Question ID": String,
            "Question Text": String,
            "Option A": String,
            "Option B": String,
            "Option C": String,
            "Option D": String,
            "Correct Answer": String,
            Explanation: String,
            Difficulty: Number,
            Discrimination: Number,
            "Guessing Probability": Number,
            index: Number,
          },
        ],
        response_history: [Number],
        theta: { type: Number, default: 0 },
      },
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: "created_on",
      updatedAt: "updated_on",
    },
  }
);

// 🔐 Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;

export type UserType = InferSchemaType<typeof userSchema> & {
  id: string;
};

export type UserDocument = HydratedDocument<UserType> & {};
