import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../types";
import User from "../../models/user";
import { GetLeaderBoardFields } from "../../types/schema";

export const getProfile = async (
  req: Request<any, any, {username: string}>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const username = req.body.username
    if (!username) {
      res.status(400).json({
        status: "error",
        message: "Username is required",
      });
      return;
    }

    const user = await User.findOne({ username }).populate("badges")

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "User profile fetched successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderBoard = async (
  req: Request<any, any, GetLeaderBoardFields>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { limit = 10, page = 1 } = req.body;

  try {
    const skip = (page - 1) * limit;

    // Get total number of users for optional frontend metadata
    const total_users = await User.countDocuments();

    // Fetch sorted users with pagination
    const users = await User.find({
      status: "active",
    })
      .select("-password -badges -topics")
      .sort({ xp: -1, created_on: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate rank based on offset
    const leaderboard = users.map((user, index) => ({
      ...user,
      rank: skip + index + 1,
    }));

    res.status(200).json({
      status: "success",
      message: "Leaderboard fetched successfully",
      data: {
        leaderboard,
        page_info: {
          total_users,
          current_page: page,
          total_pages: Math.ceil(total_users / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
