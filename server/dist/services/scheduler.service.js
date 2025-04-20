"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduler = exports.scheduleScrapingJobs = exports.scheduleToolDataUpdates = exports.scheduleWeeklyDigestEmails = exports.scheduleDailyPriceCheck = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../utils/logger");
const priceMonitoring_service_1 = require("./priceMonitoring.service");
const client_1 = require("@prisma/client");
const scraping_service_1 = require("./scraping.service");
const prisma = new client_1.PrismaClient();
/**
 * Schedule the price change detection job to run daily
 */
const scheduleDailyPriceCheck = () => {
    // Run every day at 2:00 AM
    node_cron_1.default.schedule('0 2 * * *', async () => {
        logger_1.logger.info('Running scheduled price change detection');
        try {
            await (0, priceMonitoring_service_1.checkPriceChanges)();
            logger_1.logger.info('Scheduled price change detection completed');
        }
        catch (error) {
            logger_1.logger.error('Error in scheduled price change detection:', error);
        }
    }, {
        scheduled: true,
        timezone: 'UTC' // Adjust timezone as needed
    });
    logger_1.logger.info('Daily price check job scheduled');
};
exports.scheduleDailyPriceCheck = scheduleDailyPriceCheck;
/**
 * Schedule the weekly digest email job to run every Monday
 */
const scheduleWeeklyDigestEmails = () => {
    // Run every Monday at 7:00 AM
    node_cron_1.default.schedule('0 7 * * 1', async () => {
        logger_1.logger.info('Sending weekly price change digest emails');
        try {
            await (0, priceMonitoring_service_1.sendWeeklyDigests)();
            logger_1.logger.info('Weekly digest emails sent successfully');
        }
        catch (error) {
            logger_1.logger.error('Error sending weekly digest emails:', error);
        }
    }, {
        scheduled: true,
        timezone: 'UTC' // Adjust timezone as needed
    });
    logger_1.logger.info('Weekly digest email job scheduled');
};
exports.scheduleWeeklyDigestEmails = scheduleWeeklyDigestEmails;
/**
 * Schedule the tool data update job to run weekly
 */
const scheduleToolDataUpdates = () => {
    // Run every Sunday at 1:00 AM
    node_cron_1.default.schedule('0 1 * * 0', async () => {
        logger_1.logger.info('Starting weekly tool data update job');
        try {
            await updateToolData();
            logger_1.logger.info('Weekly tool data update completed');
        }
        catch (error) {
            logger_1.logger.error('Error updating tool data:', error);
        }
    }, {
        scheduled: true,
        timezone: 'UTC' // Adjust timezone as needed
    });
    logger_1.logger.info('Weekly tool data update job scheduled');
};
exports.scheduleToolDataUpdates = scheduleToolDataUpdates;
/**
 * Process scheduled scraping jobs
 */
const scheduleScrapingJobs = () => {
    // Run every 4 hours
    node_cron_1.default.schedule('0 */4 * * *', async () => {
        logger_1.logger.info('Processing scheduled scraping jobs');
        try {
            await processScheduledScrapingJobs();
            logger_1.logger.info('Scheduled scraping jobs processed');
        }
        catch (error) {
            logger_1.logger.error('Error processing scheduled scraping jobs:', error);
        }
    }, {
        scheduled: true,
        timezone: 'UTC'
    });
    logger_1.logger.info('Scraping job processor scheduled');
};
exports.scheduleScrapingJobs = scheduleScrapingJobs;
/**
 * Update tool data from their websites
 */
async function updateToolData() {
    try {
        // Get all tools that have websites
        const tools = await prisma.saasTool.findMany({
            where: {
                website: {
                    not: ''
                }
            },
            select: {
                id: 'true',
                name: true,
                website: true,
                updatedAt: true
            }
        });
        logger_1.logger.info(`Found ${tools.length} tools to check for updates`);
        // Process each tool - limit concurrency to avoid overwhelming resources
        for (const tool of tools) {
            try {
                // Create a scraping job for the tool
                await prisma.scrapingJob.create({
                    data: {
                        url: tool.website,
                        toolId: tool.id,
                        type: 'PRICING',
                        status: 'PENDING',
                        schedule: 'WEEKLY',
                        createdBy: 'SYSTEM'
                    }
                });
                logger_1.logger.info(`Created weekly update job for ${tool.name}`);
            }
            catch (error) {
                logger_1.logger.error(`Error creating scraping job for ${tool.name}:`, error);
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Error in updateToolData:', error);
        throw error;
    }
}
/**
 * Process all pending scheduled scraping jobs
 */
async function processScheduledScrapingJobs() {
    try {
        // Get all pending scraping jobs
        const pendingJobs = await prisma.scrapingJob.findMany({
            where: {
                status: 'PENDING',
                schedule: {
                    not: 'ONCE' // Only get recurring jobs
                }
            },
            take: 10 // Process in batches to avoid overloading
        });
        logger_1.logger.info(`Processing ${pendingJobs.length} pending scraping jobs`);
        // Process each job
        for (const job of pendingJobs) {
            try {
                // Update job status to processing
                await prisma.scrapingJob.update({
                    where: { id: job.id },
                    data: {
                        status: 'PROCESSING',
                        startedAt: new Date()
                    }
                });
                // Perform scraping
                const scrapingResult = await (0, scraping_service_1.scrapePricingPage)(job.url);
                // Update the tool with the new data
                if (job.toolId) {
                    await prisma.saasTool.update({
                        where: { id: job.toolId },
                        data: {
                            description: scrapingResult.description || undefined,
                            // Update other fields as needed
                            updatedAt: new Date()
                        }
                    });
                    // Store pricing information in pricing history
                    if (scrapingResult.pricingPlans && scrapingResult.pricingPlans.length > 0) {
                        // First, mark all existing pricing history for this tool as not latest
                        await prisma.pricingHistory.updateMany({
                            where: {
                                toolId: job.toolId,
                                isLatest: true
                            },
                            data: {
                                isLatest: false
                            }
                        });
                        // Then add new pricing records
                        for (const plan of scrapingResult.pricingPlans) {
                            if (plan.price !== null) {
                                await prisma.pricingHistory.create({
                                    data: {
                                        toolId: job.toolId,
                                        tier: plan.name,
                                        plan: 'monthly', // Adjust as needed based on your data
                                        price: plan.price,
                                        isLatest: true,
                                        timestamp: new Date()
                                    }
                                });
                            }
                        }
                    }
                }
                // Mark job as completed
                await prisma.scrapingJob.update({
                    where: { id: job.id },
                    data: {
                        status: 'COMPLETED',
                        result: JSON.stringify(scrapingResult),
                        completedAt: new Date()
                    }
                });
                logger_1.logger.info(`Successfully processed scraping job ${job.id}`);
            }
            catch (error) {
                // Update job as failed
                await prisma.scrapingJob.update({
                    where: { id: job.id },
                    data: {
                        status: 'FAILED',
                        error: error.message || 'Unknown error',
                        completedAt: new Date()
                    }
                });
                logger_1.logger.error(`Failed to process scraping job ${job.id}:`, error);
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Error in processScheduledScrapingJobs:', error);
        throw error;
    }
}
/**
 * Start all scheduler jobs
 */
const startScheduler = () => {
    try {
        (0, exports.scheduleDailyPriceCheck)();
        (0, exports.scheduleWeeklyDigestEmails)();
        (0, exports.scheduleToolDataUpdates)();
        (0, exports.scheduleScrapingJobs)();
        logger_1.logger.info('All scheduler jobs started successfully');
    }
    catch (error) {
        logger_1.logger.error('Error starting scheduler jobs:', error);
    }
};
exports.startScheduler = startScheduler;
