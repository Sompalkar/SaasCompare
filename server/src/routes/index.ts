import { Router } from "express"
import authRoutes from "./auth.routes"
import toolsRoutes from "./tools.routes"
import compareRoutes from "./compare.routes"
import userRoutes from "./user.routes"
import subscriptionRoutes from "./subscription.routes"
import reportsRoutes from "./reports.routes"
import adminRoutes from "./admin.routes"
import scrapingRoutes from "./scraping.routes"
import { authenticate } from "../middleware/authenticate"

const router = Router()

// Public routes
router.use("/auth", authRoutes)
router.use("/tools", toolsRoutes)
router.use("/compare", compareRoutes)

// Protected routes
router.use("/user", authenticate, userRoutes)
router.use("/subscription", authenticate, subscriptionRoutes)
router.use("/reports", authenticate, reportsRoutes)

// Admin routes
router.use("/admin", authenticate, adminRoutes)
router.use("/scraping", authenticate, scrapingRoutes)

export default router
