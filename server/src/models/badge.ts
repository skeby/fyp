import mongoose, { HydratedDocument, InferSchemaType, Types } from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image_url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_on",
      updatedAt: "updated_on",
    },
  }
);

const Badge = mongoose.models.Badge || mongoose.model("Badge", badgeSchema);

export default Badge;

// This gives you the raw type of the document (fields only)
export type BadgeType = InferSchemaType<typeof badgeSchema> & {
  id: string;
};

// Optional: With methods & Mongoose hydration
export type BadgeDocument = HydratedDocument<BadgeType> & {};
