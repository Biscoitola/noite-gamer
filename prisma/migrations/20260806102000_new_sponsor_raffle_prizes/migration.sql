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
    'sponsor_jg_artesanato_pallet',
    "id",
    'JG Artesanato em Pallet',
    'Artesanato em pallet apoiando a Noite Gamer com premio exclusivo para os competidores.',
    'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-jg-artesanato-pallet.png',
    'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-jg-artesanato-pallet.png',
    true,
    7,
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
    COALESCE(existing."id", 'sponsor_guricell'),
    active_event."id",
    'GuriCell',
    'Celulares e assistencia tecnica apoiando a Noite Gamer.',
    'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-guricell.jpeg',
    'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-guricell.jpeg',
    true,
    2,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM active_event
LEFT JOIN "Sponsor" existing
    ON existing."eventId" = active_event."id"
    AND existing."name" = 'GuriCell'
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

WITH active_event AS (
    SELECT "id"
    FROM "Event"
    WHERE "status" = 'ACTIVE'
    ORDER BY "startsAt" DESC
    LIMIT 1
),
prize_data AS (
    SELECT
        'prize_bernieri_voucher_200' AS "id",
        'Bernieri Studio Tattoo' AS "sponsorName",
        'Voucher Bernieri R$ 200,00' AS "title",
        'Voucher de R$ 200,00 cedido pela Bernieri Studio Tattoo para sorteio da Noite Gamer.' AS "description",
        'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-bernieri-voucher-200.png' AS "imageUrl"
    UNION ALL
    SELECT
        'prize_jg_tabua_carne',
        'JG Artesanato em Pallet',
        'Tabua de carne JG',
        'Tabua de carne exclusiva cedida pela JG Artesanato em Pallet para sorteio da Noite Gamer.',
        'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-jg-tabua-carne.png'
    UNION ALL
    SELECT
        'prize_guricell_fone_gamer',
        'GuriCell',
        'Fone gamer Soyto SY830',
        'Fone de ouvido gamer cedido pela GuriCell para sorteio da Noite Gamer.',
        'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-guricell-fone-gamer.png'
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
    prize_data."id",
    active_event."id",
    sponsor."id",
    prize_data."title",
    prize_data."description",
    prize_data."imageUrl",
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM prize_data
JOIN active_event ON true
JOIN "Sponsor" sponsor
    ON sponsor."eventId" = active_event."id"
    AND sponsor."name" = prize_data."sponsorName"
ON CONFLICT ("id") DO UPDATE SET
    "eventId" = EXCLUDED."eventId",
    "sponsorId" = EXCLUDED."sponsorId",
    "title" = EXCLUDED."title",
    "description" = EXCLUDED."description",
    "imageUrl" = EXCLUDED."imageUrl",
    "quantity" = EXCLUDED."quantity",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
