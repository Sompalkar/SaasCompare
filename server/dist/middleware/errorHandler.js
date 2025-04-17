"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    // Log the error
    logger_1.logger.error(`${err.name}: ${err.message}`, { stack: err.stack });
    // Handle specific error types
    if (err.name === "CastError") {
        const message = `Invalid ${err.path}: ${err.value}`;
        error = new appError_1.AppError(message, 400);
    }
    // Handle validation errors
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        error = new appError_1.AppError(message, 400);
    }
    // Handle duplicate key errors
    if (err.code === 11000) {
        const message = `Duplicate field value entered`;
        error = new appError_1.AppError(message, 400);
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid token. Please log in again.";
        error = new appError_1.AppError(message, 401);
    }
    if (err.name === "TokenExpiredError") {
        const message = "Your token has expired. Please log in again.";
        error = new appError_1.AppError(message, 401);
    }
    // Send error response
    if (error instanceof appError_1.AppError) {
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
    }
    else {
        // For unknown errors
        console.error("ERROR 💥", err);
        res.status(500).json({
            status: "error",
            message: "Something went wrong",
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
    }
};
exports.errorHandler = errorHandler;
