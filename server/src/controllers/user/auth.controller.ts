import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, { UserDocument } from "../../models/user";
import { SignUpFields, LoginFields } from "../../types/schema";

export const signUp = async (
  req: Request<any, any, SignUpFields>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, first_name, last_name, username, password } = req.body;
    const existingUser: UserDocument | null = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      res.status(400).json({
        status: "error",
        message: "User with this email or username exists",
      });

      return;
    } else {
      try {
        const user: UserDocument = await User.create({
          email,
          first_name,
          last_name,
          username,
          password,
        });

        const userData = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          username: user.username,
        };

        res.status(201).json({
          status: "success",
          message: "Account successfully created.",
          data: {
            user: userData,
          },
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message:
            "Unable to create account at the moment, please try again later.",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<null, null, LoginFields>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user: UserDocument | null = await User.findOne({
      email,
    })

    if (!user) {
      res.status(400).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(400).json({
        status: "error",
        message: "Invalid credentials",
      });
      return;
    }

    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      xp: user.xp,
    };
    const token = jwt.sign(userData, process.env.JWT_SECRET ?? "", {
      expiresIn: "14d",
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};
