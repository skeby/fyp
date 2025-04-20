import mongoose, { HydratedDocument, InferSchemaType, Types } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      // select: false, // hides password from query results by default
      trim: true,
    },
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

// 🔐 Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password wasn't changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Optional method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

// This gives you the raw type of the document (fields only)
export type UserType = InferSchemaType<typeof userSchema> & {
  id: string;
};

// Optional: With methods & Mongoose hydration
export type UserDocument = HydratedDocument<UserType> & {
  comparePassword: (password: string) => Promise<boolean>;
};
