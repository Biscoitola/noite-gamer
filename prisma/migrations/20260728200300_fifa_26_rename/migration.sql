UPDATE "Game" AS game
SET
  "name" = REPLACE(game."name", 'FIFA 23', 'FIFA 26'),
  "slug" = 'fifa-26',
  "description" = REPLACE(game."description", 'FIFA 23', 'FIFA 26'),
  "updatedAt" = NOW()
WHERE
  (game."slug" = 'fifa-23' OR game."name" LIKE '%FIFA 23%')
  AND NOT EXISTS (
    SELECT 1
    FROM "Game" AS existing
    WHERE existing."eventId" = game."eventId"
      AND existing."slug" = 'fifa-26'
      AND existing."id" <> game."id"
  );

UPDATE "Tournament"
SET
  "name" = REPLACE("name", 'FIFA 23', 'FIFA 26'),
  "updatedAt" = NOW()
WHERE "name" LIKE '%FIFA 23%';
