import { NextFunction, Request, Response } from "express";
import { BadgeFields } from "../../types/schema";
import Badge from "../../models/badge";

export const createBadge = async (
  req: Request<any, any, BadgeFields>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, reason, image_url } = req.body;

    // Remove special characters from the name and generate a slug
    const sanitizedName = name.replace(/[^a-zA-Z0-9 ]/g, ""); // Remove special characters
    const slug = sanitizedName.toLowerCase().replace(/ /g, "-"); // Convert to slug

    // Check if a badge with the same slug already exists
    const badgeExists = await Badge.findOne({ slug });
    if (badgeExists) {
      res.status(400).json({
        status: "error",
        message: "A bdage with this name already exists",
      });
      return;
    }

    // Create the badge with the generated slug
    const badge = await Badge.create({
      name: sanitizedName,
      reason,
      image_url,
      slug,
    });

    res.status(201).json({
      status: "success",
      message: "Badge created successfully",
      data: { badge },
    });
  } catch (error) {
    next(error);
  }
};
