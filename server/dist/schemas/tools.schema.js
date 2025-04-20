"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolsSchema = void 0;
const zod_1 = require("zod");
// Create tool schema
const createToolSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required"),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().min(1, "Category is required"),
        website: zod_1.z.string().url("Website must be a valid URL"),
        logo: zod_1.z.string().optional(),
        pricingPlans: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string().min(1, "Plan name is required"),
            price: zod_1.z.number().nullable(),
            isCustomPricing: zod_1.z.boolean().default(false),
            features: zod_1.z.array(zod_1.z.string()).optional(),
            limitations: zod_1.z.array(zod_1.z.string()).optional(),
        }))
            .optional(),
        integrations: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
// Update tool schema
const updateToolSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, "Name is required").optional(),
        description: zod_1.z.string().optional(),
        category: zod_1.z.string().min(1, "Category is required").optional(),
        website: zod_1.z.string().url("Website must be a valid URL").optional(),
        logo: zod_1.z.string().optional(),
        pricingPlans: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string().min(1, "Plan name is required"),
            price: zod_1.z.number().nullable(),
            isCustomPricing: zod_1.z.boolean().default(false),
            features: zod_1.z.array(zod_1.z.string()).optional(),
            limitations: zod_1.z.array(zod_1.z.string()).optional(),
        }))
            .optional(),
        integrations: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
// Search tools schema
const searchToolsSchema = zod_1.z.object({
    query: zod_1.z.object({
        query: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        minPrice: zod_1.z.string().optional(),
        maxPrice: zod_1.z.string().optional(),
        integrations: zod_1.z.string().optional(),
    }),
});
// Scrape tool data schema
const scrapeToolDataSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string().url("URL must be valid"),
        toolId: zod_1.z.string().uuid("Tool ID must be a valid UUID").optional(),
    }),
});
// Export all schemas
exports.toolsSchema = {
    createTool: createToolSchema,
    updateTool: updateToolSchema,
    searchTools: searchToolsSchema,
    scrapeToolData: scrapeToolDataSchema,
};
