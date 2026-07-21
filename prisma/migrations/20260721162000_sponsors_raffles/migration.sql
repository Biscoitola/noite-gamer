ALTER TABLE "Registration" ADD COLUMN "raffleCode" TEXT;

CREATE UNIQUE INDEX "Registration_raffleCode_key" ON "Registration"("raffleCode");

CREATE TABLE "Sponsor" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "logoUrl" TEXT NOT NULL,
  "websiteUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Prize" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "sponsorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "winnerRegistrationId" TEXT,
  "drawnAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Sponsor_eventId_isActive_idx" ON "Sponsor"("eventId", "isActive");
CREATE INDEX "Prize_eventId_isActive_idx" ON "Prize"("eventId", "isActive");
CREATE INDEX "Prize_sponsorId_idx" ON "Prize"("sponsorId");
CREATE INDEX "Prize_winnerRegistrationId_idx" ON "Prize"("winnerRegistrationId");

ALTER TABLE "Sponsor" ADD CONSTRAINT "Sponsor_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_winnerRegistrationId_fkey" FOREIGN KEY ("winnerRegistrationId") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
