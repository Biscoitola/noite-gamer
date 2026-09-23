-- Keep 25% of confirmed revenue for the organization in the current edition.
DO $$
DECLARE
  active_edition_ids TEXT[];
BEGIN
  LOCK TABLE "Event" IN SHARE ROW EXCLUSIVE MODE;
  SELECT array_agg("id") INTO active_edition_ids
  FROM "Event" WHERE "status" = 'ACTIVE';

  IF COALESCE(cardinality(active_edition_ids), 0) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one active edition; no changes made';
  END IF;

  UPDATE "Event"
  SET "settings" = jsonb_set("settings", '{prizePoolPercent}', '75'::jsonb),
      "updatedAt" = CURRENT_TIMESTAMP
  WHERE "id" = active_edition_ids[1] AND "status" = 'ACTIVE';
END $$;
