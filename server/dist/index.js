"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const scheduler_service_1 = require("./services/scheduler.service");
const logger_1 = require("./utils/logger");
const seed_data_1 = require("./utils/seed-data");
const client_1 = require("@prisma/client");
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
const prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
app.use(express_1.default.json());
// Routes
app.use("/api", routes_1.default);
// Error handling middleware
app.use(errorHandler_1.errorHandler);
// Start scheduler for automated tasks
if (process.env.NODE_ENV !== 'test') {
    (0, scheduler_service_1.startScheduler)();
    logger_1.logger.info("Price change monitoring scheduler started");
}
// Start server
app.listen(port, async () => {
    logger_1.logger.info(`Server running on port ${port}`);
    // Check if database is empty before seeding
    try {
        const toolCount = await prisma.saasTool.count();
        if (toolCount === 0) {
            logger_1.logger.info("Database empty. Running initial seeding...");
            await (0, seed_data_1.seedTools)();
        }
        else {
            logger_1.logger.info(`Database already has ${toolCount} tools. Skipping seed.`);
        }
    }
    catch (error) {
        logger_1.logger.error("Error checking database state:", error);
    }
    finally {
        await prisma.$disconnect();
    }
});
exports.default = app;
