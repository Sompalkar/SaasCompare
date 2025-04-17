"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const reports_schema_1 = require("../schemas/reports.schema");
const router = (0, express_1.Router)();
// Protected routes
router.post("/generate", (0, validateRequest_1.validateRequest)(reports_schema_1.generateReportSchema), reports_controller_1.generateReport);
router.get("/", reports_controller_1.getReports);
router.get("/:id", reports_controller_1.getReportById);
router.get("/:id/download", reports_controller_1.downloadReport);
exports.default = router;
