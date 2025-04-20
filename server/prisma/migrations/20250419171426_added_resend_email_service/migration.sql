-- AlterTable
ALTER TABLE "User" ADD COLUMN     "priceAlertSubscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceAlertThreshold" DOUBLE PRECISION NOT NULL DEFAULT 5,
ADD COLUMN     "weeklyDigestSubscription" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PricingHistory" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PricingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceChangeLog" (
    "id" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "plan" TEXT NOT NULL,
    "oldPrice" DOUBLE PRECISION NOT NULL,
    "newPrice" DOUBLE PRECISION NOT NULL,
    "changePercentage" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToolSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PricingHistory_toolId_tier_plan_idx" ON "PricingHistory"("toolId", "tier", "plan");

-- CreateIndex
CREATE INDEX "PriceChangeLog_toolId_timestamp_idx" ON "PriceChangeLog"("toolId", "timestamp");

-- CreateIndex
CREATE INDEX "Notification_userId_type_read_idx" ON "Notification"("userId", "type", "read");

-- CreateIndex
CREATE UNIQUE INDEX "ToolSubscription_userId_toolId_key" ON "ToolSubscription"("userId", "toolId");

-- AddForeignKey
ALTER TABLE "PricingHistory" ADD CONSTRAINT "PricingHistory_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "SaasTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceChangeLog" ADD CONSTRAINT "PriceChangeLog_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "SaasTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSubscription" ADD CONSTRAINT "ToolSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToolSubscription" ADD CONSTRAINT "ToolSubscription_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "SaasTool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
