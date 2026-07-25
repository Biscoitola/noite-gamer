CREATE TYPE "CouponDiscountType" AS ENUM ('FIXED', 'PERCENT');

CREATE TABLE "DiscountCoupon" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "CouponDiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscountCoupon_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Registration" ADD COLUMN "couponId" TEXT;
ALTER TABLE "Registration" ADD COLUMN "couponCode" TEXT;
ALTER TABLE "Registration" ADD COLUMN "couponDiscount" DECIMAL(10,2) NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "DiscountCoupon_eventId_code_key" ON "DiscountCoupon"("eventId", "code");
CREATE INDEX "DiscountCoupon_eventId_isActive_startsAt_expiresAt_idx" ON "DiscountCoupon"("eventId", "isActive", "startsAt", "expiresAt");
CREATE INDEX "Registration_couponId_idx" ON "Registration"("couponId");

ALTER TABLE "DiscountCoupon" ADD CONSTRAINT "DiscountCoupon_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "DiscountCoupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
