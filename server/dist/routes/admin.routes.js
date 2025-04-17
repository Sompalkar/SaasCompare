"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const admin_schema_1 = require("../schemas/admin.schema");
const isAdmin_1 = require("../middleware/isAdmin");
const router = (0, express_1.Router)();
// Admin routes (all protected by isAdmin middleware)
router.use(isAdmin_1.isAdmin);
// Tools management
router.post("/tools", (0, validateRequest_1.validateRequest)(admin_schema_1.createToolSchema), admin_controller_1.createTool);
router.patch("/tools/:id", (0, validateRequest_1.validateRequest)(admin_schema_1.updateToolSchema), admin_controller_1.updateTool);
router.delete("/tools/:id", admin_controller_1.deleteTool);
// User management
router.get("/users", admin_controller_1.getAllUsers);
router.get("/users/:id", admin_controller_1.getUserById);
router.patch("/users/:id", (0, validateRequest_1.validateRequest)(admin_schema_1.updateUserSchema), admin_controller_1.updateUser);
router.delete("/users/:id", admin_controller_1.deleteUser);
exports.default = router;
