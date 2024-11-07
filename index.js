import express from "express";
import dotenv from "dotenv";
import { createServer } from "./server.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { uncaughtExceptionHandler } from "./utils/uncaughtExceptionHandler.js";
import { unhandledRejectionHandler } from "./utils/unhandledRejectionHandler.js";
import morgan from "morgan";
import config from "./utils/config.js";

dotenv.config();

const app = express();

// Load environment variables
const PORT = config.PORT || 5000;

// API logs middleware
app.use(morgan("dev"));

// Create server
const server = createServer(app, PORT);

// Error handling middleware
app.use(errorHandler);

// start server
server.startServer();

// Handle uncaught exceptions
process.on("uncaughtException", uncaughtExceptionHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", unhandledRejectionHandler);
