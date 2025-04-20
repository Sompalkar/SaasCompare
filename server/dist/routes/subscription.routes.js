"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const authenticate_1 = require("../middleware/authenticate");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
// Webhook route - needs raw body
router.post("/webhook", express_2.default.raw({ type: "application/json" }), subscription_controller_1.handleStripeWebhook);
// Public routes
router.get("/plans", subscription_controller_1.getPlans);
// Protected routes
router.use(authenticate_1.authenticate);
router.get("/", subscription_controller_1.getUserSubscription);
router.post("/checkout", subscription_controller_1.createCheckoutSession);
router.post("/portal", subscription_controller_1.createPortalSession);
router.post("/cancel", subscription_controller_1.cancelSubscription);
router.post("/resume", subscription_controller_1.resumeSubscription);
router.get("/:id", subscription_controller_1.getSubscriptionDetails);
exports.default = router;
