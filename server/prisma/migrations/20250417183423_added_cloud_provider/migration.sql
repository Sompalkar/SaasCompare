-- CreateEnum
CREATE TYPE "ComparisonType" AS ENUM ('SAAS_TOOL', 'CLOUD_PROVIDER');

-- AlterTable
ALTER TABLE "Comparison" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "CloudProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CloudService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "freePrice" DOUBLE PRECISION,
    "freeFeatures" TEXT[],
    "freeLimitations" TEXT[],
    "basicPrice" DOUBLE PRECISION,
    "basicFeatures" TEXT[],
    "basicLimitations" TEXT[],
    "standardPrice" DOUBLE PRECISION,
    "standardFeatures" TEXT[],
    "standardLimitations" TEXT[],
    "premiumPrice" DOUBLE PRECISION,
    "premiumFeatures" TEXT[],
    "premiumLimitations" TEXT[],
    "enterprisePrice" DOUBLE PRECISION,
    "enterpriseFeatures" TEXT[],
    "enterpriseLimitations" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CloudService_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CloudService" ADD CONSTRAINT "CloudService_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "CloudProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
