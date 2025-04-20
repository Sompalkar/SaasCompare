"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudProvidersSchema = exports.saveComparisonSchema = exports.compareProvidersSchema = void 0;
const zod_1 = require("zod");
// Compare providers schema
exports.compareProvidersSchema = zod_1.z.object({
    body: zod_1.z.object({
        providers: zod_1.z.array(zod_1.z.string()).min(1, "At least one provider is required"),
        serviceTypes: zod_1.z.array(zod_1.z.string()).min(1, "At least one service type is required"),
    }),
});
// Save comparison schema
exports.saveComparisonSchema = zod_1.z.object({
    body: zod_1.z.object({
        id: zod_1.z.string().min(1, "Comparison ID is required"),
        name: zod_1.z.string().min(1, "Name is required"),
    }),
});
// Export all schemas
exports.cloudProvidersSchema = {
    compareProviders: exports.compareProvidersSchema,
    saveComparison: exports.saveComparisonSchema,
};
