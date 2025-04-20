"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._processScraping = exports.processScraping = exports.getScrapingStatus = exports.scrapeTool = exports.scrapePricingPage = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const scraping_service_1 = require("../services/scraping.service");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Scrape pricing page
const scrapePricingPage = async (req, res) => {
    try {
        const { url } = req.body;
        // Validate input
        const schema = zod_1.z.object({
            url: zod_1.z.string().url("Invalid URL"),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
        }
        // Use the scraping service directly
        const result = await (0, scraping_service_1.scrapePricingPage)(url);
        return res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        logger_1.logger.error("Error scraping pricing page:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to scrape pricing page: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};
exports.scrapePricingPage = scrapePricingPage;
// Scrape a tool's pricing page
const scrapeTool = async (req, res) => {
    try {
        const { url, toolId } = req.body;
        const userId = req.user.id;
        // Validate input
        const schema = zod_1.z.object({
            url: zod_1.z.string().url("Invalid URL"),
            toolId: zod_1.z.string().uuid("Invalid tool ID").optional(),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
        }
        // Create scraping job
        const scrapingJob = await prisma.scrapingJob.create({
            data: {
                url,
                toolId,
                type: "PRICING",
                status: "PENDING",
                schedule: "ONCE",
                createdBy: userId,
            },
        });
        // Start scraping in background
        (0, exports.processScraping)(scrapingJob.id).catch((error) => {
            console.error(`Error processing scraping job ${scrapingJob.id}:`, error);
        });
        return res.status(202).json({
            success: true,
            message: "Scraping job created",
            data: {
                jobId: scrapingJob.id,
                status: "PENDING",
            },
        });
    }
    catch (error) {
        console.error("Error creating scraping job:", error);
        return res.status(500).json({ success: false, message: "Failed to create scraping job" });
    }
};
exports.scrapeTool = scrapeTool;
// Get scraping job status
const getScrapingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const scrapingJob = await prisma.scrapingJob.findFirst({
            where: {
                id,
                createdBy: userId,
            },
        });
        if (!scrapingJob) {
            return res.status(404).json({ success: false, message: "Scraping job not found" });
        }
        return res.status(200).json({
            success: true,
            data: {
                id: scrapingJob.id,
                status: scrapingJob.status,
                result: scrapingJob.result,
                error: scrapingJob.error,
                startedAt: scrapingJob.startedAt,
                completedAt: scrapingJob.completedAt,
            },
        });
    }
    catch (error) {
        console.error("Error fetching scraping status:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch scraping status",
            error: error.message,
        });
    }
};
exports.getScrapingStatus = getScrapingStatus;
// Process scraping job
const processScraping = async (jobId) => {
    try {
        // Update job status to processing
        await prisma.scrapingJob.update({
            where: { id: jobId },
            data: {
                status: "PROCESSING",
                startedAt: new Date(),
            },
        });
        // Get job details
        const job = await prisma.scrapingJob.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            throw new Error("Scraping job not found");
        }
        // Perform scraping
        const scrapingResult = await (0, scraping_service_1.scrapePricingPage)(job.url);
        // Process the result
        if (job.toolId) {
            // Update existing tool with scraped data
            await prisma.saasTool.update({
                where: { id: job.toolId },
                data: {
                    description: scrapingResult.description || undefined,
                    // Update other fields as needed
                    updatedAt: new Date()
                },
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
        // Update job as completed
        await prisma.scrapingJob.update({
            where: { id: jobId },
            data: {
                status: "COMPLETED",
                result: JSON.stringify(scrapingResult),
                completedAt: new Date(),
            },
        });
        logger_1.logger.info(`Successfully processed scraping job ${jobId}`);
    }
    catch (error) {
        logger_1.logger.error(`Error processing scraping job ${jobId}:`, error);
        // Update job as failed
        await prisma.scrapingJob.update({
            where: { id: jobId },
            data: {
                status: "FAILED",
                error: error.message || "Unknown error",
                completedAt: new Date(),
            },
        });
    }
};
exports.processScraping = processScraping;
// Export for testing
exports._processScraping = exports.processScraping;
