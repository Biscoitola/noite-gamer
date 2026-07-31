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
        'sponsor_carpa_forte_3d',
        "id",
        'Carpa Forte 3D',
        'Impressao 3D sem limites apoiando a Noite Gamer.',
        'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-carpa-forte-3d.png',
        'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/sponsor-carpa-forte-3d.png',
        true,
        3,
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
            'prize_carpa_forte_suporte_playstation_cinza',
            'Suporte PlayStation cinza impresso em 3D',
            'Suporte para controle PlayStation cedido pela Carpa Forte 3D para sorteio da Noite Gamer.',
            'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-carpa-forte-suporte-playstation-cinza.png'
        ),
        (
            'prize_carpa_forte_suporte_playstation_amarelo',
            'Suporte PlayStation amarelo impresso em 3D',
            'Suporte para controle PlayStation cedido pela Carpa Forte 3D para sorteio da Noite Gamer.',
            'https://raw.githubusercontent.com/Biscoitola/noite-gamer/main/public/assets/premio-carpa-forte-suporte-playstation-amarelo.png'
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
