"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerPriceChangeCheck = exports.markNotificationAsRead = exports.getPriceChangeNotifications = exports.toggleWeeklyDigest = exports.getPriceAlertPreferences = exports.updatePriceAlertThreshold = exports.unsubscribeFromPriceAlerts = exports.subscribeToPriceAlerts = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const appError_1 = require("../utils/appError");
const priceMonitoringService = __importStar(require("../services/priceMonitoring.service"));
/**
 * Subscribe to price alerts for a specific tool or all tools
 */
const subscribeToPriceAlerts = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { toolId, threshold } = req.body;
        if (!userId) {
            return next(new appError_1.AppError("Authentication required", 401));
        }
        // Update user's price alert subscription status
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                priceAlertSubscription: true,
                priceAlertThreshold: threshold ? Number(threshold) : 5 // Default to 5% if not provided
            }
        });
        // If a specific tool ID is provided, subscribe to that tool
        if (toolId) {
            // Check if the tool exists
            const tool = await prisma_1.prisma.saasTool.findUnique({
                where: { id: toolId }
            });
            if (!tool) {
                return next(new appError_1.AppError("Tool not found", 404));
            }
            // Check if subscription already exists
            const existingSubscription = await prisma_1.prisma.toolSubscription.findFirst({
                where: {
                    userId,
                    toolId
                }
            });
            if (!existingSubscription) {
                // Create a new tool subscription
                await prisma_1.prisma.toolSubscription.create({
                    data: {
                        userId,
                        toolId
                    }
                });
            }
        }
        return res.status(200).json({
            success: true,
            message: toolId
                ? "Successfully subscribed to price alerts for the specified tool"
                : "Successfully subscribed to price alerts for all tools"
        });
    }
    catch (error) {
        logger_1.logger.error("Error subscribing to price alerts:", error);
        next(error);
    }
};
exports.subscribeToPriceAlerts = subscribeToPriceAlerts;
/**
 * Unsubscribe from price alerts for a specific tool or all tools
 */
const unsubscribeFromPriceAlerts = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { toolId } = req.body;
        if (!userId) {
            return next(new appError_1.AppError("Authentication required", 401));
        }
        if (toolId) {
            // Unsubscribe from a specific tool
            await prisma_1.prisma.toolSubscription.deleteMany({
                where: {
                    userId,
                    toolId
                }
            });
            return res.status(200).json({
                success: true,
                message: "Successfully unsubscribed from price alerts for the specified tool"
            });
        }
        else {
            // Unsubscribe from all price alerts
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: {
                    priceAlertSubscription: false
                }
            });
            // Optionally, keep or delete all tool subscriptions
            // Here we keep them in case the user resubscribes
            return res.status(200).json({
                success: true,
                message: "Successfully unsubscribed from all price alerts"
            });
        }
    }
    catch (error) {
        logger_1.logger.error("Error unsubscribing from price alerts:", error);
        next(error);
    }
};
exports.unsubscribeFromPriceAlerts = unsubscribeFromPriceAlerts;
/**
 * Update price alert threshold
 */
const updatePriceAlertThreshold = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { threshold } = req.body;
        if (!userId) {
            return next(new appError_1.AppError("Authentication required", 401));
        }
        if (threshold === undefined || threshold < 0) {
            return next(new appError_1.AppError("Valid threshold value required", 400));
        }
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                priceAlertThreshold: Number(threshold)
            }
        });
        return res.status(200).json({
            success: true,
            message: "Price alert threshold updated successfully"
        });
    }
    catch (error) {
        logger_1.logger.error("Error updating price alert threshold:", error);
        next(error);
    }
};
exports.updatePriceAlertThreshold = updatePriceAlertThreshold;
/**
 * Get user's price alert preferences
 */
const getPriceAlertPreferences = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new appError_1.AppError("Authentication required", 401));
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                priceAlertSubscription: true,
                priceAlertThreshold: true,
                weeklyDigestSubscription: true,
                toolSubscriptions: {
                    select: {
                        toolId: true,
                        tool: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                category: true
                            }
                        }
                    }
                }
            }
        });
        if (!user) {
            return next(new appError_1.AppError("User not found", 404));
        }
        return res.status(200).json({
            success: true,
            data: {
                priceAlertSubscription: user.priceAlertSubscription,
                priceAlertThreshold: user.priceAlertThreshold,
                weeklyDigestSubscription: user.weeklyDigestSubscription,
                subscribedTools: user.toolSubscriptions.map(sub => sub.tool)
            }
        });
    }
    catch (error) {
        logger_1.logger.error("Error getting price alert preferences:", error);
        next(error);
    }
};
exports.getPriceAlertPreferences = getPriceAlertPreferences;
/**
 * Toggle weekly digest subscription
 */
const toggleWeeklyDigest = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { subscribe } = req.body;
        if (!userId) {
            return next(new appError_1.AppError("Authentication required", 401));
        }
        if (subscribe === undefined) {
            return next(new appError_1.AppError("Subscription preference required", 400));
        }
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                weeklyDigestSubscription: Boolean(subscribe)
            }
        });
        return res.status(200).json({
            success: true,
            message: subscribe
                ? "Successfully subscribed to weekly digest"
                : "Successfully unsubscribed from weekly digest"
        });
    }
    catch (error) {
        logger_1.logger.error("Error toggling weekly digest subscription:", error);
        next(error);
    }
};
exports.toggleWeeklyDigest = toggleWeeklyDigest;
/**
 * Get user's price change notifications
 */
const getPriceChangeNotifications = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(new appError_1.AppError("Authentication required", 401));
        }
        const notifications = await prisma_1.prisma.notification.findMany({
            where: {
                userId,
                type: 'PRICE_CHANGE'
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20 // Limit to most recent 20 notifications
        });
        // Parse the content field to get structured data
        const formattedNotifications = notifications.map(notification => {
            try {
                const content = JSON.parse(notification.content);
                return {
                    id: notification.id,
                    toolName: content.toolName,
                    planName: content.planName,
                    oldPrice: content.oldPrice,
                    newPrice: content.newPrice,
                    changePercentage: content.changePercentage,
                    changeDate: content.changeDate,
                    read: notification.read,
                    createdAt: notification.createdAt
                };
            }
            catch (error) {
                return {
                    id: notification.id,
                    content: notification.content,
                    read: notification.read,
                    createdAt: notification.createdAt
                };
            }
        });
        return res.status(200).json({
            success: true,
            data: formattedNotifications
        });
    }
    catch (error) {
        logger_1.logger.error("Error getting price change notifications:", error);
        next(error);
    }
};
exports.getPriceChangeNotifications = getPriceChangeNotifications;
/**
 * Mark notification as read
 */
const markNotificationAsRead = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { notificationId } = req.params;
        if (!userId) {
            return next(new appError_1.AppError("Authentication required", 401));
        }
        const notification = await prisma_1.prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId
            }
        });
        if (!notification) {
            return next(new appError_1.AppError("Notification not found", 404));
        }
        await prisma_1.prisma.notification.update({
            where: { id: notificationId },
            data: { read: true }
        });
        return res.status(200).json({
            success: true,
            message: "Notification marked as read"
        });
    }
    catch (error) {
        logger_1.logger.error("Error marking notification as read:", error);
        next(error);
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
/**
 * Manually trigger price change check (admin only)
 */
const triggerPriceChangeCheck = async (req, res, next) => {
    try {
        // Check if the user is an admin (assuming middleware has already validated this)
        await priceMonitoringService.checkPriceChanges();
        return res.status(200).json({
            success: true,
            message: "Price change check triggered successfully"
        });
    }
    catch (error) {
        logger_1.logger.error("Error triggering price change check:", error);
        next(error);
    }
};
exports.triggerPriceChangeCheck = triggerPriceChangeCheck;
