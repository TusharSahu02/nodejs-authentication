import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import config from "../utils/config.js";
const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(config.MONGODB_URI, {
      autoIndex: true, // Build indexes
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
      family: 4, // Use IPv4, skip trying IPv6
    });

    logger.info(`MongoDB Connected: ${connection.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });

    return connection;
  } catch (error) {
    logger.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDatabase;
