-- Configure the current edition once. Existing registrations and payments keep their amounts.
UPDATE "Event"
SET "settings" = "settings" || '{"comboEnabled":true,"comboPrice":24.90,"showPrizePool":true,"prizePoolPercent":90}'::jsonb,
    "updatedAt" = CURRENT_TIMESTAMP
WHERE "status" = 'ACTIVE';

UPDATE "Game"
SET "price" = 15.00, "updatedAt" = CURRENT_TIMESTAMP
WHERE "isActive" = true
  AND "eventId" IN (SELECT "id" FROM "Event" WHERE "status" = 'ACTIVE');
