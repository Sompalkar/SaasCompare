import cron from 'node-cron';
import { logger } from '../utils/logger';
import { checkPriceChanges, sendWeeklyDigests } from './priceMonitoring.service';
import { PrismaClient } from '@prisma/client';
import { scrapePricingPage } from './scraping.service';

const prisma = new PrismaClient();

/**
 * Schedule the price change detection job to run daily
 */
export const scheduleDailyPriceCheck = (): void => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running scheduled price change detection');
    try {
      await checkPriceChanges();
      logger.info('Scheduled price change detection completed');
    } catch (error) {
      logger.error('Error in scheduled price change detection:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC' // Adjust timezone as needed
  });
  
  logger.info('Daily price check job scheduled');
};

/**
 * Schedule the weekly digest email job to run every Monday
 */
export const scheduleWeeklyDigestEmails = (): void => {
  // Run every Monday at 7:00 AM
  cron.schedule('0 7 * * 1', async () => {
    logger.info('Sending weekly price change digest emails');
    try {
      await sendWeeklyDigests();
      logger.info('Weekly digest emails sent successfully');
    } catch (error) {
      logger.error('Error sending weekly digest emails:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC' // Adjust timezone as needed
  });
  
  logger.info('Weekly digest email job scheduled');
};

/**
 * Schedule the tool data update job to run weekly
 */
export const scheduleToolDataUpdates = (): void => {
  // Run every Sunday at 1:00 AM
  cron.schedule('0 1 * * 0', async () => {
    logger.info('Starting weekly tool data update job');
    try {
      await updateToolData();
      logger.info('Weekly tool data update completed');
    } catch (error) {
      logger.error('Error updating tool data:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC' // Adjust timezone as needed
  });
  
  logger.info('Weekly tool data update job scheduled');
};

/**
 * Process scheduled scraping jobs
 */
export const scheduleScrapingJobs = (): void => {
  // Run every 4 hours
  cron.schedule('0 */4 * * *', async () => {
    logger.info('Processing scheduled scraping jobs');
    try {
      await processScheduledScrapingJobs();
      logger.info('Scheduled scraping jobs processed');
    } catch (error) {
      logger.error('Error processing scheduled scraping jobs:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });
  
  logger.info('Scraping job processor scheduled');
};

/**
 * Update tool data from their websites
 */
async function updateToolData(): Promise<void> {
  try {
    // Get all tools that have websites
    const tools = await prisma.saasTool.findMany({
      where: {
        website: {
          not: ''
        }
      },
      select: {
        id: 'true',
        name: true,
        website: true,
        updatedAt: true
      }
    });
    
    logger.info(`Found ${tools.length} tools to check for updates`);
    
    // Process each tool - limit concurrency to avoid overwhelming resources
    for (const tool of tools) {
      try {
        // Create a scraping job for the tool
        await prisma.scrapingJob.create({
          data: {
            url: tool.website,
            toolId: tool.id,
            type: 'PRICING',
            status: 'PENDING',
            schedule: 'WEEKLY',
            createdBy: 'SYSTEM'
          }
        });
        
        logger.info(`Created weekly update job for ${tool.name}`);
      } catch (error) {
        logger.error(`Error creating scraping job for ${tool.name}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in updateToolData:', error);
    throw error;
  }
}

/**
 * Process all pending scheduled scraping jobs
 */
async function processScheduledScrapingJobs(): Promise<void> {
  try {
    // Get all pending scraping jobs
    const pendingJobs = await prisma.scrapingJob.findMany({
      where: {
        status: 'PENDING',
        schedule: {
          not: 'ONCE' // Only get recurring jobs
        }
      },
      take: 10 // Process in batches to avoid overloading
    });
    
    logger.info(`Processing ${pendingJobs.length} pending scraping jobs`);
    
    // Process each job
    for (const job of pendingJobs) {
      try {
        // Update job status to processing
        await prisma.scrapingJob.update({
          where: { id: job.id },
          data: {
            status: 'PROCESSING',
            startedAt: new Date()
          }
        });
        
        // Perform scraping
        const scrapingResult = await scrapePricingPage(job.url);
        
        // Update the tool with the new data
        if (job.toolId) {
          await prisma.saasTool.update({
            where: { id: job.toolId },
            data: {
              description: scrapingResult.description || undefined,
              // Update other fields as needed
              updatedAt: new Date()
            }
          });
          
          // Store pricing information in pricing history
          if (scrapingResult.pricingPlans && scrapingResult.pricingPlans.length > 0) {
            // First, mark all existing pricing history for this tool as not latest
            await prisma.pricingHistory.updateMany({
              where: {
                toolId: job.toolId,
                isLatest: true
              },
              data: {
                isLatest: false
              }
            });
            
            // Then add new pricing records
            for (const plan of scrapingResult.pricingPlans) {
              if (plan.price !== null) {
                await prisma.pricingHistory.create({
                  data: {
                    toolId: job.toolId,
                    tier: plan.name,
                    plan: 'monthly', // Adjust as needed based on your data
                    price: plan.price,
                    isLatest: true,
                    timestamp: new Date()
                  }
                });
              }
            }
          }
        }
        
        // Mark job as completed
        await prisma.scrapingJob.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            result: JSON.stringify(scrapingResult),
            completedAt: new Date()
          }
        });
        
        logger.info(`Successfully processed scraping job ${job.id}`);
      } catch (error) {
        // Update job as failed
        await prisma.scrapingJob.update({
          where: { id: job.id },
          data: {
            status: 'FAILED',
            error: error.message || 'Unknown error',
            completedAt: new Date()
          }
        });
        
        logger.error(`Failed to process scraping job ${job.id}:`, error);
      }
    }
  } catch (error) {
    logger.error('Error in processScheduledScrapingJobs:', error);
    throw error;
  }
}

/**
 * Start all scheduler jobs
 */
export const startScheduler = (): void => {
  try {
    scheduleDailyPriceCheck();
    scheduleWeeklyDigestEmails();
    scheduleToolDataUpdates();
    scheduleScrapingJobs();
    logger.info('All scheduler jobs started successfully');
  } catch (error) {
    logger.error('Error starting scheduler jobs:', error);
  }
}; 