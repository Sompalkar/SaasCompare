"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const cloud_provider_seed_1 = require("./cloud-provider-seed");
async function main() {
    console.log('Starting database seeding...');
    // Seed cloud providers
    await (0, cloud_provider_seed_1.seedCloudProviders)();
    // Add other seed functions here as needed
    console.log('All seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    const prisma = new client_1.PrismaClient();
    await prisma.$disconnect();
});
