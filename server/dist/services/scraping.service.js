"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapingService = void 0;
const client_1 = require("@prisma/client");
const puppeteer_1 = __importDefault(require("puppeteer"));
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
class ScrapingService {
    // Start the scraping process
    async startScraping(jobId) {
        try {
            // Update job status to PROCESSING
            await prisma.scrapingJob.update({
                where: { id: jobId },
                data: { status: "PROCESSING", startedAt: new Date() },
            });
            // Get job details
            const job = await prisma.scrapingJob.findUnique({
                where: { id: jobId },
                include: {
                    tool: true,
                },
            });
            if (!job) {
                throw new Error(`Job ${jobId} not found`);
            }
            // Scrape data based on job type
            let scrapedData = {};
            switch (job.type) {
                case "PRICING":
                    scrapedData = await this.scrapePricing(job.url);
                    break;
                case "FEATURES":
                    scrapedData = await this.scrapeFeatures(job.url);
                    break;
                case "INTEGRATIONS":
                    scrapedData = await this.scrapeIntegrations(job.url);
                    break;
                default:
                    throw new Error(`Unsupported job type: ${job.type}`);
            }
            // Process the scraped data
            await this.processScrapedData(job, scrapedData);
            // Update job status to COMPLETED
            await prisma.scrapingJob.update({
                where: { id: jobId },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    result: JSON.stringify(scrapedData),
                },
            });
            logger_1.logger.info(`Scraping job ${jobId} completed successfully`);
        }
        catch (error) {
            logger_1.logger.error(`Scraping job ${jobId} failed:`, error);
            // Update job status to FAILED
            await prisma.scrapingJob.update({
                where: { id: jobId },
                data: {
                    status: "FAILED",
                    completedAt: new Date(),
                    error: error.message,
                },
            });
        }
    }
    // Scrape pricing data
    async scrapePricing(url) {
        const browser = await puppeteer_1.default.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            // Set user agent to avoid being blocked
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            // Navigate to the URL
            await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
            // Wait for pricing content to load
            await page.waitForSelector("body", { timeout: 10000 });
            // Extract pricing data
            const pricingData = await page.evaluate(() => {
                // This is a simplified example. In a real-world scenario,
                // you would need more sophisticated selectors based on the target website.
                const plans = {};
                // Look for common pricing plan containers
                const planElements = document.querySelectorAll(".pricing-plan, .price-card, .plan, .pricing-table, .pricing-column, [class*='pricing'], [class*='plan']");
                planElements.forEach((element, index) => {
                    // Extract plan name
                    const nameElement = element.querySelector(".plan-name, .pricing-title, .title, h2, h3, [class*='title'], [class*='name']");
                    const name = nameElement ? nameElement.textContent?.trim() : `Plan ${index + 1}`;
                    // Extract price
                    const priceElement = element.querySelector(".price, .plan-price, .pricing-price, [class*='price']");
                    let price = priceElement ? priceElement.textContent?.trim() : null;
                    // Check if it's custom pricing
                    const isCustomPricing = price ? /contact|custom|enterprise|quote/i.test(price) : false;
                    // Clean up price
                    if (price) {
                        // Extract numeric value from price string
                        const priceMatch = price.match(/\$?(\d+(?:\.\d+)?)/);
                        price = priceMatch ? priceMatch[1] : null;
                    }
                    // Extract features
                    const features = [];
                    const featureElements = element.querySelectorAll(".features li, .plan-features li, .pricing-features li, ul li, [class*='feature'] li");
                    featureElements.forEach((featureElement) => {
                        const featureText = featureElement.textContent?.trim();
                        if (featureText) {
                            features.push(featureText);
                        }
                    });
                    plans[name] = {
                        price: price ? Number.parseFloat(price) : null,
                        isCustomPricing,
                        features,
                    };
                });
                return plans;
            });
            return pricingData;
        }
        finally {
            await browser.close();
        }
    }
    // Scrape features data
    async scrapeFeatures(url) {
        const browser = await puppeteer_1.default.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            // Set user agent to avoid being blocked
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            // Navigate to the URL
            await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
            // Wait for content to load
            await page.waitForSelector("body", { timeout: 10000 });
            // Extract features data
            const featuresData = await page.evaluate(() => {
                const features = [];
                // Look for feature sections
                const featureSections = document.querySelectorAll(".features, .feature-section, [class*='feature'], section, .benefits, [class*='benefit']");
                featureSections.forEach((section) => {
                    // Look for feature headings
                    const headings = section.querySelectorAll("h2, h3, h4, .title, [class*='title']");
                    headings.forEach((heading) => {
                        const headingText = heading.textContent?.trim();
                        if (headingText) {
                            features.push(headingText);
                        }
                    });
                    // Look for feature lists
                    const listItems = section.querySelectorAll("li, .feature-item, [class*='feature-item']");
                    listItems.forEach((item) => {
                        const itemText = item.textContent?.trim();
                        if (itemText) {
                            features.push(itemText);
                        }
                    });
                });
                return { features };
            });
            return featuresData;
        }
        finally {
            await browser.close();
        }
    }
    // Scrape integrations data
    async scrapeIntegrations(url) {
        const browser = await puppeteer_1.default.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            // Set user agent to avoid being blocked
            await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            // Navigate to the URL
            await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
            // Wait for content to load
            await page.waitForSelector("body", { timeout: 10000 });
            // Extract integrations data
            const integrationsData = await page.evaluate(() => {
                const integrations = [];
                // Look for integration sections
                const integrationSections = document.querySelectorAll(".integrations, .integration-section, [class*='integration'], .partners, [class*='partner']");
                integrationSections.forEach((section) => {
                    // Look for integration logos with alt text
                    const logos = section.querySelectorAll("img");
                    logos.forEach((logo) => {
                        const altText = logo.getAttribute("alt");
                        if (altText) {
                            integrations.push(altText.trim());
                        }
                    });
                    // Look for integration names in text
                    const names = section.querySelectorAll(".name, .title, h3, h4, [class*='name'], [class*='title']");
                    names.forEach((name) => {
                        const nameText = name.textContent?.trim();
                        if (nameText) {
                            integrations.push(nameText);
                        }
                    });
                });
                return { integrations };
            });
            return integrationsData;
        }
        finally {
            await browser.close();
        }
    }
    // Process the scraped data and update the database
    async processScrapedData(job, data) {
        // If no tool ID is provided, we're just scraping without updating
        if (!job.toolId) {
            return;
        }
        // Get the tool
        const tool = await prisma.saasTool.findUnique({
            where: { id: job.toolId },
            include: {
                pricingPlans: {
                    include: {
                        features: true,
                        limitations: true,
                    },
                },
                integrations: true,
            },
        });
        if (!tool) {
            throw new Error(`Tool with ID ${job.toolId} not found`);
        }
        // Process data based on job type
        switch (job.type) {
            case "PRICING":
                await this.processPricingData(tool, data);
                break;
            case "FEATURES":
                await this.processFeaturesData(tool, data);
                break;
            case "INTEGRATIONS":
                await this.processIntegrationsData(tool, data);
                break;
        }
    }
    // Process pricing data
    async processPricingData(tool, data) {
        // For each plan in the scraped data
        for (const [planName, planData] of Object.entries(data)) {
            const typedPlanData = planData;
            // Check if the plan already exists
            const existingPlan = tool.pricingPlans.find((plan) => plan.name.toLowerCase() === planName.toLowerCase());
            if (existingPlan) {
                // Update existing plan
                await prisma.pricingPlan.update({
                    where: { id: existingPlan.id },
                    data: {
                        price: typedPlanData.isCustomPricing ? null : typedPlanData.price,
                        isCustomPricing: typedPlanData.isCustomPricing,
                    },
                });
                // Process features
                for (const feature of typedPlanData.features) {
                    // Check if feature already exists
                    const existingFeature = existingPlan.features.find((f) => f.name.toLowerCase() === feature.toLowerCase());
                    if (!existingFeature) {
                        // Add new feature
                        await prisma.feature.create({
                            data: {
                                name: feature,
                                pricingPlanId: existingPlan.id,
                            },
                        });
                    }
                }
            }
            else {
                // Create new plan
                await prisma.pricingPlan.create({
                    data: {
                        name: planName,
                        price: typedPlanData.isCustomPricing ? null : typedPlanData.price,
                        isCustomPricing: typedPlanData.isCustomPricing,
                        saasToolId: tool.id,
                        features: {
                            create: typedPlanData.features.map((feature) => ({
                                name: feature,
                            })),
                        },
                    },
                });
            }
        }
    }
    // Process features data
    async processFeaturesData(tool, data) {
        // Get the first pricing plan (or create one if none exists)
        let defaultPlan = tool.pricingPlans[0];
        if (!defaultPlan) {
            defaultPlan = await prisma.pricingPlan.create({
                data: {
                    name: "Default",
                    price: null,
                    isCustomPricing: true,
                    saasToolId: tool.id,
                },
            });
        }
        // Process features
        for (const feature of data.features) {
            // Check if feature already exists
            const existingFeature = await prisma.feature.findFirst({
                where: {
                    name: feature,
                    pricingPlanId: defaultPlan.id,
                },
            });
            if (!existingFeature) {
                // Add new feature
                await prisma.feature.create({
                    data: {
                        name: feature,
                        pricingPlanId: defaultPlan.id,
                    },
                });
            }
        }
    }
    // Process integrations data
    async processIntegrationsData(tool, data) {
        // Process integrations
        for (const integration of data.integrations) {
            // Check if integration already exists
            const existingIntegration = tool.integrations.find((i) => i.name.toLowerCase() === integration.toLowerCase());
            if (!existingIntegration) {
                // Add new integration
                await prisma.saasTool.update({
                    where: { id: tool.id },
                    data: {
                        integrations: {
                            connectOrCreate: {
                                where: { name: integration },
                                create: { name: integration },
                            },
                        },
                    },
                });
            }
        }
    }
}
exports.ScrapingService = ScrapingService;
