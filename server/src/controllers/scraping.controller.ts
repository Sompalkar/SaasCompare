import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { ScrapingService } from "../services/scraping.service"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

const prisma = new PrismaClient()
const scrapingService = new ScrapingService()

// Create a new scraping job
export const createScrapingJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, type, toolId } = req.body

    // Validate job type
    if (!["PRICING", "FEATURES", "INTEGRATIONS"].includes(type)) {
      return next(new AppError("Invalid job type. Must be PRICING, FEATURES, or INTEGRATIONS", 400))
    }

    // If toolId is provided, check if it exists
    if (toolId) {
      const tool = await prisma.saasTool.findUnique({
        where: { id: toolId },
      })

      if (!tool) {
        return next(new AppError(`Tool with ID ${toolId} not found`, 404))
      }
    }

    // Create the scraping job
    const job = await prisma.scrapingJob.create({
      data: {
        url,
        type,
        status: "PENDING",
        tool: toolId ? { connect: { id: toolId } } : undefined,
        createdBy: req.user?.id,
      },
    })

    // Start the scraping process asynchronously
    scrapingService.startScraping(job.id).catch((error) => {
      logger.error(`Error starting scraping job ${job.id}:`, error)
    })

    res.status(201).json({
      status: "success",
      data: {
        job,
      },
    })
  } catch (error) {
    logger.error("Create scraping job error:", error)
    next(error)
  }
}

// Get all scraping jobs
export const getAllScrapingJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await prisma.scrapingJob.findMany({
      include: {
        tool: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.status(200).json({
      status: "success",
      results: jobs.length,
      data: {
        jobs,
      },
    })
  } catch (error) {
    logger.error("Get all scraping jobs error:", error)
    next(error)
  }
}

// Get scraping job by ID
export const getScrapingJobById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const job = await prisma.scrapingJob.findUnique({
      where: { id },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!job) {
      return next(new AppError("Scraping job not found", 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        job,
      },
    })
  } catch (error) {
    logger.error("Get scraping job by ID error:", error)
    next(error)
  }
}

// Retry a failed scraping job
export const retryScrapingJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const job = await prisma.scrapingJob.findUnique({
      where: { id },
    })

    if (!job) {
      return next(new AppError("Scraping job not found", 404))
    }

    if (job.status !== "FAILED") {
      return next(new AppError("Only failed jobs can be retried", 400))
    }

    // Update job status to PENDING
    await prisma.scrapingJob.update({
      where: { id },
      data: {
        status: "PENDING",
        error: null,
        startedAt: null,
        completedAt: null,
      },
    })

    // Start the scraping process asynchronously
    scrapingService.startScraping(job.id).catch((error) => {
      logger.error(`Error retrying scraping job ${job.id}:`, error)
    })

    res.status(200).json({
      status: "success",
      message: "Scraping job retry initiated",
    })
  } catch (error) {
    logger.error("Retry scraping job error:", error)
    next(error)
  }
}

// Cancel a pending or processing scraping job
export const cancelScrapingJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const job = await prisma.scrapingJob.findUnique({
      where: { id },
    })

    if (!job) {
      return next(new AppError("Scraping job not found", 404))
    }

    if (job.status !== "PENDING" && job.status !== "PROCESSING") {
      return next(new AppError("Only pending or processing jobs can be canceled", 400))
    }

    // Update job status to CANCELED
    await prisma.scrapingJob.update({
      where: { id },
      data: {
        status: "CANCELED",
        completedAt: new Date(),
      },
    })

    res.status(200).json({
      status: "success",
      message: "Scraping job canceled",
    })
  } catch (error) {
    logger.error("Cancel scraping job error:", error)
    next(error)
  }
}

// Bulk create scraping jobs for a tool
export const bulkCreateScrapingJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toolId, urls } = req.body

    if (!toolId) {
      return next(new AppError("Tool ID is required", 400))
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return next(new AppError("URLs array is required and must not be empty", 400))
    }

    // Check if tool exists
    const tool = await prisma.saasTool.findUnique({
      where: { id: toolId },
    })

    if (!tool) {
      return next(new AppError(`Tool with ID ${toolId} not found`, 404))
    }

    // Create jobs for each URL and type
    const jobs = []
    const jobTypes = ["PRICING", "FEATURES", "INTEGRATIONS"]

    for (const url of urls) {
      for (const type of jobTypes) {
        const job = await prisma.scrapingJob.create({
          data: {
            url,
            type: type as "PRICING" | "FEATURES" | "INTEGRATIONS",
            status: "PENDING",
            tool: { connect: { id: toolId } },
            createdBy: req.user?.id,
          },
        })

        jobs.push(job)

        // Start the scraping process asynchronously
        scrapingService.startScraping(job.id).catch((error) => {
          logger.error(`Error starting scraping job ${job.id}:`, error)
        })
      }
    }

    res.status(201).json({
      status: "success",
      results: jobs.length,
      data: {
        jobs,
      },
    })
  } catch (error) {
    logger.error("Bulk create scraping jobs error:", error)
    next(error)
  }
}
