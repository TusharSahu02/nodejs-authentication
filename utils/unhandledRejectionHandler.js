import { logger } from "./logger.js";

const unhandledRejectionHandler = (error) => {
  logger.error("Unhandled Rejection:", error);
  process.exit(1);
};

export { unhandledRejectionHandler };
