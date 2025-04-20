"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getCurrentUser = exports.logout = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Generate JWT token
const generateToken = (id, email, role) => {
    const secret = process.env.JWT_SECRET || '';
    if (!secret) {
        console.error("JWT_SECRET is not configured!");
        throw new Error("Server configuration error");
    }
    const payload = { id, email, role };
    try {
        // @ts-ignore - Ignoring type errors for jwt.sign
        const token = jsonwebtoken_1.default.sign(payload, secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || "30d"
        });
        return token;
    }
    catch (error) {
        console.error("Error generating token:", error);
        throw new Error("Failed to generate authentication token");
    }
};
// Register a new user
const register = async (req, res) => {
    try {
        const { name, email, password, company, jobTitle } = req.body;
        // Validate input
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
            email: zod_1.z.string().email("Invalid email format"),
            password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
            company: zod_1.z.string().optional(),
            jobTitle: zod_1.z.string().optional(),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists",
            });
        }
        // Hash password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                company,
                jobTitle,
            },
        });
        // Generate token with more user data
        const token = generateToken(user.id, user.email, user.role || "USER");
        return res.status(201).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
                token,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to register user",
        });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate input
        const schema = zod_1.z.object({
            email: zod_1.z.string().email("Invalid email format"),
            password: zod_1.z.string().min(1, "Password is required"),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
        }
        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Check if password matches
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is inactive",
            });
        }
        // Generate token with more user data
        const token = generateToken(user.id, user.email, user.role || "USER");
        return res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                plan: user.plan,
                token,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to login",
        });
    }
};
exports.login = login;
// Logout user
const logout = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};
exports.logout = logout;
// Get current user
const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                company: true,
                jobTitle: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error("Get current user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get user information",
        });
    }
};
exports.getCurrentUser = getCurrentUser;
// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, company, jobTitle } = req.body;
        // Validate input
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
            company: zod_1.z.string().optional(),
            jobTitle: zod_1.z.string().optional(),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
        }
        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name !== undefined ? name : undefined,
                company: company !== undefined ? company : undefined,
                jobTitle: jobTitle !== undefined ? jobTitle : undefined,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                plan: true,
                company: true,
                jobTitle: true,
            },
        });
        return res.status(200).json({
            success: true,
            data: updatedUser,
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
        });
    }
};
exports.updateProfile = updateProfile;
