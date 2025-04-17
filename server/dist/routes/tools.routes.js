"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tools_controller_1 = require("../controllers/tools.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const tools_schema_1 = require("../schemas/tools.schema");
const router = (0, express_1.Router)();
// Public routes
router.get("/", tools_controller_1.getAllTools);
router.get("/category/:category", tools_controller_1.getToolsByCategory);
router.get("/search", (0, validateRequest_1.validateRequest)(tools_schema_1.searchToolsSchema), tools_controller_1.searchTools);
router.get("/:id", tools_controller_1.getToolById);
exports.default = router;
