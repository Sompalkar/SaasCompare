"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.saveComparisonSchema = void 0;
const zod_1 = require("zod");
exports.saveComparisonSchema = zod_1.z.object({
    body: zod_1.z.object({
        comparisonId: zod_1.z.string(),
        name: zod_1.z.string().min(1, "Comparison name is required"),
    }),
});
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, "Name must be at least 2 characters").optional(),
        email: zod_1.z.string().email("Invalid email address").optional(),
        company: zod_1.z.string().optional(),
        jobTitle: zod_1.z.string().optional(),
    }),
});
