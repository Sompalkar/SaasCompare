"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDFReport = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generatePDFReport = async (comparison, outputDir, aiInsights) => {
    return new Promise((resolve, reject) => {
        try {
            // Create filename and path
            const filename = `comparison-report-${Date.now()}.pdf`;
            const filePath = path_1.default.join(outputDir, filename);
            // Create PDF document
            const doc = new pdfkit_1.default({ margin: 50 });
            const stream = fs_1.default.createWriteStream(filePath);
            // Handle stream events
            stream.on("finish", () => {
                resolve(filePath);
            });
            stream.on("error", (err) => {
                reject(err);
            });
            // Pipe document to stream
            doc.pipe(stream);
            // Add title
            doc.fontSize(24).text("SaaS Comparison Report", { align: "center" });
            doc.moveDown();
            // Add date
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });
            doc.moveDown(2);
            // Add executive summary if available
            if (aiInsights?.executiveSummary) {
                doc.fontSize(18).text("Executive Summary", { underline: true });
                doc.moveDown();
                doc.fontSize(12).text(aiInsights.executiveSummary);
                doc.moveDown(2);
            }
            // Add tools comparison table
            doc.fontSize(18).text("Tools Comparison", { underline: true });
            doc.moveDown();
            // Create a table-like structure for tools
            const toolNames = comparison.tools.map((tool) => tool.name);
            doc.fontSize(14).text("Pricing Plans", { underline: true });
            doc.moveDown();
            // Add pricing plans for each tool
            comparison.tools.forEach((tool) => {
                doc.fontSize(14).text(tool.name, { underline: true });
                doc.moveDown();
                tool.pricingPlans.forEach((plan) => {
                    doc.fontSize(12).text(`${plan.name}: ${plan.price !== null ? `$${plan.price}` : "Custom pricing"}`);
                    doc.moveDown(0.5);
                    doc.fontSize(10).text("Features:");
                    plan.features.forEach((feature) => {
                        doc.text(`• ${feature}`);
                    });
                    if (plan.limitations.length > 0) {
                        doc.moveDown(0.5);
                        doc.text("Limitations:");
                        plan.limitations.forEach((limitation) => {
                            doc.text(`• ${limitation}`);
                        });
                    }
                    doc.moveDown();
                });
                doc.moveDown();
            });
            // Add feature comparison
            doc.addPage();
            doc.fontSize(18).text("Feature Comparison", { underline: true });
            doc.moveDown();
            // Create a table for features
            const featureY = doc.y;
            const maxWidth = 150;
            // Draw header
            doc.fontSize(12).text("Feature", { width: maxWidth });
            let xPosition = maxWidth + 50;
            comparison.tools.forEach((tool) => {
                doc.text(tool.name, xPosition, featureY, { width: 100 });
                xPosition += 100;
            });
            doc.moveDown();
            // Draw feature rows
            comparison.features.forEach((feature) => {
                const rowY = doc.y;
                doc.fontSize(10).text(feature, { width: maxWidth });
                xPosition = maxWidth + 50;
                comparison.tools.forEach((tool) => {
                    const hasFeature = tool.features.includes(feature);
                    doc.text(hasFeature ? "✓" : "✗", xPosition, rowY, { width: 100 });
                    xPosition += 100;
                });
                doc.moveDown(0.5);
            });
            // Add AI insights if available
            if (aiInsights) {
                // Add detailed analysis
                if (aiInsights.detailedAnalysis) {
                    doc.addPage();
                    doc.fontSize(18).text("Detailed Analysis", { underline: true });
                    doc.moveDown();
                    doc.fontSize(12).text(aiInsights.detailedAnalysis);
                    doc.moveDown(2);
                }
                // Add recommendations
                if (aiInsights.recommendations) {
                    doc.addPage();
                    doc.fontSize(18).text("Recommendations", { underline: true });
                    doc.moveDown();
                    doc.fontSize(12).text(aiInsights.recommendations);
                    doc.moveDown(2);
                }
                // Add pricing analysis
                if (aiInsights.pricingAnalysis) {
                    doc.addPage();
                    doc.fontSize(18).text("Pricing Analysis", { underline: true });
                    doc.moveDown();
                    doc.fontSize(12).text(aiInsights.pricingAnalysis);
                    doc.moveDown(2);
                }
                // Add market positioning
                if (aiInsights.marketPositioning) {
                    doc.addPage();
                    doc.fontSize(18).text("Market Positioning", { underline: true });
                    doc.moveDown();
                    doc.fontSize(12).text(aiInsights.marketPositioning);
                    doc.moveDown(2);
                }
                // Add future trends
                if (aiInsights.futureTrends) {
                    doc.addPage();
                    doc.fontSize(18).text("Future Trends", { underline: true });
                    doc.moveDown();
                    doc.fontSize(12).text(aiInsights.futureTrends);
                    doc.moveDown(2);
                }
            }
            // Finalize the PDF
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generatePDFReport = generatePDFReport;
