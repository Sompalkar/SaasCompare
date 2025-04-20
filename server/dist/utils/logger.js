"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || "development";
    return env === "development" ? "debug" : "warn";
};
// Define colors for each level
const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "blue",
};
// Add colors to winston
winston_1.default.addColors(colors);
// Define format for console logs
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define format for file logs
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.json());
// Define log files
const logDir = path_1.default.join(__dirname, "../../logs");
const errorLogFile = path_1.default.join(logDir, "error.log");
const combinedLogFile = path_1.default.join(logDir, "combined.log");
// Create logger
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format: fileFormat,
    transports: [
        // Write logs to console
        new winston_1.default.transports.Console({ format: consoleFormat }),
        // Write all logs with level 'error' and below to error.log
        new winston_1.default.transports.File({ filename: errorLogFile, level: "error" }),
        // Write all logs to combined.log
        new winston_1.default.transports.File({ filename: combinedLogFile }),
    ],
});
// Export logger
exports.default = exports.logger;
