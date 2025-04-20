import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { StatusCodes } from "http-status-codes";

const validate = <T extends z.ZodType<any, any>>(schema: T) => {
  return (
    req: Request<any, any, z.infer<T>>,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const parsedData = schema.parse(req.body);
      req.body = { ...req.body, ...parsedData };
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors
          .map((issue) => issue.message)
          .join(", ");

        res.status(StatusCodes.BAD_REQUEST).json({
          status: "error",
          message: errorMessages,
        });

        return;
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Internal Server Error",
      });
      return;
    }
  };
};

export default validate;
