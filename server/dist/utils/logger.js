"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
// Define log format
const logFormat = winston_1.default.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
// Create logger
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), logFormat),
    defaultMeta: { service: "saas-pricing-api" },
    transports: [
        // Console transport
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat),
        }),
        // File transport for errors
        new winston_1.default.transports.File({ filename: "logs/error.log", level: "error" }),
        // File transport for all logs
        new winston_1.default.transports.File({ filename: "logs/combined.log" }),
    ],
});
// If we're not in production, log to the console with colors
if (process.env.NODE_ENV !== "production") {
    exports.logger.add(new winston_1.default.transports.Console({
        format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat),
    }));
}
