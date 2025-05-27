import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  verify,
} from "../controllers/auth.controllers.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/register", registerUser);

authRoutes.post("/verify/:token", verify);

authRoutes.post("/login", loginUser);

authRoutes.get("/profile", isLoggedIn, getMe);

authRoutes.get("/logout", isLoggedIn, logoutUser);

authRoutes.post("/forgot-password", forgotPassword);

authRoutes.post("/reset-password/:token", resetPassword);

authRoutes.post("/change-password", isLoggedIn, changePassword);

export default authRoutes;
