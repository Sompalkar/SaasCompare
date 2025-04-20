"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seed_data_1 = require("../utils/seed-data");
const cloud_provider_seed_1 = require("../utils/cloud-provider-seed");
const logger_1 = require("../utils/logger");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Main seed function that executes the seeding process
 */
async function main() {
    logger_1.logger.info('Starting database seeding process...');
    try {
        // Check if database already has tools
        const toolCount = await prisma.saasTool.count();
        if (toolCount > 0) {
            logger_1.logger.info(`Database already has ${toolCount} tools. Use --force to override.`);
            // Check if --force flag is present
            if (process.argv.includes('--force')) {
                logger_1.logger.info('Force flag detected. Clearing existing data...');
                // Clear existing data in reverse order of dependencies
                await prisma.$transaction([
                    prisma.feature.deleteMany({}),
                    prisma.limitation.deleteMany({}),
                    prisma.pricingPlan.deleteMany({}),
                    prisma.saasTool.deleteMany({}),
                    prisma.integration.deleteMany({})
                ]);
                logger_1.logger.info('Database cleared. Running seed...');
                await (0, seed_data_1.seedTools)();
            }
            else {
                logger_1.logger.info('Skipping SaaS tools seed. Use --force to override existing data.');
            }
        }
        else {
            logger_1.logger.info('Empty database detected. Running SaaS tools seed...');
            await (0, seed_data_1.seedTools)();
        }
        // Check if database already has cloud providers
        const cloudProviderCount = await prisma.cloudProvider.count();
        if (cloudProviderCount > 0) {
            logger_1.logger.info(`Database already has ${cloudProviderCount} cloud providers. Use --force to override.`);
            // Check if --force flag is present
            if (process.argv.includes('--force')) {
                logger_1.logger.info('Force flag detected. Clearing existing cloud data...');
                // Clear existing cloud data in reverse order of dependencies
                await prisma.$transaction([
                    prisma.cloudService.deleteMany({}),
                    prisma.cloudProvider.deleteMany({})
                ]);
                logger_1.logger.info('Cloud data cleared. Running cloud seed...');
                await (0, cloud_provider_seed_1.seedCloudData)();
            }
            else {
                logger_1.logger.info('Skipping cloud data seed. Use --force to override existing data.');
            }
        }
        else {
            logger_1.logger.info('No cloud providers detected. Running cloud data seed...');
            await (0, cloud_provider_seed_1.seedCloudData)();
        }
        logger_1.logger.info('Database seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during database seeding:', error);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Execute the seed function
main();
