"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scraping_controller_1 = require("../controllers/scraping.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const scraping_schema_1 = require("../schemas/scraping.schema");
const isAdmin_1 = require("../middleware/isAdmin");
const router = (0, express_1.Router)();
// Admin routes (all protected by isAdmin middleware)
router.use(isAdmin_1.isAdmin);
router.post("/jobs", (0, validateRequest_1.validateRequest)(scraping_schema_1.createScrapingJobSchema), scraping_controller_1.createScrapingJob);
router.get("/jobs", scraping_controller_1.getAllScrapingJobs);
router.get("/jobs/:id", scraping_controller_1.getScrapingJobStatus);
exports.default = router;
