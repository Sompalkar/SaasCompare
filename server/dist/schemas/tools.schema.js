"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchToolsSchema = void 0;
const zod_1 = require("zod");
exports.searchToolsSchema = zod_1.z.object({
    query: zod_1.z.object({
        query: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        minPrice: zod_1.z.string().optional(),
        maxPrice: zod_1.z.string().optional(),
        integrations: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
