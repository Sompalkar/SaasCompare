"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ai_controller_1 = require("../controllers/ai.controller");
const authenticate_1 = require("../middleware/authenticate");
const router = express_1.default.Router();
// All routes require authentication
router.use(authenticate_1.authenticate);
// AI insights and reports
router.post("/insights/:comparisonId", ai_controller_1.generateAIInsights);
router.post("/report/:comparisonId", ai_controller_1.generateAIReport);
// Data extraction
router.post("/extract/screenshot", ai_controller_1.extractDataFromScreenshot);
router.post("/extract/pdf", ai_controller_1.extractDataFromPDF);
/**
 * @route   POST /api/ai/recommendations
 * @desc    Get AI-powered recommendations for SaaS tools
 * @access  Private
 */
router.post('/recommendations', ai_controller_1.getRecommendations);
/**
 * @route   POST /api/ai/compare
 * @desc    Compare multiple tools using AI
 * @access  Private
 */
router.post('/compare', ai_controller_1.compareTools);
/**
 * @route   POST /api/ai/pricing-analysis
 * @desc    Analyze pricing trends and get cost-saving recommendations
 * @access  Private
 */
router.post('/pricing-analysis', ai_controller_1.analyzePricingTrends);
exports.default = router;
