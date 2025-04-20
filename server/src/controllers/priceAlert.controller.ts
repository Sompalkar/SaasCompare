import type { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { logger } from "../utils/logger";
import { AppError } from "../utils/appError";
import * as priceMonitoringService from "../services/priceMonitoring.service";

/**
 * Subscribe to price alerts for a specific tool or all tools
 */
export const subscribeToPriceAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { toolId, threshold } = req.body;

    if (!userId) {
      return next(new AppError("Authentication required", 401));
    }

    // Update user's price alert subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        priceAlertSubscription: true,
        priceAlertThreshold: threshold ? Number(threshold) : 5 // Default to 5% if not provided
      }
    });

    // If a specific tool ID is provided, subscribe to that tool
    if (toolId) {
      // Check if the tool exists
      const tool = await prisma.saasTool.findUnique({
        where: { id: toolId }
      });

      if (!tool) {
        return next(new AppError("Tool not found", 404));
      }

      // Check if subscription already exists
      const existingSubscription = await prisma.toolSubscription.findFirst({
        where: {
          userId,
          toolId
        }
      });

      if (!existingSubscription) {
        // Create a new tool subscription
        await prisma.toolSubscription.create({
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
  } catch (error) {
    logger.error("Error subscribing to price alerts:", error);
    next(error);
  }
};

/**
 * Unsubscribe from price alerts for a specific tool or all tools
 */
export const unsubscribeFromPriceAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { toolId } = req.body;

    if (!userId) {
      return next(new AppError("Authentication required", 401));
    }

    if (toolId) {
      // Unsubscribe from a specific tool
      await prisma.toolSubscription.deleteMany({
        where: {
          userId,
          toolId
        }
      });

      return res.status(200).json({
        success: true,
        message: "Successfully unsubscribed from price alerts for the specified tool"
      });
    } else {
      // Unsubscribe from all price alerts
      await prisma.user.update({
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
  } catch (error) {
    logger.error("Error unsubscribing from price alerts:", error);
    next(error);
  }
};

/**
 * Update price alert threshold
 */
export const updatePriceAlertThreshold = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { threshold } = req.body;

    if (!userId) {
      return next(new AppError("Authentication required", 401));
    }

    if (threshold === undefined || threshold < 0) {
      return next(new AppError("Valid threshold value required", 400));
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        priceAlertThreshold: Number(threshold)
      }
    });

    return res.status(200).json({
      success: true,
      message: "Price alert threshold updated successfully"
    });
  } catch (error) {
    logger.error("Error updating price alert threshold:", error);
    next(error);
  }
};

/**
 * Get user's price alert preferences
 */
export const getPriceAlertPreferences = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("Authentication required", 401));
    }

    const user = await prisma.user.findUnique({
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
      return next(new AppError("User not found", 404));
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
  } catch (error) {
    logger.error("Error getting price alert preferences:", error);
    next(error);
  }
};

/**
 * Toggle weekly digest subscription
 */
export const toggleWeeklyDigest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { subscribe } = req.body;

    if (!userId) {
      return next(new AppError("Authentication required", 401));
    }

    if (subscribe === undefined) {
      return next(new AppError("Subscription preference required", 400));
    }

    await prisma.user.update({
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
  } catch (error) {
    logger.error("Error toggling weekly digest subscription:", error);
    next(error);
  }
};

/**
 * Get user's price change notifications
 */
export const getPriceChangeNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("Authentication required", 401));
    }

    const notifications = await prisma.notification.findMany({
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
      } catch (error) {
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
  } catch (error) {
    logger.error("Error getting price change notifications:", error);
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return next(new AppError("Authentication required", 401));
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      return next(new AppError("Notification not found", 404));
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true }
    });

    return res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    logger.error("Error marking notification as read:", error);
    next(error);
  }
};

/**
 * Manually trigger price change check (admin only)
 */
export const triggerPriceChangeCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if the user is an admin (assuming middleware has already validated this)
    await priceMonitoringService.checkPriceChanges();

    return res.status(200).json({
      success: true,
      message: "Price change check triggered successfully"
    });
  } catch (error) {
    logger.error("Error triggering price change check:", error);
    next(error);
  }
}; 