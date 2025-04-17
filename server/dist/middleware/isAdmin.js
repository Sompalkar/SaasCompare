"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const appError_1 = require("../utils/appError");
const isAdmin = (req, res, next) => {
    // Check if user exists and is an admin
    if (!req.user || req.user.role !== "ADMIN") {
        return next(new appError_1.AppError("You do not have permission to perform this action", 403));
    }
    next();
};
exports.isAdmin = isAdmin;
