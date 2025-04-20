import winston from "winston"
import path from "path"

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development"
  return env === "development" ? "debug" : "warn"
}

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
}

// Add colors to winston
winston.addColors(colors)

// Define format for console logs
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
)

// Define format for file logs
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json(),
)

// Define log files
const logDir = path.join(__dirname, "../../logs")
const errorLogFile = path.join(logDir, "error.log")
const combinedLogFile = path.join(logDir, "combined.log")

// Create logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports: [
    // Write logs to console
    new winston.transports.Console({ format: consoleFormat }),

    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ filename: errorLogFile, level: "error" }),

    // Write all logs to combined.log
    new winston.transports.File({ filename: combinedLogFile }),
  ],
})

// Export logger
export default logger
