// logger.ts
import { createLogger, format, transports, Logger } from "winston";

const isProduction = process.env.NODE_ENV === "production";

const loggerTransports: Logger["transports"] = [
  new transports.Console(), // log to console
];

// Only add file transports in development (serverless environments have read-only filesystems)
if (!isProduction) {
  loggerTransports.push(
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  );
}

const logger = createLogger({
  level: "silly",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`,
    ),
  ),
  transports: loggerTransports,
});

export default logger;
