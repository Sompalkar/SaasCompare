"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWeeklyDigests = exports.checkPriceChanges = void 0;
const prisma_1 = require("../utils/prisma");
const logger_1 = require("../utils/logger");
const email_service_1 = require("./email.service");
/**
 * Check for price changes across all tools
 */
const checkPriceChanges = async () => {
    try {
        logger_1.logger.info('Starting price change detection process');
        // Get the latest pricing history records
        const latestPricingData = await getLatestPricingData();
        // Get the previous pricing history records
        const previousPricingData = await getPreviousPricingData();
        // Find price changes by comparing latest with previous
        const priceChanges = detectPriceChanges(latestPricingData, previousPricingData);
        if (priceChanges.length > 0) {
            logger_1.logger.info(`Detected ${priceChanges.length} price changes`);
            // Log and store price changes
            await recordPriceChanges(priceChanges);
            // Notify users who have subscribed to price change alerts
            await notifyUsersOfPriceChanges(priceChanges);
        }
        else {
            logger_1.logger.info('No price changes detected');
        }
    }
    catch (error) {
        logger_1.logger.error('Error checking for price changes:', error);
    }
};
exports.checkPriceChanges = checkPriceChanges;
/**
 * Get the latest pricing data for all tools
 */
const getLatestPricingData = async () => {
    return prisma_1.prisma.pricingHistory.findMany({
        where: {
            isLatest: true
        },
        include: {
            tool: {
                select: {
                    name: true
                }
            }
        }
    });
};
/**
 * Get the previous pricing data (before the latest) for all tools
 */
const getPreviousPricingData = async () => {
    // Get pricing history entries that are not marked as latest
    // but are the most recent ones before the latest entries
    const previousEntries = await prisma_1.prisma.$queryRaw `
    WITH LatestEntries AS (
      SELECT toolId, tier, plan, MAX(timestamp) as maxTime
      FROM PricingHistory
      WHERE isLatest = false
      GROUP BY toolId, tier, plan
    )
    SELECT p.*
    FROM PricingHistory p
    JOIN LatestEntries le
      ON p.toolId = le.toolId
      AND p.tier = le.tier
      AND p.plan = le.plan
      AND p.timestamp = le.maxTime
  `;
    return previousEntries;
};
/**
 * Detect price changes by comparing latest and previous pricing data
 */
const detectPriceChanges = (latestPricing, previousPricing) => {
    const priceChanges = [];
    // Create a map of previous pricing data for easy lookup
    const previousPricingMap = new Map();
    previousPricing.forEach(entry => {
        const key = `${entry.toolId}-${entry.tier}-${entry.plan}`;
        previousPricingMap.set(key, entry);
    });
    // Compare latest pricing against previous pricing
    latestPricing.forEach(latest => {
        const key = `${latest.toolId}-${latest.tier}-${latest.plan}`;
        const previous = previousPricingMap.get(key);
        // Skip if we don't have previous data for comparison
        if (!previous)
            return;
        // Skip if price hasn't changed
        if (latest.price === previous.price)
            return;
        // Calculate percentage change
        const changePercentage = ((latest.price - previous.price) / previous.price) * 100;
        priceChanges.push({
            toolId: latest.toolId,
            toolName: latest.tool.name,
            planName: latest.tier,
            tier: latest.tier,
            billingType: latest.plan, // monthly or annually
            oldPrice: previous.price,
            newPrice: latest.price,
            changePercentage,
            changeDate: latest.timestamp
        });
    });
    return priceChanges;
};
/**
 * Record price changes in the database
 */
const recordPriceChanges = async (priceChanges) => {
    try {
        // Insert the price changes into a PriceChangeLog table
        await prisma_1.prisma.priceChangeLog.createMany({
            data: priceChanges.map(change => ({
                toolId: change.toolId,
                tier: change.tier,
                plan: change.billingType,
                oldPrice: change.oldPrice,
                newPrice: change.newPrice,
                changePercentage: change.changePercentage,
                timestamp: new Date()
            }))
        });
        logger_1.logger.info(`Recorded ${priceChanges.length} price changes in the database`);
    }
    catch (error) {
        logger_1.logger.error('Error recording price changes:', error);
        throw error;
    }
};
/**
 * Notify users who have subscribed to price change alerts
 */
const notifyUsersOfPriceChanges = async (priceChanges) => {
    try {
        // Get all users who have subscribed to price alerts
        const subscribedUsers = await prisma_1.prisma.user.findMany({
            where: {
                priceAlertSubscription: true,
                emailVerified: true
            },
            select: {
                id: true,
                email: true,
                priceAlertThreshold: true,
                toolSubscriptions: {
                    select: {
                        toolId: true
                    }
                }
            }
        });
        logger_1.logger.info(`Found ${subscribedUsers.length} users subscribed to price alerts`);
        // Process notifications for each user
        for (const user of subscribedUsers) {
            await processUserNotifications(user, priceChanges);
        }
    }
    catch (error) {
        logger_1.logger.error('Error notifying users of price changes:', error);
        throw error;
    }
};
/**
 * Process price change notifications for a single user
 */
const processUserNotifications = async (user, priceChanges) => {
    try {
        // Filter changes to only include tools the user is subscribed to, or all tools if no specific subscriptions
        const relevantChanges = user.toolSubscriptions.length > 0
            ? priceChanges.filter(change => user.toolSubscriptions.some((sub) => sub.toolId === change.toolId))
            : priceChanges;
        // Filter changes that exceed the user's alert threshold
        const threshold = user.priceAlertThreshold || 5; // Default to 5% if not set
        const significantChanges = relevantChanges.filter(change => Math.abs(change.changePercentage) >= threshold);
        if (significantChanges.length === 0) {
            logger_1.logger.info(`No significant price changes for user ${user.id}`);
            return;
        }
        logger_1.logger.info(`Sending ${significantChanges.length} price change notifications to user ${user.id}`);
        // Send individual notifications for each significant change
        for (const change of significantChanges) {
            await (0, email_service_1.sendPriceChangeNotification)(user.email, {
                toolName: change.toolName,
                oldPrice: change.oldPrice,
                newPrice: change.newPrice,
                planName: `${change.planName} (${change.billingType})`,
                changePercentage: change.changePercentage,
                changeDate: change.changeDate
            });
            // Record that we sent a notification
            await prisma_1.prisma.notification.create({
                data: {
                    userId: user.id,
                    type: 'PRICE_CHANGE',
                    content: JSON.stringify(change),
                    read: false,
                    createdAt: new Date()
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error(`Error processing notifications for user ${user.id}:`, error);
    }
};
/**
 * Send weekly price change digest emails to users
 */
const sendWeeklyDigests = async () => {
    try {
        logger_1.logger.info('Starting weekly price change digest process');
        // Get price changes from the last week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyChanges = await prisma_1.prisma.priceChangeLog.findMany({
            where: {
                timestamp: {
                    gte: oneWeekAgo
                }
            },
            include: {
                tool: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            }
        });
        if (weeklyChanges.length === 0) {
            logger_1.logger.info('No price changes in the last week to include in digest');
            return;
        }
        // Get all users who have subscribed to weekly digests
        const subscribedUsers = await prisma_1.prisma.user.findMany({
            where: {
                weeklyDigestSubscription: true,
                emailVerified: true
            },
            select: {
                id: true,
                email: true,
                toolSubscriptions: {
                    select: {
                        toolId: true
                    }
                }
            }
        });
        logger_1.logger.info(`Found ${subscribedUsers.length} users subscribed to weekly digests`);
        // Process digests for each user
        for (const user of subscribedUsers) {
            // Filter changes to only include tools the user is subscribed to, or all tools if no specific subscriptions
            const relevantChanges = user.toolSubscriptions.length > 0
                ? weeklyChanges.filter(change => user.toolSubscriptions.some((sub) => sub.toolId === change.toolId))
                : weeklyChanges;
            if (relevantChanges.length === 0) {
                logger_1.logger.info(`No relevant price changes for user ${user.id} in weekly digest`);
                continue;
            }
            // Format changes for the email
            const formattedChanges = relevantChanges.map(change => ({
                toolName: change.tool.name,
                oldPrice: change.oldPrice,
                newPrice: change.newPrice,
                planName: `${change.tier} (${change.plan})`,
                changePercentage: change.changePercentage,
                changeDate: change.timestamp
            }));
            // Send the digest email
            await (0, email_service_1.sendWeeklyPriceChangeDigest)(user.email, formattedChanges);
            logger_1.logger.info(`Sent weekly digest to user ${user.id} with ${formattedChanges.length} price changes`);
        }
    }
    catch (error) {
        logger_1.logger.error('Error sending weekly price change digests:', error);
    }
};
exports.sendWeeklyDigests = sendWeeklyDigests;
