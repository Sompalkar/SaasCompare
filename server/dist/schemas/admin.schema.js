"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.updateToolSchema = exports.createToolSchema = void 0;
const zod_1 = require("zod");
exports.createToolSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Tool name must be at least 2 characters"),
        description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
        logo: zod_1.z.string().url("Logo must be a valid URL"),
        website: zod_1.z.string().url("Website must be a valid URL"),
        category: zod_1.z.string(),
        pricingPlans: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            price: zod_1.z.number().nullable(),
            isCustomPricing: zod_1.z.boolean().optional(),
            features: zod_1.z.array(zod_1.z.string()),
            limitations: zod_1.z.array(zod_1.z.string()).optional(),
        })),
        integrations: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateToolSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Tool name must be at least 2 characters").optional(),
        description: zod_1.z.string().min(10, "Description must be at least 10 characters").optional(),
        logo: zod_1.z.string().url("Logo must be a valid URL").optional(),
        website: zod_1.z.string().url("Website must be a valid URL").optional(),
        category: zod_1.z.string().optional(),
        pricingPlans: zod_1.z
            .array(zod_1.z.object({
            id: zod_1.z.string().optional(),
            name: zod_1.z.string(),
            price: zod_1.z.number().nullable(),
            isCustomPricing: zod_1.z.boolean().optional(),
            features: zod_1.z.array(zod_1.z.string()),
            limitations: zod_1.z.array(zod_1.z.string()).optional(),
        }))
            .optional(),
        integrations: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
        email: zod_1.z.string().email("Invalid email address").optional(),
        role: zod_1.z.enum(["USER", "ADMIN"]).optional(),
        plan: zod_1.z.enum(["FREE", "PRO", "ENTERPRISE"]).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
