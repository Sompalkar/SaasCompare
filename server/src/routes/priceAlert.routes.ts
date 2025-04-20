import express from 'express';
import {
  subscribeToPriceAlerts,
  unsubscribeFromPriceAlerts,
  updatePriceAlertThreshold,
  getPriceAlertPreferences,
  toggleWeeklyDigest,
  getPriceChangeNotifications,
  markNotificationAsRead,
  triggerPriceChangeCheck
} from '../controllers/priceAlert.controller';
import { authenticate } from '../middleware/authenticate';
import { isAdmin } from '../middleware/isAdmin';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User price alert management
router.post('/subscribe', subscribeToPriceAlerts);
router.post('/unsubscribe', unsubscribeFromPriceAlerts);
router.patch('/threshold', updatePriceAlertThreshold);
router.get('/preferences', getPriceAlertPreferences);
router.post('/weekly-digest', toggleWeeklyDigest);

// Notification management
router.get('/notifications', getPriceChangeNotifications);
router.patch('/notifications/:notificationId/read', markNotificationAsRead);

// Admin-only routes
router.post('/trigger-check', isAdmin, triggerPriceChangeCheck);

export default router; 