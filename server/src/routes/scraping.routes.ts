import { Router } from "express"
import { createScrapingJob, getScrapingJobStatus, getAllScrapingJobs } from "../controllers/scraping.controller"
import { validateRequest } from "../middleware/validateRequest"
import { createScrapingJobSchema } from "../schemas/scraping.schema"
import { isAdmin } from "../middleware/isAdmin"

const router = Router()

// Admin routes (all protected by isAdmin middleware)
router.use(isAdmin)

router.post("/jobs", validateRequest(createScrapingJobSchema), createScrapingJob)
router.get("/jobs", getAllScrapingJobs)
router.get("/jobs/:id", getScrapingJobStatus)

export default router
