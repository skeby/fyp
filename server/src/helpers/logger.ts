// logger.js
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info", // default level
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`
    )
  ),
  transports: [
    new transports.Console(), // log to console
    new transports.File({ filename: "logs/error.log", level: "error" }), // only errors
    new transports.File({ filename: "logs/combined.log" }), // all logs
  ],
});

export default logger;
