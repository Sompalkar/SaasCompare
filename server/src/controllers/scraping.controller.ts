import type { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import { ScrapingService } from "../services/scraping.service"

const prisma = new PrismaClient()
const scrapingService = new ScrapingService()

// Create a new scraping job
export const createScrapingJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url, toolId, type, schedule } = req.body

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
    })

    // Start the scraping process asynchronously
    scrapingService.startScraping(job.id).catch((error) => {
      logger.error(`Error in scraping job ${job.id}:`, error)
    })

    res.status(201).json({
      status: "success",
      data: job,
    })
  } catch (error) {
    logger.error("Create scraping job error:", error)
    next(error)
  }
}

// Get all scraping jobs
export const getAllScrapingJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.scrapingJob.count()

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
    })

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
    })
  } catch (error) {
    logger.error("Get all scraping jobs error:", error)
    next(error)
  }
}

// Get scraping job status
export const getScrapingJobStatus = async (req: Request, res: Response, next: NextFunction) => {
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
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!job) {
      return next(new AppError("Scraping job not found", 404))
    }

    res.status(200).json({
      status: "success",
      data: job,
    })
  } catch (error) {
    logger.error("Get scraping job status error:", error)
    next(error)
  }
}
