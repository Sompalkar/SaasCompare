import { PrismaClient } from '@prisma/client';
import { seedCloudProviders } from './cloud-provider-seed';

async function main() {
  console.log('Starting database seeding...');
  
  // Seed cloud providers
  await seedCloudProviders();
  
  // Add other seed functions here as needed
  
  console.log('All seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  }); 