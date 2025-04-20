import { seedTools } from '../utils/seed-data';
import { seedCloudData } from '../utils/cloud-provider-seed';
import { logger } from '../utils/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Main seed function that executes the seeding process
 */
async function main() {
  logger.info('Starting database seeding process...');
  
  try {
    // Check if database already has tools
    const toolCount = await prisma.saasTool.count();
    if (toolCount > 0) {
      logger.info(`Database already has ${toolCount} tools. Use --force to override.`);
      
      // Check if --force flag is present
      if (process.argv.includes('--force')) {
        logger.info('Force flag detected. Clearing existing data...');
        
        // Clear existing data in reverse order of dependencies
        await prisma.$transaction([
          prisma.feature.deleteMany({}),
          prisma.limitation.deleteMany({}),
          prisma.pricingPlan.deleteMany({}),
          prisma.saasTool.deleteMany({}),
          prisma.integration.deleteMany({})
        ]);
        
        logger.info('Database cleared. Running seed...');
        await seedTools();
      } else {
        logger.info('Skipping SaaS tools seed. Use --force to override existing data.');
      }
    } else {
      logger.info('Empty database detected. Running SaaS tools seed...');
      await seedTools();
    }
    
    // Check if database already has cloud providers
    const cloudProviderCount = await prisma.cloudProvider.count();
    if (cloudProviderCount > 0) {
      logger.info(`Database already has ${cloudProviderCount} cloud providers. Use --force to override.`);
      
      // Check if --force flag is present
      if (process.argv.includes('--force')) {
        logger.info('Force flag detected. Clearing existing cloud data...');
        
        // Clear existing cloud data in reverse order of dependencies
        await prisma.$transaction([
          prisma.cloudService.deleteMany({}),
          prisma.cloudProvider.deleteMany({})
        ]);
        
        logger.info('Cloud data cleared. Running cloud seed...');
        await seedCloudData();
      } else {
        logger.info('Skipping cloud data seed. Use --force to override existing data.');
      }
    } else {
      logger.info('No cloud providers detected. Running cloud data seed...');
      await seedCloudData();
    }
    
    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed function
main();