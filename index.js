const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const connectDatabase = require("./config/database");
const logger = require("./utils/logger");
const authRoutes = require("./routes/auth-route.js");

const app = express();

// Middleware setup
app.use(express.json());
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
app.use("/auth", loginLimiter, authRoutes);

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
    app.listen(process.env.PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
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
