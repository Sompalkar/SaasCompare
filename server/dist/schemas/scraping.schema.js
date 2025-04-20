"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateScrapingJobsSchema = exports.createScrapingJobSchema = void 0;
const zod_1 = require("zod");
exports.createScrapingJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string().url("Invalid URL format"),
        type: zod_1.z.enum(["PRICING", "FEATURES", "INTEGRATIONS"], {
            errorMap: () => ({ message: "Type must be PRICING, FEATURES, or INTEGRATIONS" }),
        }),
        toolId: zod_1.z.string().optional(),
    }),
});
exports.bulkCreateScrapingJobsSchema = zod_1.z.object({
    body: zod_1.z.object({
        toolId: zod_1.z.string(),
        urls: zod_1.z.array(zod_1.z.string().url("Invalid URL format")).min(1, "At least one URL is required"),
    }),
});
