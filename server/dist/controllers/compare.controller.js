"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComparison = exports.getSavedComparisons = exports.saveComparison = exports.getHistoricalData = exports.exportComparison = exports.getComparisonById = exports.compareTools = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
// Compare tools
const compareTools = async (req, res, next) => {
    try {
        const { toolIds, features } = req.body;
        // Get tools with their pricing plans and features
        const tools = await prisma.saasTool.findMany({
            where: {
                id: {
                    in: toolIds,
                },
            },
            include: {
                pricingPlans: {
                    include: {
                        features: true,
                        limitations: true,
                    },
                },
                integrations: true,
            },
        });
        if (tools.length !== toolIds.length) {
            return next(new appError_1.AppError("One or more tools not found", 404));
        }
        // Create a comparison record
        const comparison = await prisma.comparison.create({
            data: {
                userId: req.user?.id, // Optional, will be null for anonymous comparisons
                tools: {
                    connect: toolIds.map((id) => ({ id })),
                },
                features: features || [],
            },
        });
        // Format the response
        const formattedTools = tools.map((tool) => {
            return {
                id: tool.id,
                name: tool.name,
                logo: tool.logo,
                description: tool.description,
                category: tool.category,
                website: tool.website,
                pricing: formatPricingPlans(tool.pricingPlans),
                integrations: tool.integrations.map((integration) => integration.name),
                lastUpdated: tool.updatedAt,
            };
        });
        res.status(200).json({
            status: "success",
            data: {
                id: comparison.id,
                tools: formattedTools,
                features: comparison.features,
                createdAt: comparison.createdAt,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Compare tools error:", error);
        next(error);
    }
};
exports.compareTools = compareTools;
// Get comparison by ID
const getComparisonById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const comparison = await prisma.comparison.findUnique({
            where: { id },
            include: {
                tools: {
                    include: {
                        pricingPlans: {
                            include: {
                                features: true,
                                limitations: true,
                            },
                        },
                        integrations: true,
                    },
                },
            },
        });
        if (!comparison) {
            return next(new appError_1.AppError("Comparison not found", 404));
        }
        // Format the response
        const formattedTools = comparison.tools.map((tool) => {
            return {
                id: tool.id,
                name: tool.name,
                logo: tool.logo,
                description: tool.description,
                category: tool.category,
                website: tool.website,
                pricing: formatPricingPlans(tool.pricingPlans),
                integrations: tool.integrations.map((integration) => integration.name),
                lastUpdated: tool.updatedAt,
            };
        });
        res.status(200).json({
            status: "success",
            data: {
                id: comparison.id,
                tools: formattedTools,
                features: comparison.features,
                createdAt: comparison.createdAt,
                userId: comparison.userId,
            },
        });
    }
    catch (error) {
        logger_1.logger.error("Get comparison by ID error:", error);
        next(error);
    }
};
exports.getComparisonById = getComparisonById;
// Helper function to format pricing plans
const formatPricingPlans = (pricingPlans) => {
    const result = {};
    pricingPlans.forEach((plan) => {
        const planName = plan.name.toLowerCase();
        result[planName] = {
            price: plan.isCustomPricing ? "Contact for pricing" : plan.price,
            features: plan.features.map((feature) => feature.name),
            limitations: plan.limitations.map((limitation) => limitation.name),
        };
    });
    return result;
};
/**
 * Export a comparison to PDF, Excel, or PowerPoint
 */
const exportComparison = async (req, res) => {
    try {
        const { format, tools } = req.body;
        if (!format || !tools || !Array.isArray(tools) || tools.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid format or tools data provided'
            });
        }
        // Format validation
        if (!['pdf', 'excel', 'ppt'].includes(format)) {
            return res.status(400).json({
                success: false,
                message: 'Unsupported export format'
            });
        }
        // Ensure reports directory exists
        const reportsDir = path_1.default.join(__dirname, '../../reports');
        if (!fs_1.default.existsSync(reportsDir)) {
            fs_1.default.mkdirSync(reportsDir, { recursive: true });
        }
        // Generate a unique filename
        const timestamp = new Date().getTime();
        const filename = `comparison_${timestamp}`;
        let outputPath = '';
        let mimeType = '';
        // Generate export based on format
        switch (format) {
            case 'pdf':
                outputPath = await generatePDFExport(filename, tools);
                mimeType = 'application/pdf';
                break;
            case 'excel':
                outputPath = await generateExcelExport(filename, tools);
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'ppt':
                outputPath = await generatePPTExport(filename, tools);
                mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                break;
        }
        // Store the export in database for tracking
        await prisma.export.create({
            data: {
                userId: req.user?.id,
                fileName: outputPath,
                format,
                createdAt: new Date()
            }
        });
        // Return the file URL for download
        // In a production app, this would use a proper file storage service with signed URLs
        const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
        const downloadUrl = `${baseUrl}/exports/${outputPath}`;
        return res.status(200).json({
            success: true,
            data: {
                url: downloadUrl,
                format,
                filename: outputPath
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error exporting comparison', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to export comparison'
        });
    }
};
exports.exportComparison = exportComparison;
/**
 * Get historical pricing data for tools
 */
const getHistoricalData = async (req, res) => {
    try {
        const { toolIds } = req.body;
        if (!toolIds || !Array.isArray(toolIds) || toolIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tool IDs are required'
            });
        }
        // Get historical pricing data for the tools
        const historicalData = await prisma.pricingHistory.findMany({
            where: {
                toolId: {
                    in: toolIds
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        });
        // Format the data for the client
        const formattedData = formatHistoricalData(historicalData, toolIds);
        return res.status(200).json({
            success: true,
            data: formattedData
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting historical data', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get historical data'
        });
    }
};
exports.getHistoricalData = getHistoricalData;
// Helper functions for export generation
async function generatePDFExport(filename, tools) {
    // Mock implementation - in a real app, this would generate a PDF
    const filePath = path_1.default.join(__dirname, '../../reports', `${filename}.pdf`);
    // Create a simple file to simulate PDF creation
    fs_1.default.writeFileSync(filePath, 'This is a mock PDF file for the comparison report');
    return `${filename}.pdf`;
}
async function generateExcelExport(filename, tools) {
    // Mock implementation - in a real app, this would generate an Excel file
    const filePath = path_1.default.join(__dirname, '../../reports', `${filename}.xlsx`);
    // Create a simple file to simulate Excel creation
    fs_1.default.writeFileSync(filePath, 'This is a mock Excel file for the comparison report');
    return `${filename}.xlsx`;
}
async function generatePPTExport(filename, tools) {
    // Mock implementation - in a real app, this would generate a PowerPoint file
    const filePath = path_1.default.join(__dirname, '../../reports', `${filename}.pptx`);
    // Create a simple file to simulate PowerPoint creation
    fs_1.default.writeFileSync(filePath, 'This is a mock PowerPoint file for the comparison report');
    return `${filename}.pptx`;
}
// Helper function to format historical pricing data
function formatHistoricalData(historicalData, toolIds) {
    // Get unique dates
    const dates = [...new Set(historicalData.map(item => item.timestamp.toISOString().split('T')[0]))];
    // Create a map of tool pricing data
    const prices = {};
    toolIds.forEach(toolId => {
        prices[toolId] = {
            free: { monthly: [], annually: [] },
            starter: { monthly: [], annually: [] },
            professional: { monthly: [], annually: [] },
            enterprise: { monthly: [], annually: [] }
        };
    });
    // Populate the prices data
    historicalData.forEach(item => {
        const date = item.timestamp.toISOString().split('T')[0];
        const dateIndex = dates.indexOf(date);
        if (dateIndex >= 0 && prices[item.toolId]) {
            // Make sure the tier and plan exist in our structure
            if (prices[item.toolId][item.tier] && prices[item.toolId][item.tier][item.plan]) {
                prices[item.toolId][item.tier][item.plan][dateIndex] = item.price;
            }
        }
    });
    return { dates, prices };
}
// Save a comparison
const saveComparison = async (req, res, next) => {
    try {
        const { name, tools } = req.body;
        if (!name || !tools || !Array.isArray(tools) || tools.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Invalid comparison data provided'
            });
        }
        // Get user ID from auth
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        // First verify that all tools exist
        const existingTools = await prisma.saasTool.findMany({
            where: {
                id: {
                    in: tools
                }
            },
            select: {
                id: true,
                name: true,
                logo: true
            }
        });
        if (existingTools.length !== tools.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more tool IDs are invalid'
            });
        }
        // Create comparison record
        const comparison = await prisma.comparison.create({
            data: {
                userId,
                features: [],
                tools: {
                    connect: existingTools.map(tool => ({ id: tool.id }))
                }
            }
        });
        // Then create the saved comparison that references it
        const savedComparison = await prisma.savedComparison.create({
            data: {
                name,
                userId,
                comparisonId: comparison.id
            }
        });
        return res.status(201).json({
            success: true,
            data: {
                id: savedComparison.id,
                name: savedComparison.name,
                comparisonId: comparison.id,
                tools: existingTools
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error saving comparison', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save comparison'
        });
    }
};
exports.saveComparison = saveComparison;
// Get user's saved comparisons
const getSavedComparisons = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const savedComparisons = await prisma.savedComparison.findMany({
            where: {
                userId
            },
            include: {
                tools: {
                    select: {
                        id: true,
                        name: true,
                        logo: true,
                        category: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.status(200).json({
            success: true,
            data: savedComparisons
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting saved comparisons', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get saved comparisons'
        });
    }
};
exports.getSavedComparisons = getSavedComparisons;
// Delete a saved comparison
const deleteComparison = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        // First check if the comparison exists and belongs to the user
        const comparison = await prisma.savedComparison.findFirst({
            where: {
                id,
                userId
            }
        });
        if (!comparison) {
            return res.status(404).json({
                success: false,
                message: 'Comparison not found or you don\'t have permission to delete it'
            });
        }
        // Delete the comparison
        await prisma.savedComparison.delete({
            where: {
                id
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Comparison deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting comparison', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete comparison'
        });
    }
};
exports.deleteComparison = deleteComparison;
