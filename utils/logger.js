import winston from "winston";
import config from "./config.js";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "ddd, MMM D YYYY : h:mm A",
    }),
    winston.format.colorize(),
    winston.format.printf((info) => {
      return `${info.level}: ${info.message}  ->  ${info.timestamp}`;
    })
  ),
  // transports: [
  //   new winston.transports.File({ filename: "error.log", level: "error" }),
  //   new winston.transports.File({ filename: "combined.log" }),
  // ],
});

if (config.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          return `${info.level}: \x1b[33m${info.message}\x1b[0m  ->  ${info.timestamp}`;
        })
      ),
    })
  );
}
