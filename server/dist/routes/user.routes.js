"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// Protected routes
router.get("/comparisons", user_controller_1.getUserComparisons);
router.get("/comparisons/:id", user_controller_1.getSavedComparisonById);
router.post("/comparisons", (0, validateRequest_1.validateRequest)(user_schema_1.saveComparisonSchema), user_controller_1.saveComparison);
router.delete("/comparisons/:id", user_controller_1.deleteComparison);
router.get("/reports", user_controller_1.getUserReports);
router.patch("/profile", (0, validateRequest_1.validateRequest)(user_schema_1.updateProfileSchema), user_controller_1.updateUserProfile);
exports.default = router;
