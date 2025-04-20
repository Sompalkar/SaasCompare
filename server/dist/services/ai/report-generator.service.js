"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIReportGenerator = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const gemini_service_1 = require("./gemini.service");
const pdf_service_1 = require("../pdf.service");
const excel_service_1 = require("../excel.service");
const csv_service_1 = require("../csv.service");
const logger_1 = require("../../utils/logger");
const prisma_1 = require("../../utils/prisma");
class AIReportGenerator {
    constructor(geminiApiKey, reportsDir) {
        this.geminiService = new gemini_service_1.GeminiAIService({
            apiKey: geminiApiKey,
        });
        this.reportsDir = reportsDir;
        // Ensure reports directory exists
        if (!fs_1.default.existsSync(this.reportsDir)) {
            fs_1.default.mkdirSync(this.reportsDir, { recursive: true });
        }
    }
    /**
     * Generate a report for a comparison
     */
    async generateReport(comparisonId, userId, options) {
        try {
            // Get comparison data
            const comparison = await prisma_1.prisma.comparison.findFirst({
                where: {
                    id: comparisonId,
                    userId,
                },
            });
            if (!comparison) {
                throw new Error("Comparison not found");
            }
            // Parse comparison data
            const metadata = comparison.metadata;
            const comparisonData = metadata?.comparisonData;
            if (!comparisonData) {
                throw new Error("Invalid comparison data");
            }
            // Generate AI insights if requested
            let aiInsights = null;
            if (options.includeAIInsights) {
                aiInsights = await this.geminiService.generateCompleteReport(comparisonData, options.userRequirements);
            }
            // Generate report file based on format
            let filePath = "";
            let filename = `comparison-report-${Date.now()}`;
            if (options.format === "PDF") {
                filePath = await (0, pdf_service_1.generatePDFReport)(comparisonData, this.reportsDir, aiInsights);
                filename += ".pdf";
            }
            else if (options.format === "EXCEL") {
                filePath = await (0, excel_service_1.generateExcelReport)(comparisonData, this.reportsDir, aiInsights);
                filename += ".xlsx";
            }
            else if (options.format === "CSV") {
                filePath = await (0, csv_service_1.generateCSVReport)(comparisonData, this.reportsDir);
                filename += ".csv";
            }
            // Create report record in database with metadata
            const report = await prisma_1.prisma.report.create({
                data: {
                    userId,
                    comparisonId,
                    format: options.format,
                    filename,
                    fileUrl: `/reports/${path_1.default.basename(filePath)}`,
                    metadata: {
                        filePath,
                        includesAI: options.includeAIInsights,
                        generatedAt: new Date().toISOString(),
                        sections: options.sections || [],
                    },
                },
            });
            return {
                id: report.id,
                filePath,
                fileUrl: `/reports/${path_1.default.basename(filePath)}`,
            };
        }
        catch (error) {
            logger_1.logger.error("Error generating report:", error);
            throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate custom report sections
     */
    async generateCustomReportSections(comparisonId, userId, sections) {
        try {
            // Get comparison data
            const comparison = await prisma_1.prisma.comparison.findFirst({
                where: {
                    id: comparisonId,
                    userId,
                },
            });
            if (!comparison) {
                throw new Error("Comparison not found");
            }
            // Parse comparison data
            const metadata = comparison.metadata;
            const comparisonData = metadata?.comparisonData;
            if (!comparisonData) {
                throw new Error("Invalid comparison data");
            }
            // Generate requested sections
            const reportSections = {};
            for (const section of sections) {
                switch (section) {
                    case "executiveSummary":
                        reportSections.executiveSummary = await this.geminiService.generateExecutiveSummary(comparisonData);
                        break;
                    case "detailedAnalysis":
                        reportSections.detailedAnalysis = await this.geminiService.generateComparisonInsights(comparisonData);
                        break;
                    case "pricingAnalysis":
                        reportSections.pricingAnalysis = await this.geminiService.generatePricingAnalysis(comparisonData);
                        break;
                    case "featureComparison":
                        reportSections.featureComparison = await this.geminiService.generateFeatureComparison(comparisonData);
                        break;
                    case "marketPositioning":
                        reportSections.marketPositioning = await this.geminiService.generateMarketPositioning(comparisonData);
                        break;
                    case "futureTrends":
                        reportSections.futureTrends = await this.geminiService.generateFutureTrends(comparisonData);
                        break;
                }
            }
            return reportSections;
        }
        catch (error) {
            logger_1.logger.error("Error generating custom report sections:", error);
            throw new Error(`Failed to generate custom report sections: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Extract data from a pricing page screenshot
     */
    async extractDataFromScreenshot(imageBase64) {
        try {
            return await this.geminiService.extractDataFromScreenshot(imageBase64);
        }
        catch (error) {
            logger_1.logger.error("Error extracting data from screenshot:", error);
            throw new Error(`Failed to extract data from screenshot: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Extract data from a PDF document
     */
    async extractDataFromPDF(pdfText) {
        try {
            return await this.geminiService.extractDataFromPDF(pdfText);
        }
        catch (error) {
            logger_1.logger.error("Error extracting data from PDF:", error);
            throw new Error(`Failed to extract data from PDF: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.AIReportGenerator = AIReportGenerator;
