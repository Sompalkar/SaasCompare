import { Router } from "express"
import {
  createScrapingJob,
  getAllScrapingJobs,
  getScrapingJobById,
  retryScrapingJob,
  cancelScrapingJob,
  bulkCreateScrapingJobs,
} from "../controllers/scraping.controller"
import { authenticate } from "../middleware/authenticate"
import { isAdmin } from "../middleware/isAdmin"
import { validateRequest } from "../middleware/validateRequest"
import { createScrapingJobSchema, bulkCreateScrapingJobsSchema } from "../schemas/scraping.schema"

const router = Router()

// All scraping routes require authentication
router.use(authenticate)

// Admin-only routes
router.post("/jobs", isAdmin, validateRequest(createScrapingJobSchema), createScrapingJob)
router.get("/jobs", isAdmin, getAllScrapingJobs)
router.get("/jobs/:id", isAdmin, getScrapingJobById)
router.post("/jobs/:id/retry", isAdmin, retryScrapingJob)
router.post("/jobs/:id/cancel", isAdmin, cancelScrapingJob)
router.post("/bulk-jobs", isAdmin, validateRequest(bulkCreateScrapingJobsSchema), bulkCreateScrapingJobs)

export default router
