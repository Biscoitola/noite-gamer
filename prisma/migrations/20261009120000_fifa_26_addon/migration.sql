-- Add FIFA only to the October 17 edition; preserve existing payments.
INSERT INTO "Game" ("id", "eventId", "name", "slug", "description", "price", "capacity", "teamMode", "showRemaining", "isActive", "rules", "resultSchema", "createdAt", "updatedAt")
SELECT 'fifa26_addon_' || e."id", e."id", 'FIFA 26', 'fifa-26',
  'Adicione FIFA 26 por mais R$ 5 ao se inscrever em Mortal Kombat ou Rocket League, individualmente ou no combo.',
  5.00, 32, 'SOLO', true, true,
  '{"text":"Inscrição adicional vinculada a Mortal Kombat ou Rocket League. Regras de partida definidas pela organização."}'::jsonb,
  '{"simple":true}'::jsonb, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Event" e
WHERE (e."startsAt" AT TIME ZONE 'America/Sao_Paulo')::date = DATE '2026-10-17'
ON CONFLICT ("eventId", "slug") DO UPDATE
SET "price" = 5.00, "isActive" = true, "description" = EXCLUDED."description", "updatedAt" = CURRENT_TIMESTAMP;
