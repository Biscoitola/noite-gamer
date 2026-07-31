WITH target_sponsor AS (
    SELECT
        s."id" AS "sponsorId",
        s."eventId"
    FROM "Sponsor" s
    INNER JOIN "Event" e ON e."id" = s."eventId"
    WHERE s."name" ILIKE 'Bechi%'
      AND e."status" = 'ACTIVE'
    ORDER BY s."createdAt" DESC
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
    'prize_bechi_fone_sem_fio_gamer',
    "eventId",
    "sponsorId",
    'Fone sem fio gamer IT-BLUE LE-2406',
    'Fone sem fio gamer cedido pela Bechi Acessorios para sorteio da Noite Gamer.',
    'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-bechi-fone-sem-fio-gamer.png',
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM target_sponsor
ON CONFLICT ("id") DO UPDATE SET
    "eventId" = EXCLUDED."eventId",
    "sponsorId" = EXCLUDED."sponsorId",
    "title" = EXCLUDED."title",
    "description" = EXCLUDED."description",
    "imageUrl" = EXCLUDED."imageUrl",
    "quantity" = EXCLUDED."quantity",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
