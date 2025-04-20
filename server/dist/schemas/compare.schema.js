"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareToolsSchema = void 0;
const zod_1 = require("zod");
exports.compareToolsSchema = zod_1.z.object({
    body: zod_1.z.object({
        toolIds: zod_1.z.array(zod_1.z.string()).min(2, "At least 2 tools must be selected for comparison"),
        features: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
