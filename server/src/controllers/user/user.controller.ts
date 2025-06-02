import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../../types";
import User from "../../models/user";
import { GetLeaderBoardFields } from "../../types/schema";

export const getProfile = async (
  req: AuthenticatedRequest<any, any>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "You are not logged in",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      message: "User profile fetched successfully",
      data: {
        user: req.user,
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
      .select("-password")
      .sort({ xp: -1 })
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
