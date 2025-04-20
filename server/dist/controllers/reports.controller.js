"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReport = exports.downloadReport = exports.generateReport = exports.getReportById = exports.getUserReports = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
const report_generator_service_1 = require("../services/ai/report-generator.service");
const logger_1 = require("../utils/logger");
const prisma_1 = require("../utils/prisma");
const REPORTS_DIR = path_1.default.join(__dirname, "../../reports");
// Ensure reports directory exists
if (!fs_1.default.existsSync(REPORTS_DIR)) {
    fs_1.default.mkdirSync(REPORTS_DIR, { recursive: true });
}
// Initialize AI report generator
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const aiReportGenerator = new report_generator_service_1.AIReportGenerator(geminiApiKey, REPORTS_DIR);
// Get all reports for a user
const getUserReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const reports = await prisma_1.prisma.report.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                comparison: true,
            },
        });
        return res.status(200).json({ success: true, data: reports });
    }
    catch (error) {
        logger_1.logger.error("Error fetching reports:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch reports" });
    }
};
exports.getUserReports = getUserReports;
// Get report by ID
const getReportById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const report = await prisma_1.prisma.report.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                comparison: true,
            },
        });
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        return res.status(200).json({ success: true, data: report });
    }
    catch (error) {
        logger_1.logger.error("Error fetching report:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch report" });
    }
};
exports.getReportById = getReportById;
// Generate a report
const generateReport = async (req, res) => {
    try {
        const { comparisonId, format, includeAIInsights } = req.body;
        const userId = req.user.id;
        // Validate input
        const schema = zod_1.z.object({
            comparisonId: zod_1.z.string().uuid("Invalid comparison ID"),
            format: zod_1.z.enum(["PDF", "EXCEL", "CSV"]),
            includeAIInsights: zod_1.z.boolean().optional().default(false),
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
        // For mock implementation, we'll create a simple file
        const timestamp = new Date().getTime();
        const filename = `report_${timestamp}.${format.toLowerCase()}`;
        const filePath = path_1.default.join(REPORTS_DIR, filename);
        // Create mock content
        const mockContent = `This is a mock ${format} report for comparison ${comparisonId}`;
        fs_1.default.writeFileSync(filePath, mockContent);
        // Save report in database
        const report = await prisma_1.prisma.report.create({
            data: {
                userId,
                comparisonId,
                format: format,
                fileUrl: `/api/reports/${filename}`,
                filename,
                metadata: { filePath }
            }
        });
        // Return response with downloadUrl
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:5000';
        const downloadUrl = `${baseUrl}/api/reports/${report.id}/download`;
        return res.status(201).json({
            success: true,
            data: {
                id: report.id,
                format,
                fileUrl: report.fileUrl,
                downloadUrl
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Error generating report:", error);
        return res.status(500).json({ success: false, message: "Failed to generate report" });
    }
};
exports.generateReport = generateReport;
// Download a report
const downloadReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const report = await prisma_1.prisma.report.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        // Get file path from metadata
        const metadata = report.metadata || {};
        const filePath = metadata.filePath;
        if (!filePath || !fs_1.default.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: "Report file not found" });
        }
        // Set content type based on format
        let contentType = "application/octet-stream";
        if (report.format === "PDF") {
            contentType = "application/pdf";
        }
        else if (report.format === "EXCEL") {
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
        else if (report.format === "CSV") {
            contentType = "text/csv";
        }
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
        const fileStream = fs_1.default.createReadStream(filePath);
        fileStream.pipe(res);
    }
    catch (error) {
        logger_1.logger.error("Error downloading report:", error);
        return res.status(500).json({ success: false, message: "Failed to download report" });
    }
};
exports.downloadReport = downloadReport;
// Delete a report
const deleteReport = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const report = await prisma_1.prisma.report.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!report) {
            return res.status(404).json({ success: false, message: "Report not found" });
        }
        // Get file path from metadata
        const metadata = report.metadata || {};
        const filePath = metadata.filePath;
        // Delete file if it exists
        if (filePath && fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        // Delete report from database
        await prisma_1.prisma.report.delete({
            where: { id },
        });
        return res.status(200).json({
            success: true,
            message: "Report deleted successfully",
        });
    }
    catch (error) {
        logger_1.logger.error("Error deleting report:", error);
        return res.status(500).json({ success: false, message: "Failed to delete report" });
    }
};
exports.deleteReport = deleteReport;
