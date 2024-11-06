import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !bcrypt.compare(password, user.password)) {
      await handleFailedLogin(user);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.accountLocked) {
      return res.status(423).json({
        message:
          "Account locked. Please reset your password or contact support.",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await user.save();

    // Set secure cookie with refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Remove refresh token from user
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { refreshTokens: { token: refreshToken } } }
    );

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// const requestPasswordReset = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(200).json({
//         message: "If an account exists, you will receive a reset email.",
//       });
//     }

//     const resetToken = crypto.randomBytes(32).toString("hex");
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.passwordResetToken = hashedToken;
//     user.passwordResetExpires = Date.now() + 3600000; // 1 hour
//     await user.save();

//     await sendResetEmail(user.email, resetToken);

//     res.status(200).json({
//       message: "If an account exists, you will receive a reset email.",
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Password reset request failed" });
//   }
// };

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user and check if refresh token exists
    const user = await User.findOne({
      _id: decoded.userId,
      "refreshTokens.token": refreshToken,
      "refreshTokens.expiresAt": { $gt: new Date() },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Update refresh token
    await User.updateOne(
      { _id: user._id, "refreshTokens.token": refreshToken },
      {
        $set: {
          "refreshTokens.$.token": tokens.refreshToken,
          "refreshTokens.$.expiresAt": new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ),
        },
      }
    );

    // Set new refresh token cookie
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

const handleOAuthSuccess = async (req, res) => {
  try {
    const { accessToken, refreshToken } = generateTokens(req.user._id);

    // Store refresh token
    await User.updateOne(
      { _id: req.user._id },
      {
        $push: {
          refreshTokens: {
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }
    );

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with access token
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-success?token=${accessToken}`
    );
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

export {
  register,
  login,
  logout,
  // requestPasswordReset,
  refreshAccessToken,
  handleOAuthSuccess,
};
