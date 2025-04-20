"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzePricingTrends = exports.compareTools = exports.getRecommendations = exports.extractDataFromPDF = exports.extractDataFromScreenshot = exports.generateAIReport = exports.generateAIInsights = void 0;
const zod_1 = require("zod");
const gemini_service_1 = require("../services/ai/gemini.service");
const report_generator_service_1 = require("../services/ai/report-generator.service");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../utils/logger");
// import { prisma } from "../utils/prisma"
const prisma_1 = require("../utils/prisma");
const ai_service_1 = require("../services/ai.service");
// Initialize AI services
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const reportsDir = path_1.default.join(__dirname, "../../reports");
const aiReportGenerator = new report_generator_service_1.AIReportGenerator(geminiApiKey, reportsDir);
const geminiService = new gemini_service_1.GeminiAIService({ apiKey: geminiApiKey });
// Generate AI insights for a comparison
const generateAIInsights = async (req, res) => {
    try {
        const { comparisonId } = req.params;
        const userId = req.user.id;
        // Validate input
        const schema = zod_1.z.object({
            sections: zod_1.z.array(zod_1.z.string()).optional(),
            userRequirements: zod_1.z
                .object({
                budget: zod_1.z.number().optional(),
                mustHaveFeatures: zod_1.z.array(zod_1.z.string()).optional(),
                niceToHaveFeatures: zod_1.z.array(zod_1.z.string()).optional(),
                industry: zod_1.z.string().optional(),
                companySize: zod_1.z.string().optional(),
                useCase: zod_1.z.string().optional(),
            })
                .optional(),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
        }
        const { sections, userRequirements } = req.body;
        // Generate insights
        let insights;
        if (sections && sections.length > 0) {
            insights = await aiReportGenerator.generateCustomReportSections(comparisonId, userId, sections);
        }
        else {
            // Get comparison data
            const comparison = await prisma_1.prisma.comparison.findFirst({
                where: {
                    id: comparisonId,
                    userId,
                },
            });
            if (!comparison) {
                return res.status(404).json({ success: false, message: "Comparison not found" });
            }
            // Parse comparison data
            const metadata = comparison.metadata;
            const comparisonData = metadata?.comparisonData;
            if (!comparisonData) {
                return res.status(400).json({ success: false, message: "Invalid comparison data" });
            }
            insights = await geminiService.generateCompleteReport(comparisonData, userRequirements);
        }
        return res.status(200).json({
            success: true,
            data: insights,
        });
    }
    catch (error) {
        logger_1.logger.error("Error generating AI insights:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to generate AI insights: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};
exports.generateAIInsights = generateAIInsights;
// Generate AI-powered report
const generateAIReport = async (req, res) => {
    try {
        const { comparisonId } = req.params;
        const userId = req.user.id;
        // Validate input
        const schema = zod_1.z.object({
            format: zod_1.z.enum(["PDF", "EXCEL", "CSV"]),
            includeAIInsights: zod_1.z.boolean().default(true),
            sections: zod_1.z.array(zod_1.z.string()).optional(),
            userRequirements: zod_1.z
                .object({
                budget: zod_1.z.number().optional(),
                mustHaveFeatures: zod_1.z.array(zod_1.z.string()).optional(),
                niceToHaveFeatures: zod_1.z.array(zod_1.z.string()).optional(),
                industry: zod_1.z.string().optional(),
                companySize: zod_1.z.string().optional(),
                useCase: zod_1.z.string().optional(),
            })
                .optional(),
        });
        const validation = schema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.errors,
            });
        }
        const { format, includeAIInsights, sections, userRequirements } = req.body;
        // Generate report
        const report = await aiReportGenerator.generateReport(comparisonId, userId, {
            format,
            includeAIInsights,
            sections,
            userRequirements,
        });
        return res.status(201).json({
            success: true,
            data: {
                id: report.id,
                fileUrl: report.fileUrl,
                format,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error generating AI report:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to generate AI report: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};
exports.generateAIReport = generateAIReport;
// Extract data from screenshot
const extractDataFromScreenshot = async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        // Validate input
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: "Image data is required" });
        }
        // Extract data
        const extractedData = await aiReportGenerator.extractDataFromScreenshot(imageBase64);
        return res.status(200).json({
            success: true,
            data: extractedData,
        });
    }
    catch (error) {
        logger_1.logger.error("Error extracting data from screenshot:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to extract data from screenshot: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};
exports.extractDataFromScreenshot = extractDataFromScreenshot;
// Extract data from PDF
const extractDataFromPDF = async (req, res) => {
    try {
        const { pdfText } = req.body;
        // Validate input
        if (!pdfText) {
            return res.status(400).json({ success: false, message: "PDF text is required" });
        }
        // Extract data
        const extractedData = await aiReportGenerator.extractDataFromPDF(pdfText);
        return res.status(200).json({
            success: true,
            data: extractedData,
        });
    }
    catch (error) {
        logger_1.logger.error("Error extracting data from PDF:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to extract data from PDF: ${error instanceof Error ? error.message : String(error)}`,
        });
    }
};
exports.extractDataFromPDF = extractDataFromPDF;
const getRecommendations = async (req, res) => {
    try {
        const userRequirements = req.body;
        const result = await ai_service_1.aiService.getRecommendations(userRequirements);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.error });
        }
        return res.status(200).json({ success: true, data: result.data });
    }
    catch (error) {
        logger_1.logger.error('Error in AI recommendations controller', error);
        return res.status(500).json({ success: false, message: 'Failed to get AI recommendations' });
    }
};
exports.getRecommendations = getRecommendations;
const compareTools = async (req, res) => {
    try {
        const { tools } = req.body;
        if (!tools || !Array.isArray(tools) || tools.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least two tools to compare'
            });
        }
        const result = await ai_service_1.aiService.compareTools(tools);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.error });
        }
        return res.status(200).json({ success: true, data: result.data });
    }
    catch (error) {
        logger_1.logger.error('Error in AI comparison controller', error);
        return res.status(500).json({ success: false, message: 'Failed to get AI comparison' });
    }
};
exports.compareTools = compareTools;
const analyzePricingTrends = async (req, res) => {
    try {
        const { tool, historicalData } = req.body;
        if (!tool) {
            return res.status(400).json({
                success: false,
                message: 'Please provide tool data for analysis'
            });
        }
        const result = await ai_service_1.aiService.analyzePricingTrends(tool, historicalData || []);
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.error });
        }
        return res.status(200).json({ success: true, data: result.data });
    }
    catch (error) {
        logger_1.logger.error('Error in pricing analysis controller', error);
        return res.status(500).json({ success: false, message: 'Failed to analyze pricing trends' });
    }
};
exports.analyzePricingTrends = analyzePricingTrends;
