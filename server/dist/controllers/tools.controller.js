"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTools = exports.getToolsByCategory = exports.getToolById = exports.getAllTools = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Get all tools with optional pagination
const getAllTools = async (req, res, next) => {
    try {
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get total count for pagination
        const totalCount = await prisma.saasTool.count();
        // Get tools with pagination
        const tools = await prisma.saasTool.findMany({
            skip,
            take: limit,
            include: {
                pricingPlans: {
                    include: {
                        features: true,
                        limitations: true,
                    },
                },
                integrations: true,
            },
            orderBy: {
                name: "asc",
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
            results: tools.length,
            pagination: {
                total: totalCount,
                page,
                pages: Math.ceil(totalCount / limit),
                limit,
            },
            data: formattedTools,
        });
    }
    catch (error) {
        logger_1.logger.error("Get all tools error:", error);
        next(error);
    }
};
exports.getAllTools = getAllTools;
// Get tool by ID
const getToolById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const tool = await prisma.saasTool.findUnique({
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
        const formattedTool = {
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
        res.status(200).json({
            status: "success",
            data: formattedTool,
        });
    }
    catch (error) {
        logger_1.logger.error("Get tool by ID error:", error);
        next(error);
    }
};
exports.getToolById = getToolById;
// Get tools by category
const getToolsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Get total count for pagination
        const totalCount = await prisma.saasTool.count({
            where: { category },
        });
        // Get tools by category with pagination
        const tools = await prisma.saasTool.findMany({
            where: { category },
            skip,
            take: limit,
            include: {
                pricingPlans: {
                    include: {
                        features: true,
                        limitations: true,
                    },
                },
                integrations: true,
            },
            orderBy: {
                name: "asc",
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
            results: tools.length,
            pagination: {
                total: totalCount,
                page,
                pages: Math.ceil(totalCount / limit),
                limit,
            },
            data: formattedTools,
        });
    }
    catch (error) {
        logger_1.logger.error("Get tools by category error:", error);
        next(error);
    }
};
exports.getToolsByCategory = getToolsByCategory;
// Search tools
const searchTools = async (req, res, next) => {
    try {
        const { query, category, minPrice, maxPrice, integrations } = req.query;
        const page = Number.parseInt(req.query.page) || 1;
        const limit = Number.parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Build the where clause
        const where = {};
        // Search by name or description
        if (query) {
            where.OR = [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ];
        }
        // Filter by category
        if (category) {
            where.category = category;
        }
        // Get tools with filters
        const tools = await prisma.saasTool.findMany({
            where,
            skip,
            take: limit,
            include: {
                pricingPlans: {
                    include: {
                        features: true,
                        limitations: true,
                    },
                },
                integrations: true,
            },
            orderBy: {
                name: "asc",
            },
        });
        // Apply price and integration filters in memory (since they require joins)
        let filteredTools = tools;
        // Filter by price range
        if (minPrice || maxPrice) {
            filteredTools = filteredTools.filter((tool) => {
                const min = minPrice ? Number.parseFloat(minPrice) : 0;
                const max = maxPrice ? Number.parseFloat(maxPrice) : Number.POSITIVE_INFINITY;
                // Check if any pricing plan falls within the range
                return tool.pricingPlans.some((plan) => {
                    if (plan.price === null)
                        return false;
                    return plan.price >= min && plan.price <= max;
                });
            });
        }
        // Filter by integrations
        if (integrations) {
            const requiredIntegrations = integrations.split(",");
            filteredTools = filteredTools.filter((tool) => {
                const toolIntegrations = tool.integrations.map((i) => i.name.toLowerCase());
                return requiredIntegrations.every((integration) => toolIntegrations.includes(integration.toLowerCase()));
            });
        }
        // Get total count for pagination (after filtering)
        const totalCount = filteredTools.length;
        // Format the response
        const formattedTools = filteredTools.map((tool) => {
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
            results: formattedTools.length,
            pagination: {
                total: totalCount,
                page,
                pages: Math.ceil(totalCount / limit),
                limit,
            },
            data: formattedTools,
        });
    }
    catch (error) {
        logger_1.logger.error("Search tools error:", error);
        next(error);
    }
};
exports.searchTools = searchTools;
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
