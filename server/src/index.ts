import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import routes from "./routes"
import { errorHandler } from "./middleware/errorHandler"
import { startScheduler } from "./services/scheduler.service"
import { logger } from "./utils/logger"
import { seedTools } from "./utils/seed-data"
import { PrismaClient } from "@prisma/client"

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const port = process.env.PORT || 5000
const prisma = new PrismaClient()

// Middleware

app.use(express.json())

// Routes
app.use("/api", routes)

// Error handling middleware
app.use(errorHandler)

// Start scheduler for automated tasks
if (process.env.NODE_ENV !== 'test') {
  startScheduler();
  logger.info("Price change monitoring scheduler started");
}

// Start server
app.listen(port, async () => {
  logger.info(`Server running on port ${port}`)
  
  // Check if database is empty before seeding
  try {
    const toolCount = await prisma.saasTool.count()
    
    if (toolCount === 0) {
      logger.info("Database empty. Running initial seeding...")
      await seedTools()
    } else {
      logger.info(`Database already has ${toolCount} tools. Skipping seed.`)
    }
  } catch (error) {
    logger.error("Error checking database state:", error)
  } finally {
    await prisma.$disconnect()
  }
})

export default app
