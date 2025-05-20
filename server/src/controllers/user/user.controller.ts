import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../types";

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
