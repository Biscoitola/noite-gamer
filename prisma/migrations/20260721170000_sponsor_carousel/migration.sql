ALTER TABLE "Sponsor" ADD COLUMN "carouselImageUrl" TEXT;
ALTER TABLE "Sponsor" ADD COLUMN "showInCarousel" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Sponsor" ADD COLUMN "carouselOrder" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "Sponsor_showInCarousel_carouselOrder_idx" ON "Sponsor"("showInCarousel", "carouselOrder");
