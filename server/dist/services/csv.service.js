"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCSVReport = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_stringify_1 = require("csv-stringify");
const generateCSVReport = async (comparison, outputDir) => {
    return new Promise((resolve, reject) => {
        try {
            // Create filename and path
            const filename = `comparison-report-${Date.now()}.csv`;
            const filePath = path_1.default.join(outputDir, filename);
            // Prepare data for CSV
            const headers = ["Feature", ...comparison.tools.map((tool) => tool.name)];
            const rows = [headers];
            // Add feature rows
            comparison.features.forEach((feature) => {
                const row = [feature];
                comparison.tools.forEach((tool) => {
                    const hasFeature = tool.features.includes(feature);
                    row.push(hasFeature ? "Yes" : "No");
                });
                rows.push(row);
            });
            // Add pricing rows
            rows.push(["", ""]);
            rows.push(["Pricing Plans", ""]);
            // Find the maximum number of pricing plans
            const maxPlans = Math.max(...comparison.tools.map((tool) => tool.pricingPlans.length));
            for (let i = 0; i < maxPlans; i++) {
                const planRow = [`Plan ${i + 1}`];
                comparison.tools.forEach((tool) => {
                    const plan = tool.pricingPlans[i];
                    planRow.push(plan ? `${plan.name}: ${plan.price !== null ? `$${plan.price}` : "Custom"}` : "");
                });
                rows.push(planRow);
            }
            // Write to CSV file
            (0, csv_stringify_1.stringify)(rows, (err, output) => {
                if (err) {
                    reject(err);
                    return;
                }
                fs_1.default.writeFile(filePath, output, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(filePath);
                });
            });
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateCSVReport = generateCSVReport;
