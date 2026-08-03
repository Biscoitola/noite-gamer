WITH active_event AS (
    SELECT "id"
    FROM "Event"
    WHERE "status" = 'ACTIVE'
    ORDER BY "startsAt" DESC
    LIMIT 1
)
INSERT INTO "Sponsor" (
    "id",
    "eventId",
    "name",
    "description",
    "logoUrl",
    "carouselImageUrl",
    "showInCarousel",
    "carouselOrder",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    'sponsor_bernieri_studio_tattoo',
    "id",
    'Bernieri Studio Tattoo',
    'Studio Tattoo apoiando a Noite Gamer.',
    'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-bernieri-studio-tattoo.jpeg',
    'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-bernieri-studio-tattoo.jpeg',
    true,
    5,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM active_event
ON CONFLICT ("id") DO UPDATE SET
    "eventId" = EXCLUDED."eventId",
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "logoUrl" = EXCLUDED."logoUrl",
    "carouselImageUrl" = EXCLUDED."carouselImageUrl",
    "showInCarousel" = EXCLUDED."showInCarousel",
    "carouselOrder" = EXCLUDED."carouselOrder",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
