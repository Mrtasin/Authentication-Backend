import jwt from "jsonwebtoken";
import { Auth } from "../models/auth.models.js";

export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(404).json({
        message: "Authentication failed",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Auth.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "Authentication failed",
        success: false,
      });
    }

    req.user = user;
  } catch (err) {
    console.log("Internel Error :- ", err);
    res.status(401).json({
      message: "Internel Server Error",
      success: false,
      error: err,
    });
  }
  next();
};
