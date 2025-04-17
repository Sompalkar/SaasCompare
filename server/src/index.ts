import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import { rateLimit } from "express-rate-limit"
import { errorHandler } from "./middleware/errorHandler"
import { logger } from "./utils/logger"
import routes from "./routes"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 3001

// Apply middleware
app.use(helmet()) // Security headers
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
)
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies
app.use(cookieParser(process.env.COOKIE_SECRET)) // Parse cookies
app.use(morgan("dev")) // HTTP request logger

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// API routes
app.use("/api", routes)

// Error handling middleware
app.use(errorHandler)

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Rejection:", err)
  // Close server & exit process
  process.exit(1)
})
