import { Router } from "express"
import { generateReport, downloadReport, getUserReports, deleteReport } from "../controllers/reports.controller"
import { authenticate } from "../middleware/authenticate"

const router = Router()

// All routes require authentication
router.use(authenticate)

router.post("/generate", generateReport)
router.get("/user", getUserReports)
router.get("/:id/download", downloadReport)
router.delete("/:id", deleteReport)

export default router
