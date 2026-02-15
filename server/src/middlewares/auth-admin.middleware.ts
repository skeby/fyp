import { NextFunction, Request, Response } from "express";

const authAdmin = async (
  req: Request,
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

  if (!token || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({
      status: "error",
      message: "You are not authorized to access this resource.",
    });
    return;
  }

  next();
};

export default authAdmin;
