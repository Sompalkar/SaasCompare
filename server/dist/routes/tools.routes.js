"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tools_controller_1 = require("../controllers/tools.controller");
const authenticate_1 = require("../middleware/authenticate");
const isAdmin_1 = require("../middleware/isAdmin");
const validateRequest_1 = require("../middleware/validateRequest");
const admin_schema_1 = require("../schemas/admin.schema");
const router = (0, express_1.Router)();
// Public routes
router.get("/", tools_controller_1.getAllTools);
router.get("/search", tools_controller_1.searchTools);
router.get("/featured", tools_controller_1.getFeaturedTools);
router.get("/popular", tools_controller_1.getPopularTools);
router.get("/historical", tools_controller_1.getToolHistoricalData);
router.get("/categories", tools_controller_1.getToolCategories);
router.get("/category/:category", tools_controller_1.getToolsByCategory);
// Tool specific routes - these need to be after other routes to avoid conflict with :id
router.get("/:id", tools_controller_1.getToolById);
router.get("/:id/alternatives", tools_controller_1.getToolAlternatives);
router.get("/:id/integrations", tools_controller_1.getToolIntegrations);
router.get("/:id/history", tools_controller_1.getToolPricingHistory);
// Protected routes
router.post("/track", authenticate_1.authenticate, tools_controller_1.trackTool);
router.get("/user/tracked", authenticate_1.authenticate, tools_controller_1.getUserTrackedTools);
router.delete("/track/:id", authenticate_1.authenticate, tools_controller_1.untrackTool);
// Admin routes
router.post("/", isAdmin_1.isAdmin, (0, validateRequest_1.validateRequest)(admin_schema_1.createToolSchema), tools_controller_1.createTool);
router.patch("/:id", isAdmin_1.isAdmin, (0, validateRequest_1.validateRequest)(admin_schema_1.updateToolSchema), tools_controller_1.updateTool);
router.delete("/:id", isAdmin_1.isAdmin, tools_controller_1.deleteTool);
exports.default = router;
