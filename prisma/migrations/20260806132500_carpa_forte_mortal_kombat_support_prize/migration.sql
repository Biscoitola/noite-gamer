WITH active_event AS (
    SELECT "id"
    FROM "Event"
    WHERE "status" = 'ACTIVE'
    ORDER BY "startsAt" DESC
    LIMIT 1
),
carpa_sponsor AS (
    SELECT s."id", s."eventId"
    FROM "Sponsor" s
    JOIN active_event e ON e."id" = s."eventId"
    WHERE s."id" = 'sponsor_carpa_forte_3d'
       OR lower(s."name") LIKE '%carpa forte%'
    ORDER BY CASE WHEN s."id" = 'sponsor_carpa_forte_3d' THEN 0 ELSE 1 END
    LIMIT 1
)
INSERT INTO "Prize" (
    "id",
    "eventId",
    "sponsorId",
    "title",
    "description",
    "imageUrl",
    "quantity",
    "isActive",
    "createdAt",
    "updatedAt"
)
SELECT
    'prize_carpa_forte_suporte_mortal_kombat',
    carpa_sponsor."eventId",
    carpa_sponsor."id",
    'Suporte Mortal Kombat impresso em 3D',
    'Suporte tematico Mortal Kombat cedido pela Carpa Forte 3D para sorteio da Noite Gamer.',
    'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-carpa-forte-suporte-mortal-kombat.png',
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM carpa_sponsor
ON CONFLICT ("id") DO UPDATE SET
    "eventId" = EXCLUDED."eventId",
    "sponsorId" = EXCLUDED."sponsorId",
    "title" = EXCLUDED."title",
    "description" = EXCLUDED."description",
    "imageUrl" = EXCLUDED."imageUrl",
    "quantity" = EXCLUDED."quantity",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
