"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("../controllers/subscription.controller");
const validateRequest_1 = require("../middleware/validateRequest");
const subscription_schema_1 = require("../schemas/subscription.schema");
const router = (0, express_1.Router)();
// Protected routes
router.get("/", subscription_controller_1.getCurrentSubscription);
router.post("/checkout", (0, validateRequest_1.validateRequest)(subscription_schema_1.createCheckoutSessionSchema), subscription_controller_1.createCheckoutSession);
router.post("/cancel", subscription_controller_1.cancelSubscription);
router.patch("/", subscription_controller_1.updateSubscription);
// Webhook route (public)
router.post("/webhook", subscription_controller_1.handleWebhook);
exports.default = router;
