"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const tools_routes_1 = __importDefault(require("./tools.routes"));
const compare_routes_1 = __importDefault(require("./compare.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const subscription_routes_1 = __importDefault(require("./subscription.routes"));
const reports_routes_1 = __importDefault(require("./reports.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const scraping_routes_1 = __importDefault(require("./scraping.routes"));
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
// Public routes
router.use("/auth", auth_routes_1.default);
router.use("/tools", tools_routes_1.default);
router.use("/compare", compare_routes_1.default);
// Protected routes
router.use("/user", authenticate_1.authenticate, user_routes_1.default);
router.use("/subscription", authenticate_1.authenticate, subscription_routes_1.default);
router.use("/reports", authenticate_1.authenticate, reports_routes_1.default);
// Admin routes
router.use("/admin", authenticate_1.authenticate, admin_routes_1.default);
router.use("/scraping", authenticate_1.authenticate, scraping_routes_1.default);
exports.default = router;
