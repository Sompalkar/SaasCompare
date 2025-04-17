"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const compare_controller_1 = require("../controllers/compare.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const compare_schema_1 = require("../schemas/compare.schema");
const router = (0, express_1.Router)();
// Public routes
router.post("/", (0, validateRequest_1.validateRequest)(compare_schema_1.compareToolsSchema), compare_controller_1.compareTools);
router.get("/:id", compare_controller_1.getComparisonById);
exports.default = router;
