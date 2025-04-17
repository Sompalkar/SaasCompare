"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComparisonById = exports.compareTools = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
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
