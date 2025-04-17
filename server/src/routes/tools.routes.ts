import { Router } from "express"
import { getAllTools, getToolById, getToolsByCategory, searchTools } from "../controllers/tools.controller"
import { validateRequest } from "../middleware/validateRequest"
import { searchToolsSchema } from "../schemas/tools.schema"

const router = Router()

// Public routes
router.get("/", getAllTools)
router.get("/category/:category", getToolsByCategory)
router.get("/search", validateRequest(searchToolsSchema), searchTools)
router.get("/:id", getToolById)

export default router
