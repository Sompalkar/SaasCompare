"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScrapingJobStatus = exports.getAllScrapingJobs = exports.createScrapingJob = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const scraping_service_1 = require("../services/scraping.service");
const prisma = new client_1.PrismaClient();
const scrapingService = new scraping_service_1.ScrapingService();
// Create a new scraping job
const createScrapingJob = async (req, res, next) => {
    try {
        const { url, toolId, type, schedule } = req.body;
        // Create a scraping job
        const job = await prisma.scrapingJob.create({
            data: {
                url,
                toolId,
                type,
                schedule: schedule || "ONCE",
                status: "PENDING",
                createdBy: req.user.id,
            },
        });
        // Start the scraping process asynchronously
        scrapingService.startScraping(job.id).catch((error) => {
            logger_1.logger.error(`Error in scraping job ${job.id}:`, error);
        });
        res.status(201).json({
            status: "success",
            data: job,
        });
    }
    catch (error) {
        logger_1.logger.error("Create scraping job error:", error);
        next(error);
    }
};
exports.createScrapingJob = createScrapingJob;
// Get all scraping jobs
const getAllScrapingJobs = async (req, res, next) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get total count for pagination
        const totalCount = await prisma.scrapingJob.count();
        // Get scraping jobs with pagination
        const jobs = await prisma.scrapingJob.findMany({
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                tool: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        res.status(200).json({
            status: "success",
            results: jobs.length,
            pagination: {
                total: totalCount,
                page,
                pages: Math.ceil(totalCount / limit),
                limit,
            },
            data: jobs,
        });
    }
    catch (error) {
        logger_1.logger.error("Get all scraping jobs error:", error);
        next(error);
    }
};
exports.getAllScrapingJobs = getAllScrapingJobs;
// Get scraping job status
const getScrapingJobStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const job = await prisma.scrapingJob.findUnique({
            where: { id },
            include: {
                tool: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        if (!job) {
            return next(new appError_1.AppError("Scraping job not found", 404));
        }
        res.status(200).json({
            status: "success",
            data: job,
        });
    }
    catch (error) {
        logger_1.logger.error("Get scraping job status error:", error);
        next(error);
    }
};
exports.getScrapingJobStatus = getScrapingJobStatus;
