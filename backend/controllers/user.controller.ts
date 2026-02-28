import { User, type IUser } from "../models/userModel.js";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";
import type { Request, Response } from "express";
import { loginUserSchema } from "../schemas/userSchema.js";

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const result = loginUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  const { email, password } = result.data;

  const existingUser = await User.findOne({ email }).select("+password");

  if (!existingUser) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  createToken(res, existingUser._id.toString());

  res.status(200).json({
    message: "Login successful",
    user: {
      id: existingUser._id,
      email: existingUser.email,
      role: existingUser.role,
    },
  });
});

const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const users = await User.find({}).select("-password");
    res.status(200).json({ data:users });
  }
);

const deleteUserById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== "ADMIN") {
      res.status(403);
      throw new Error("Not authorized to delete users");
    }

    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (user.role === "ADMIN") {
      res.status(400);
      throw new Error("Cannot delete admin users");
    }

    await User.deleteOne({ _id: user._id });

    res.status(200).json({ message: "User deleted successfully" });
  }
);

export { loginUser, logoutUser, getAllUsers, deleteUserById};