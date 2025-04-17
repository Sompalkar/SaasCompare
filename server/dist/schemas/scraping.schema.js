"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createScrapingJobSchema = void 0;
const zod_1 = require("zod");
exports.createScrapingJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        url: zod_1.z.string().url("Must be a valid URL"),
        toolId: zod_1.z.string().optional(),
        type: zod_1.z.enum(["PRICING", "FEATURES", "INTEGRATIONS"]),
        schedule: zod_1.z.enum(["ONCE", "DAILY", "WEEKLY", "MONTHLY"]).optional(),
    }),
});
