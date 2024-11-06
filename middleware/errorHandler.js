import { logger } from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
};

export { errorHandler };
