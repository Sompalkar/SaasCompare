"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reports_controller_1 = require("../controllers/reports.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(authenticate_1.authenticate);
router.post("/generate", reports_controller_1.generateReport);
router.get("/user", reports_controller_1.getUserReports);
router.get("/:id/download", reports_controller_1.downloadReport);
router.delete("/:id", reports_controller_1.deleteReport);
exports.default = router;
