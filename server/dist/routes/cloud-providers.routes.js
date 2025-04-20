"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloud_providers_controller_1 = require("../controllers/cloud-providers.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// Public routes
router.get("/", cloud_providers_controller_1.getAllCloudProviders);
router.get("/:id", cloud_providers_controller_1.getCloudProviderById);
router.post("/compare", cloud_providers_controller_1.compareCloudProviders);
router.get("/comparison/:id", cloud_providers_controller_1.getComparisonById);
// Protected routes
router.use(authenticate_1.authenticate);
router.get("/comparisons/all", cloud_providers_controller_1.getAllComparisons);
router.put("/comparison/:id/name", cloud_providers_controller_1.updateComparisonName);
router.delete("/comparison/:id", cloud_providers_controller_1.deleteComparison);
exports.default = router;
