"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportSchema = void 0;
const zod_1 = require("zod");
exports.generateReportSchema = zod_1.z.object({
    body: zod_1.z.object({
        comparisonId: zod_1.z.string(),
        format: zod_1.z.enum(["pdf", "excel", "ppt"], {
            errorMap: () => ({ message: "Format must be pdf, excel, or ppt" }),
        }),
        includeCharts: zod_1.z.boolean().optional().default(false),
    }),
});
