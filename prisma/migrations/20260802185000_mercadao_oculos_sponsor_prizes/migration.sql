WITH active_event AS (
    SELECT "id"
    FROM "Event"
    WHERE "status" = 'ACTIVE'
    ORDER BY "startsAt" DESC
    LIMIT 1
),
upsert_sponsor AS (
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
        'sponsor_mercadao_dos_oculos',
        "id",
        'Mercadao dos Oculos',
        'Rede de oticas apoiando os campeoes dentro e fora das telas.',
        'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-mercadao-dos-oculos.png',
        'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-mercadao-dos-oculos.png',
        true,
        4,
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
        "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "id", "eventId"
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
    prize."id",
    upsert_sponsor."eventId",
    upsert_sponsor."id",
    prize."title",
    prize."description",
    prize."imageUrl",
    1,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM upsert_sponsor
CROSS JOIN (
    VALUES
        (
            'prize_mercadao_oculos_cuia_chimarrao_grande',
            'Cuia para chimarrao grande',
            'Cuia para chimarrao cedida pelo Mercadao dos Oculos para sorteio da Noite Gamer.',
            'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-mercadao-dos-oculos-cuias-chimarrao.png'
        ),
        (
            'prize_mercadao_oculos_cuia_chimarrao_pequena',
            'Cuia para chimarrao pequena',
            'Cuia para chimarrao cedida pelo Mercadao dos Oculos para sorteio da Noite Gamer.',
            'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-mercadao-dos-oculos-cuias-chimarrao.png'
        )
) AS prize("id", "title", "description", "imageUrl")
ON CONFLICT ("id") DO UPDATE SET
    "eventId" = EXCLUDED."eventId",
    "sponsorId" = EXCLUDED."sponsorId",
    "title" = EXCLUDED."title",
    "description" = EXCLUDED."description",
    "imageUrl" = EXCLUDED."imageUrl",
    "quantity" = EXCLUDED."quantity",
    "isActive" = EXCLUDED."isActive",
    "updatedAt" = CURRENT_TIMESTAMP;
