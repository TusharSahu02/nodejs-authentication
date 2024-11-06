import { logger } from "./logger.js";

const uncaughtExceptionHandler = (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
};

export { uncaughtExceptionHandler };
