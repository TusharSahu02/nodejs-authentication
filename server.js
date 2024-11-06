import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectDatabase from "./config/database.js";
import authRoutes from "./routes/auth-route.js";
import { securityMiddleware } from "./middleware/rateLimiter.js";
import { AUTH_ROUTE_PREFIX } from "./utils/api_endpoints.js";
import { logger } from "./utils/logger.js";

const createServer = (app, port) => {
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
  app.use(AUTH_ROUTE_PREFIX, loginLimiter, authRoutes);

  // Start server
  const startServer = async () => {
    try {
      // Connect to database
      await connectDatabase();

      // Start server
      app.listen(port, () => {
        logger.info(
          `Server running in ${process.env.NODE_ENV.toUpperCase()} mode on port ${port}`
        );
      });
    } catch (error) {
      logger.error("Failed to connect to database:", error);
      process.exit(1);
    }
  };

  return { startServer };
};

export { createServer };
