import { Router } from "express"
import { generateReport, getReports, getReportById, downloadReport } from "../controllers/reports.controller"
import { validateRequest } from "../middleware/validateRequest"
import { generateReportSchema } from "../schemas/reports.schema"

const router = Router()

// Protected routes
router.post("/generate", validateRequest(generateReportSchema), generateReport)
router.get("/", getReports)
router.get("/:id", getReportById)
router.get("/:id/download", downloadReport)

export default router
