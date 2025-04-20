"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const admin_schema_1 = require("../schemas/admin.schema");
const isAdmin_1 = require("../middleware/isAdmin");
const seed_data_1 = require("../utils/seed-data");
const cloud_provider_seed_1 = require("../utils/cloud-provider-seed");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
// Admin routes (all protected by isAdmin middleware)
router.use(isAdmin_1.isAdmin);
// Admin dashboard stats
router.get("/dashboard", admin_controller_1.getDashboardStats);
// Tools management
router.get("/tools", admin_controller_1.getAllTools);
router.get("/tools/:id", admin_controller_1.getToolById);
router.post("/tools", (0, validateRequest_1.validateRequest)(admin_schema_1.createToolSchema), admin_controller_1.createTool);
router.patch("/tools/:id", (0, validateRequest_1.validateRequest)(admin_schema_1.updateToolSchema), admin_controller_1.updateTool);
router.delete("/tools/:id", admin_controller_1.deleteTool);
// User management
router.get("/users", admin_controller_1.getAllUsers);
router.get("/users/:id", admin_controller_1.getUserById);
router.patch("/users/:id", (0, validateRequest_1.validateRequest)(admin_schema_1.updateUserSchema), admin_controller_1.updateUser);
router.delete("/users/:id", admin_controller_1.deleteUser);
// Seed data for SaaS tools
router.post("/seed", async (req, res) => {
    try {
        const result = await (0, seed_data_1.runSeed)();
        return res.status(result.success ? 200 : 500).json(result);
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error seeding database',
            error: String(error)
        });
    }
});
// Seed data for cloud providers
router.post("/seed-cloud", async (req, res) => {
    try {
        logger_1.logger.info("Starting cloud data seeding via API...");
        await (0, cloud_provider_seed_1.seedCloudData)();
        return res.status(200).json({
            success: true,
            message: 'Cloud data seeded successfully'
        });
    }
    catch (error) {
        logger_1.logger.error("Error seeding cloud data:", error);
        return res.status(500).json({
            success: false,
            message: 'Error seeding cloud data',
            error: String(error)
        });
    }
});
exports.default = router;
