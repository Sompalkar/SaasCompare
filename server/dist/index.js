"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = require("express-rate-limit");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const routes_1 = __importDefault(require("./routes"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Apply middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
}));
app.use(express_1.default.json()); // Parse JSON bodies
app.use(express_1.default.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET)); // Parse cookies
app.use((0, morgan_1.default)("dev")); // HTTP request logger
// Apply rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});
// API routes
app.use("/api", routes_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Start the server
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger_1.logger.error("Unhandled Rejection:", err);
    // Close server & exit process
    process.exit(1);
});
