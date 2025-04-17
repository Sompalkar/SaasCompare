import { Router } from "express"
import {
  generateReport,
  getReports,
  getReportById,
  downloadReport,
  deleteReport,
} from "../controllers/reports.controller"
import { authenticate } from "../middleware/authenticate"
import { validateRequest } from "../middleware/validateRequest"
import { generateReportSchema } from "../schemas/reports.schema"

const router = Router()

// All reports routes require authentication
router.use(authenticate)

// Routes
router.post("/generate", validateRequest(generateReportSchema), generateReport)
router.get("/", getReports)
router.get("/:id", getReportById)
router.get("/:id/download", downloadReport)
router.delete("/:id", deleteReport)

export default router
