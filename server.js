import fs from "fs";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectDatabase from "./config/database.js";
import authRoutes from "./routes/auth-route.js";
import { securityMiddleware } from "./middleware/rateLimiter.js";
import { AUTH_ROUTE_PREFIX } from "./utils/api_endpoints.js";
import { logger } from "./utils/logger.js";
import config from "./utils/config.js";
import passport from "passport";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "./utils/swagger.json" assert { type: "json" };

const createServer = (app, port) => {
  // Middleware setup
  app.use(
    cors({
      origin: config.ALLOWED_ORIGINS,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Initialize security middleware
  const { loginLimiter } = securityMiddleware(app);

  // Routes
  app.use(AUTH_ROUTE_PREFIX, loginLimiter, authRoutes);

  app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

  // Start server
  const startServer = async () => {
    try {
      // Connect to database
      await connectDatabase();

      // Start server
      app.listen(port, () => {
        logger.info(
          `Server running in ${config.NODE_ENV.toUpperCase()} mode on port ${port}`
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
