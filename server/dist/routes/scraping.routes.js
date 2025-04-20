"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scraping_controller_1 = require("../controllers/scraping.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// Protected routes
router.use(authenticate_1.authenticate);
router.post("/", scraping_controller_1.scrapeTool);
router.get("/:id", scraping_controller_1.getScrapingStatus);
exports.default = router;
