import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";

// const session = require("express-session");
import connectDatabase from "./config/database.js";
import authRoutes from "./routes/auth-route.js";
import { logger } from "./utils/logger.js";
import { securityMiddleware } from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize security middleware
const { loginLimiter } = securityMiddleware(app);

// Routes
app.use("/api/v1/auth", loginLimiter, authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server function
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start server
    app.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV.toUpperCase()} mode on port ${PORT}`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Initialize server
startServer();

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  logger.error("Unhandled Rejection:", error);
  process.exit(1);
});
