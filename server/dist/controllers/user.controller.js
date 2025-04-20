"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserReports = exports.updateUserProfile = exports.deleteComparison = exports.saveComparison = exports.getSavedComparisonById = exports.getUserComparisons = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
// Get user's saved comparisons
const getUserComparisons = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const savedComparisons = await prisma.savedComparison.findMany({
            where: { userId },
            include: {
                comparison: {
                    include: {
                        tools: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                category: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({
            status: "success",
            results: savedComparisons.length,
            data: savedComparisons,
        });
    }
    catch (error) {
        logger_1.logger.error("Get user comparisons error:", error);
        next(error);
    }
};
exports.getUserComparisons = getUserComparisons;
// Get a specific saved comparison by ID
const getSavedComparisonById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const savedComparison = await prisma.savedComparison.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                comparison: {
                    include: {
                        tools: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });
        if (!savedComparison) {
            return next(new appError_1.AppError("Saved comparison not found", 404));
        }
        res.status(200).json({
            status: "success",
            data: savedComparison,
        });
    }
    catch (error) {
        logger_1.logger.error("Get saved comparison by ID error:", error);
        next(error);
    }
};
exports.getSavedComparisonById = getSavedComparisonById;
// Save a comparison
const saveComparison = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { comparisonId, name } = req.body;
        // Check if comparison exists
        const comparison = await prisma.comparison.findUnique({
            where: { id: comparisonId },
        });
        if (!comparison) {
            return next(new appError_1.AppError("Comparison not found", 404));
        }
        // Check if user has already saved this comparison
        const existingSaved = await prisma.savedComparison.findFirst({
            where: {
                userId,
                comparisonId,
            },
        });
        if (existingSaved) {
            return next(new appError_1.AppError("You have already saved this comparison", 400));
        }
        // Save the comparison
        const savedComparison = await prisma.savedComparison.create({
            data: {
                name,
                userId,
                comparisonId,
            },
            include: {
                comparison: {
                    include: {
                        tools: {
                            select: {
                                id: true,
                                name: true,
                                logo: true,
                                category: true,
                            },
                        },
                    },
                },
            },
        });
        res.status(201).json({
            status: "success",
            data: savedComparison,
        });
    }
    catch (error) {
        logger_1.logger.error("Save comparison error:", error);
        next(error);
    }
};
exports.saveComparison = saveComparison;
// Delete a saved comparison
const deleteComparison = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        // Check if saved comparison exists and belongs to user
        const savedComparison = await prisma.savedComparison.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!savedComparison) {
            return next(new appError_1.AppError("Saved comparison not found", 404));
        }
        // Delete the saved comparison
        await prisma.savedComparison.delete({
            where: { id },
        });
        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        logger_1.logger.error("Delete comparison error:", error);
        next(error);
    }
};
exports.deleteComparison = deleteComparison;
// Update user profile
const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { name, email, company, jobTitle } = req.body;
        // Check if email is already taken
        if (email && email !== req.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                return next(new appError_1.AppError("Email is already taken", 400));
            }
        }
        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name || undefined,
                email: email || undefined,
                company: company || undefined,
                jobTitle: jobTitle || undefined,
            },
        });
        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json({
            status: "success",
            data: userWithoutPassword,
        });
    }
    catch (error) {
        logger_1.logger.error("Update user profile error:", error);
        next(error);
    }
};
exports.updateUserProfile = updateUserProfile;
// Get user reports
const getUserReports = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const reports = await prisma.report.findMany({
            where: { userId },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({
            status: "success",
            results: reports.length,
            data: reports,
        });
    }
    catch (error) {
        logger_1.logger.error("Get user reports error:", error);
        next(error);
    }
};
exports.getUserReports = getUserReports;
