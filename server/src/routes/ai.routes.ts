import express from 'express';
import {
  generateAIInsights,
  generateAIReport,
  extractDataFromScreenshot,
  extractDataFromPDF,
  getRecommendations,
  compareTools,
  analyzePricingTrends,
} from "../controllers/ai.controller"
import { authenticate } from "../middleware/authenticate"

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// AI insights and reports
router.post("/insights/:comparisonId", generateAIInsights)
router.post("/report/:comparisonId", generateAIReport)

// Data extraction
router.post("/extract/screenshot", extractDataFromScreenshot)
router.post("/extract/pdf", extractDataFromPDF)

/**
 * @route   POST /api/ai/recommendations
 * @desc    Get AI-powered recommendations for SaaS tools
 * @access  Private
 */
router.post('/recommendations', getRecommendations)

/**
 * @route   POST /api/ai/compare
 * @desc    Compare multiple tools using AI
 * @access  Private
 */
router.post('/compare', compareTools)

/**
 * @route   POST /api/ai/pricing-analysis
 * @desc    Analyze pricing trends and get cost-saving recommendations
 * @access  Private
 */
router.post('/pricing-analysis', analyzePricingTrends)

export default router
