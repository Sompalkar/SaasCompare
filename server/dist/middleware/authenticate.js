"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const prisma = new client_1.PrismaClient();
const authenticate = async (req, res, next) => {
    try {
        let token;
        // Check if token exists in headers or cookies
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        else if (req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return next(new appError_1.AppError("You are not logged in. Please log in to get access.", 401));
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "");
        // Check if user still exists
        const currentUser = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!currentUser) {
            return next(new appError_1.AppError("The user belonging to this token no longer exists.", 401));
        }
        // Grant access to protected route
        req.user = currentUser;
        next();
    }
    catch (error) {
        next(new appError_1.AppError("Authentication failed. Please log in again.", 401));
    }
};
exports.authenticate = authenticate;
