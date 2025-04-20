"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const priceAlert_controller_1 = require("../controllers/priceAlert.controller");
const authenticate_1 = require("../middleware/authenticate");
const isAdmin_1 = require("../middleware/isAdmin");
const router = express_1.default.Router();
// All routes require authentication
router.use(authenticate_1.authenticate);
// User price alert management
router.post('/subscribe', priceAlert_controller_1.subscribeToPriceAlerts);
router.post('/unsubscribe', priceAlert_controller_1.unsubscribeFromPriceAlerts);
router.patch('/threshold', priceAlert_controller_1.updatePriceAlertThreshold);
router.get('/preferences', priceAlert_controller_1.getPriceAlertPreferences);
router.post('/weekly-digest', priceAlert_controller_1.toggleWeeklyDigest);
// Notification management
router.get('/notifications', priceAlert_controller_1.getPriceChangeNotifications);
router.patch('/notifications/:notificationId/read', priceAlert_controller_1.markNotificationAsRead);
// Admin-only routes
router.post('/trigger-check', isAdmin_1.isAdmin, priceAlert_controller_1.triggerPriceChangeCheck);
exports.default = router;
