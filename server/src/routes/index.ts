import { Router } from "express"
import authRoutes from "./auth.routes"
import userRoutes from "./user.routes"
import toolsRoutes from "./tools.routes"
import compareRoutes from "./compare.routes"
import cloudProvidersRoutes from "./cloud-providers.routes"
import reportsRoutes from "./reports.routes"
import subscriptionRoutes from "./subscription.routes"
import scrapingRoutes from "./scraping.routes"
import adminRoutes from "./admin.routes"
import aiRoutes from "./ai.routes"
import priceAlertRoutes from "./priceAlert.routes"

const router = Router()

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/tools", toolsRoutes)
router.use("/compare", compareRoutes)
router.use("/cloud-providers", cloudProvidersRoutes)
router.use("/reports", reportsRoutes)
router.use("/subscription", subscriptionRoutes)
router.use("/scraping", scrapingRoutes)
router.use("/admin", adminRoutes)
router.use("/ai", aiRoutes)
router.use("/price-alerts", priceAlertRoutes)

export default router
