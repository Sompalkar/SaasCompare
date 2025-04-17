"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.refreshToken = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Generate JWT token
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
};
// Set token cookie
const sendTokenCookie = (res, token) => {
    const cookieOptions = {
        expires: new Date(Date.now() + Number.parseInt(process.env.JWT_COOKIE_EXPIRES_IN || "7") * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };
    res.cookie("token", token, cookieOptions);
};
// Register a new user
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return next(new appError_1.AppError("User with this email already exists", 400));
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                plan: client_1.UserPlan.FREE,
            },
        });
        // Generate token
        const token = generateToken(newUser.id);
        // Send token as cookie
        sendTokenCookie(res, token);
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json({
            status: "success",
            token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        logger_1.logger.error("Registration error:", error);
        next(error);
    }
};
exports.register = register;
// Login user
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        // Check if user exists and password is correct
        if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
            return next(new appError_1.AppError("Invalid email or password", 401));
        }
        // Generate token
        const token = generateToken(user.id);
        // Send token as cookie
        sendTokenCookie(res, token);
        // Return user data (without password)
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            status: "success",
            token,
            user: userWithoutPassword,
        });
    }
    catch (error) {
        logger_1.logger.error("Login error:", error);
        next(error);
    }
};
exports.login = login;
// Logout user
const logout = (req, res) => {
    res.cookie("token", "loggedout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: "success" });
};
exports.logout = logout;
// Get current user
const getCurrentUser = async (req, res, next) => {
    try {
        // User is already attached to req by the authenticate middleware
        const user = req.user;
        res.status(200).json({
            status: "success",
            user,
        });
    }
    catch (error) {
        logger_1.logger.error("Get current user error:", error);
        next(error);
    }
};
exports.getCurrentUser = getCurrentUser;
// Refresh token
const refreshToken = async (req, res, next) => {
    try {
        // Get token from cookie
        const token = req.cookies.token;
        if (!token) {
            return next(new appError_1.AppError("Not authenticated", 401));
        }
        // Verify token
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (err) {
            return next(new appError_1.AppError("Invalid or expired token", 401));
        }
        // Check if user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            return next(new appError_1.AppError("User no longer exists", 401));
        }
        // Generate new token
        const newToken = generateToken(user.id);
        // Send new token as cookie
        sendTokenCookie(res, newToken);
        res.status(200).json({
            status: "success",
            token: newToken,
        });
    }
    catch (error) {
        logger_1.logger.error("Refresh token error:", error);
        next(error);
    }
};
exports.refreshToken = refreshToken;
// Forgot password
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return next(new appError_1.AppError("No user found with that email address", 404));
        }
        // In a real application, you would:
        // 1. Generate a reset token
        // 2. Save it to the database with an expiry
        // 3. Send an email with a reset link
        // For this demo, we'll just acknowledge the request
        res.status(200).json({
            status: "success",
            message: "Password reset instructions sent to email",
        });
    }
    catch (error) {
        logger_1.logger.error("Forgot password error:", error);
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        // In a real application, you would:
        // 1. Verify the reset token
        // 2. Check if it's expired
        // 3. Update the user's password
        // For this demo, we'll just acknowledge the request
        res.status(200).json({
            status: "success",
            message: "Password has been reset successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Reset password error:", error);
        next(error);
    }
};
exports.resetPassword = resetPassword;
