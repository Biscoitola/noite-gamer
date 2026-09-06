CREATE TYPE "GameTeamMode" AS ENUM ('SOLO', 'DOUBLES');

ALTER TABLE "Game" ADD COLUMN "teamMode" "GameTeamMode" NOT NULL DEFAULT 'SOLO';

ALTER TABLE "RegistrationItem" ADD COLUMN "teamName" TEXT;
ALTER TABLE "RegistrationItem" ADD COLUMN "teammateName" TEXT;
ALTER TABLE "RegistrationItem" ADD COLUMN "teammateWhatsapp" TEXT;

ALTER TABLE "TournamentEntry" ADD COLUMN "displayName" TEXT;
