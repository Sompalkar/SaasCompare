"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const authenticate = async (req, res, next) => {
    try {
        // Check headers for token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("No auth header or incorrect format:", authHeader);
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }
        // Extract token
        const token = authHeader.split(" ")[1];
        if (!token) {
            console.log("Token extraction failed from:", authHeader);
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid token format" });
        }
        // Get secret from environment
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not configured in environment variables");
            return res.status(500).json({ success: false, message: "Server configuration error" });
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            console.log("Token decoded successfully:", decoded);
            if (!decoded || !decoded.id) {
                console.error("Invalid token payload - missing user ID");
                return res.status(401).json({ success: false, message: "Unauthorized - Invalid token format" });
            }
            // Check if user exists and is active
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.id },
            });
            if (!user) {
                console.error(`User not found for ID: ${decoded.id}`);
                return res.status(401).json({ success: false, message: "Unauthorized - User not found" });
            }
            if (!user.isActive) {
                console.error(`User account inactive: ${decoded.id}`);
                return res.status(401).json({ success: false, message: "Unauthorized - Account inactive" });
            }
            // Set user properties including email and role
            req.user = {
                id: decoded.id,
                email: user.email,
                role: user.role || "USER", // Default to USER if role is not defined
            };
            next();
        }
        catch (error) {
            console.error("JWT verification error:", error);
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
        }
    }
    catch (error) {
        console.error("Authentication error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.authenticate = authenticate;
