import jwt, {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from "jsonwebtoken";
import { NextFunction, Response } from "express";
import User, { UserDocument, UserType } from "../models/user";
import { AuthenticatedRequest } from "../types";

const authUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = (req.headers.authorization ||
    req.headers.Authorization) as string;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "error",
      message: "You are not logged in.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({
      status: "error",
      message: "You are not logged in.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? "") as UserType;
    const user: UserDocument | null = await User.findOne({ _id: decoded.id });

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found.",
      });
      return;
    } else {
      // User is found

      // User account is inactive
      if (user.status === "inactive") {
        res.status(401).json({
          status: "error",
          message:
            "Access denied. Please contact support at akinsanyaadeyinka4166@gmail.com",
        });
        return;
      }
    }

    req.user = user;

    next();
  } catch (error: unknown) {
    console.error("JWT verification error:", error);
    if (error instanceof TokenExpiredError) {
      res.status(401).json({ message: "Token expired, please log in again" });
      return;
    }

    if (error instanceof JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    if (error instanceof NotBeforeError) {
      res.status(401).json({ message: "Token not active yet" });
      return;
    }

    res.status(401).json({ message: "Token verification failed" });
  }
};

export default authUser;
