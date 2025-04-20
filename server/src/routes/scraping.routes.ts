import { Router } from "express"
import { scrapeTool, getScrapingStatus } from "../controllers/scraping.controller"
import { authenticate } from "../middleware/authenticate"

const router = Router()

// Protected routes
router.use(authenticate)
router.post("/", scrapeTool)
router.get("/:id", getScrapingStatus)

export default router
