import { mailSender } from "../libs/mailSender.js";
import { Auth } from "../models/auth.models.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are requried",
      success: false,
    });
  }

  try {
    if (await Auth.findOne({ email })) {
      return res.status(400).json({
        message: "User Already Registerd",
        success: false,
      });
    }

    const newUser = await Auth.create({
      name,
      email,
      password,
    });

    if (!newUser) {
      return res.status(400).json({
        message: "User not Registerd",
        success: false,
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    newUser.verificationToken = token;

    await newUser.save();

    // send Email

    const options = {
      email: newUser.email,
      token: token,
      subject: "Verification",
      route: "verify",
    };

    await mailSender(options);

    return res.status(201).json({
      message: "User Register Successfully",
      success: true,
    });
  } catch (err) {
    console.log("Internel Error :- ", err);

    res.status(401).json({
      message: "Internel Error",
      success: false,
      error: err,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are requried",
      success: false,
    });
  }

  try {
    const user = await Auth.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email and password",
        success: false,
      });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("token", jwtToken, cookieOptions);

    res.status(200).json({
      message: "Login Successfully",
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.log("Internel Error :- ", err);
    res.status(401).json({
      message: "Internel Error",
      success: false,
      error: err,
    });
  }
};

const verify = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(404).json({
      message: "Token not found",
      success: false,
    });
  }

  try {
    const user = await Auth.findOne({
      verificationToken: token,
    });

    if (!user) {
      return res.status(404).json({
        message: "Token not found",
        success: false,
      });
    }

    user.verificationToken = undefined;
    user.isVerified = true;

    await user.save();

    return res.status(200).json({
      message: "User Verification Succeesfully",
      success: true,
    });
  } catch (err) {
    console.log("Internel Error :- ", err);
    res.status(401).json({
      message: "Internel Error",
      success: false,
      error: err,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        message: "User not loggedin",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Get Profile Successfully",
      success: true,
      user: user,
    });
  } catch (err) {
    console.log("Internel Error :- ", err);
    res.status(401).json({
      message: "Internel Error",
      success: false,
      error: err,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "");

    res.status(200).json({
      message: "User Logout Successfully",
      success: true,
    });
  } catch (err) {
    console.log("Internel Error :- ", err);
    res.status(401).json({
      message: "Internel Error",
      success: false,
      error: err,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is Requried",
        success: false,
      });
    }

    const user = await Auth.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Invalid User Email",
        success: false,
      });
    }

    console.log(user);

    const token = crypto.randomBytes(32).toString("hex");

    if (!token) {
      return res.status(400).json({
        message: "Internal Error",
        success: false,
      });
    }

    user.resetPasswordToken = token;

    user.passwordExpried = Date.now() + 10 * 60 * 1000;

    await user.save();

    const options = {
      email: user.email,
      token: token,
      subject: "Forgot Password",
      route: "reset-password",
    };

    await mailSender(options);

    return res.status(200).json({
      message: "Forgot Password Successfully",
      success: true,
    });
  } catch (err) {
    console.log("Internel Error :- ", err);
    res.status(401).json({
      message: "Internel Error",
      success: false,
      error: err,
    });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword, conformPassword } = req.body;

  if (
    !oldPassword ||
    !newPassword ||
    !conformPassword ||
    newPassword !== conformPassword
  ) {
    return res.status(400).json({
      message: "All fields are requried",
      success: false,
    });
  }

  try {   

    

    const user = await Auth.findOne({ email: req.user.email });

    if (!user) {
      return res.status(500).json({
        message: "Internal Server Error",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Old Password",
        success: false,
      });
    }

    user.password = newPassword;

    await user.save();

    return res.status(200).json({
      message: "Password Change Successfully",
      success: true,
      newPassword: newPassword,
    });
  } catch (err) {
    console.log("Internel Error :- ", err);
    res.status(401).json({
      message: "Internel Error",
      success: false,
      error: err,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).json({
        message: "Invalid Request",
        success: false,
      });
    }

    const user = await Auth.findOne({ resetPasswordToken: token });

    if (!user) {
      return res.status(400).json({
        message: "Invalid Request",
        success: false,
      });
    }

    if (user.passwordExpried < Date.now()) {
      return res.status(400).json({
        message: "Time Exprie",
        success: false,
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password Field requried",
        success: false,
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.passwordExpried = new Date(0);

    await user.save();

    return res.status(200).json({
      message: "Password forget successfully",
      success: true,
      password: password,
    });
  } catch (err) {
    console.log("Internel Error :- ", err);
    res.status(401).json({
      message: "Internel Error",
      success: false,
      error: err,
    });
  }
};

export {
  registerUser,
  loginUser,
  verify,
  getMe,
  logoutUser,
  resetPassword,
  changePassword,
  forgotPassword,
};
