"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getToolCategories = exports.getToolsByCategory = exports.scrapeToolData = exports.getPopularTools = exports.getFeaturedTools = exports.getToolHistoricalData = exports.searchTools = exports.deleteTool = exports.updateTool = exports.createTool = exports.getToolById = exports.getAllTools = void 0;
const appError_1 = require("../utils/appError");
const prisma_1 = require("../utils/prisma");
const scrapingService = __importStar(require("../services/scraping.service"));
const logger_1 = require("../utils/logger");
// Get all tools
const getAllTools = async (req, res, next) => {
    try {
        // Use the SaasTool model from Prisma
        const tools = await prisma_1.prisma.saasTool.findMany({
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
        // Format the response
        const formattedTools = tools.map((tool) => formatToolResponse(tool));
        res.status(200).json({
            status: "success",
            data: formattedTools,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllTools = getAllTools;
// Get tool by ID
const getToolById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Use the SaasTool model from Prisma
        const tool = await prisma_1.prisma.saasTool.findUnique({
            where: { id },
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
        if (!tool) {
            return next(new appError_1.AppError("Tool not found", 404));
        }
        // Format the response
        const formattedTool = formatToolResponse(tool);
        res.status(200).json({
            status: "success",
            data: formattedTool,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getToolById = getToolById;
// Create tool
const createTool = async (req, res, next) => {
    try {
        const { name, description, category, website, logo, pricingPlans, integrations } = req.body;
        // Create the tool
        const tool = await prisma_1.prisma.saasTool.create({
            data: {
                name,
                description: description || "",
                category,
                website,
                logo: logo || "",
            },
        });
        // Create pricing plans
        if (pricingPlans && Array.isArray(pricingPlans)) {
            for (const plan of pricingPlans) {
                const { name, price, isCustomPricing, features, limitations } = plan;
                const pricingPlan = await prisma_1.prisma.pricingPlan.create({
                    data: {
                        name,
                        price: isCustomPricing ? null : price,
                        isCustomPricing,
                        saasToolId: tool.id,
                    },
                });
                // Create features
                if (features && Array.isArray(features)) {
                    await prisma_1.prisma.feature.createMany({
                        data: features.map((feature) => ({
                            name: feature,
                            pricingPlanId: pricingPlan.id,
                        })),
                    });
                }
                // Create limitations
                if (limitations && Array.isArray(limitations)) {
                    await prisma_1.prisma.limitation.createMany({
                        data: limitations.map((limitation) => ({
                            name: limitation,
                            pricingPlanId: pricingPlan.id,
                        })),
                    });
                }
            }
        }
        // Create integrations
        if (integrations && Array.isArray(integrations)) {
            await prisma_1.prisma.integration.createMany({
                data: integrations.map((integration) => ({
                    name: integration,
                    saasToolId: tool.id,
                })),
                skipDuplicates: true,
            });
        }
        res.status(201).json({
            status: "success",
            data: {
                id: tool.id,
                name: tool.name,
                description: tool.description,
                category: tool.category,
                website: tool.website,
                logo: tool.logo,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTool = createTool;
// Update tool
const updateTool = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, category, website, logo } = req.body;
        // Check if tool exists
        const existingTool = await prisma_1.prisma.saasTool.findUnique({
            where: { id },
        });
        if (!existingTool) {
            return next(new appError_1.AppError("Tool not found", 404));
        }
        // Update tool
        const updatedTool = await prisma_1.prisma.saasTool.update({
            where: { id },
            data: {
                name: name || undefined,
                description: description || undefined,
                category: category || undefined,
                website: website || undefined,
                logo: logo || undefined,
            },
        });
        res.status(200).json({
            status: "success",
            data: updatedTool,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTool = updateTool;
// Delete tool
const deleteTool = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Check if tool exists
        const existingTool = await prisma_1.prisma.saasTool.findUnique({
            where: { id },
        });
        if (!existingTool) {
            return next(new appError_1.AppError("Tool not found", 404));
        }
        // Delete tool
        await prisma_1.prisma.saasTool.delete({
            where: { id },
        });
        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTool = deleteTool;
/**
 * Search tools based on various criteria
 */
const searchTools = async (req, res) => {
    try {
        const { query, category, minPrice, maxPrice, integrations } = req.query;
        // Build the database query
        const dbQuery = {};
        // Text search if query is provided
        if (query) {
            dbQuery.OR = [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ];
        }
        // Category filter
        if (category) {
            dbQuery.category = { equals: category };
        }
        // Price range filters - more complex and would require JOINs with pricing tables
        // This is simplified for demonstration
        // Integration filters - would require a JOIN with the integration tables
        // Also simplified here
        const tools = await prisma_1.prisma.saasTool.findMany({
            where: dbQuery,
            take: 10, // Limit to 10 results
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
                integrations: tool.integrations.map(integration => integration.name),
                lastUpdated: tool.updatedAt,
            };
        });
        return res.status(200).json({
            success: true,
            data: formattedTools
        });
    }
    catch (error) {
        logger_1.logger.error('Error searching tools', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to search tools'
        });
    }
};
exports.searchTools = searchTools;
/**
 * Get historical pricing data for a tool
 */
const getToolHistoricalData = async (req, res) => {
    try {
        const { id } = req.params;
        // Check if tool exists
        const tool = await prisma_1.prisma.saasTool.findUnique({
            where: { id }
        });
        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }
        // Get historical pricing data
        const historicalData = await prisma_1.prisma.pricingHistory.findMany({
            where: {
                toolId: id
            },
            orderBy: {
                timestamp: 'asc'
            }
        });
        // Format the data
        const formattedData = formatHistoricalData([id], historicalData);
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
exports.getToolHistoricalData = getToolHistoricalData;
/**
 * Get featured tools
 */
const getFeaturedTools = async (req, res) => {
    try {
        // In a real app, you'd have a featured flag or table
        // Here we just return some tools as featured
        const featuredTools = await prisma_1.prisma.saasTool.findMany({
            take: 6,
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
        // Format the response
        const formattedTools = featuredTools.map((tool) => {
            return {
                id: tool.id,
                name: tool.name,
                logo: tool.logo,
                description: tool.description,
                category: tool.category,
                website: tool.website,
                pricing: formatPricingPlans(tool.pricingPlans),
                integrations: tool.integrations.map(integration => integration.name),
                lastUpdated: tool.updatedAt,
            };
        });
        return res.status(200).json({
            success: true,
            data: formattedTools
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting featured tools', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get featured tools'
        });
    }
};
exports.getFeaturedTools = getFeaturedTools;
/**
 * Get popular tools
 */
const getPopularTools = async (req, res) => {
    try {
        // In a real app, you'd determine popularity by usage metrics
        // Here we just return some tools as popular
        const popularTools = await prisma_1.prisma.saasTool.findMany({
            take: 6,
            orderBy: {
                createdAt: 'desc' // Just using recent tools as a proxy for popular
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
        // Format the response
        const formattedTools = popularTools.map((tool) => {
            return {
                id: tool.id,
                name: tool.name,
                logo: tool.logo,
                description: tool.description,
                category: tool.category,
                website: tool.website,
                pricing: formatPricingPlans(tool.pricingPlans),
                integrations: tool.integrations.map(integration => integration.name),
                lastUpdated: tool.updatedAt,
            };
        });
        return res.status(200).json({
            success: true,
            data: formattedTools
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting popular tools', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get popular tools'
        });
    }
};
exports.getPopularTools = getPopularTools;
/**
 * Scrape tool data from a website
 */
const scrapeToolData = async (req, res, next) => {
    try {
        const { url, toolId } = req.body;
        // Check if the URL is valid
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL is required for scraping'
            });
        }
        // If toolId is provided, check if it exists
        if (toolId) {
            const existingTool = await prisma_1.prisma.saasTool.findUnique({
                where: { id: toolId }
            });
            if (!existingTool) {
                return res.status(404).json({
                    success: false,
                    message: 'Tool not found'
                });
            }
        }
        // Create a scraping job
        const job = await prisma_1.prisma.scrapingJob.create({
            data: {
                url,
                toolId: toolId || null,
                type: 'PRICING',
                status: 'PENDING',
                schedule: 'ONCE',
                createdBy: req.user?.id
            }
        });
        // Start scraping process asynchronously
        scrapingService.scrapePricingPage(url)
            .then(async (data) => {
            // Update the tool if toolId was provided
            if (toolId) {
                // Update basic info
                await prisma_1.prisma.saasTool.update({
                    where: { id: toolId },
                    data: {
                        description: data.description || undefined,
                        website: data.website || undefined
                    }
                });
                // Update or create pricing plans
                for (const plan of data.pricingPlans) {
                    // Find existing plan with the same name or create a new one
                    const existingPlan = await prisma_1.prisma.pricingPlan.findFirst({
                        where: {
                            saasToolId: toolId,
                            name: plan.name
                        }
                    });
                    if (existingPlan) {
                        // Update existing plan
                        await prisma_1.prisma.pricingPlan.update({
                            where: { id: existingPlan.id },
                            data: {
                                price: plan.price,
                                isCustomPricing: plan.price === null
                            }
                        });
                        // Update features
                        if (plan.features.length > 0) {
                            // Delete existing features
                            await prisma_1.prisma.feature.deleteMany({
                                where: { pricingPlanId: existingPlan.id }
                            });
                            // Create new features
                            await prisma_1.prisma.feature.createMany({
                                data: plan.features.map(feature => ({
                                    name: feature,
                                    pricingPlanId: existingPlan.id
                                }))
                            });
                        }
                        // Update limitations
                        if (plan.limitations.length > 0) {
                            // Delete existing limitations
                            await prisma_1.prisma.limitation.deleteMany({
                                where: { pricingPlanId: existingPlan.id }
                            });
                            // Create new limitations
                            await prisma_1.prisma.limitation.createMany({
                                data: plan.limitations.map(limitation => ({
                                    name: limitation,
                                    pricingPlanId: existingPlan.id
                                }))
                            });
                        }
                    }
                    else {
                        // Create new plan
                        const newPlan = await prisma_1.prisma.pricingPlan.create({
                            data: {
                                name: plan.name,
                                price: plan.price,
                                isCustomPricing: plan.price === null,
                                saasToolId: toolId
                            }
                        });
                        // Create features
                        if (plan.features.length > 0) {
                            await prisma_1.prisma.feature.createMany({
                                data: plan.features.map(feature => ({
                                    name: feature,
                                    pricingPlanId: newPlan.id
                                }))
                            });
                        }
                        // Create limitations
                        if (plan.limitations.length > 0) {
                            await prisma_1.prisma.limitation.createMany({
                                data: plan.limitations.map(limitation => ({
                                    name: limitation,
                                    pricingPlanId: newPlan.id
                                }))
                            });
                        }
                    }
                }
                // Update integrations
                for (const integration of data.integrations) {
                    // Find or create integration
                    let integrationRecord = await prisma_1.prisma.integration.findUnique({
                        where: { name: integration }
                    });
                    if (!integrationRecord) {
                        integrationRecord = await prisma_1.prisma.integration.create({
                            data: { name: integration }
                        });
                    }
                    // Connect integration to tool if not already connected
                    const existingConnection = await prisma_1.prisma.$queryRaw `
              SELECT * FROM "_IntegrationToSaasTool" 
              WHERE "A" = ${integrationRecord.id} AND "B" = ${toolId}
            `;
                    if (Array.isArray(existingConnection) && !existingConnection.length) {
                        await prisma_1.prisma.$executeRaw `
                INSERT INTO "_IntegrationToSaasTool" ("A", "B") 
                VALUES (${integrationRecord.id}, ${toolId})
              `;
                    }
                }
            }
            // Update the job with success result
            await prisma_1.prisma.scrapingJob.update({
                where: { id: job.id },
                data: {
                    status: 'COMPLETED',
                    result: JSON.stringify(data),
                    completedAt: new Date()
                }
            });
        })
            .catch(async (error) => {
            // Update the job with error
            await prisma_1.prisma.scrapingJob.update({
                where: { id: job.id },
                data: {
                    status: 'FAILED',
                    error: error instanceof Error ? error.message : String(error),
                    completedAt: new Date()
                }
            });
        });
        return res.status(202).json({
            success: true,
            message: 'Scraping job created and started',
            data: {
                jobId: job.id,
                status: job.status
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error initiating scraping job:', error);
        return next(error);
    }
};
exports.scrapeToolData = scrapeToolData;
// Helper function to format tool response
const formatToolResponse = (tool) => {
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
};
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
// Helper function to format historical data
function formatHistoricalData(toolIds, historicalData) {
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
/**
 * Get tools by category
 */
const getToolsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        // Validate the category parameter
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Category is required'
            });
        }
        const tools = await prisma_1.prisma.saasTool.findMany({
            where: {
                category
            },
            include: {
                pricingPlans: {
                    include: {
                        features: true,
                        limitations: true
                    }
                },
                integrations: true
            }
        });
        // Format the tools for the response
        const formattedTools = tools.map(tool => ({
            id: tool.id,
            name: tool.name,
            description: tool.description,
            logo: tool.logo,
            website: tool.website,
            category: tool.category,
            pricing: formatPricingPlans(tool.pricingPlans),
            integrations: tool.integrations.map(integration => integration.name),
            lastUpdated: tool.updatedAt
        }));
        return res.status(200).json({
            success: true,
            data: formattedTools
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting tools by category:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch tools by category'
        });
    }
};
exports.getToolsByCategory = getToolsByCategory;
/**
 * Get distinct tool categories
 */
const getToolCategories = async (req, res) => {
    try {
        // Using Prisma's findMany with distinct to get unique categories
        const categories = await prisma_1.prisma.saasTool.findMany({
            select: {
                category: true
            },
            distinct: ['category']
        });
        // Extract the category names
        const categoryNames = categories.map(c => c.category);
        return res.status(200).json({
            success: true,
            data: categoryNames
        });
    }
    catch (error) {
        logger_1.logger.error('Error getting tool categories:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch tool categories'
        });
    }
};
exports.getToolCategories = getToolCategories;
