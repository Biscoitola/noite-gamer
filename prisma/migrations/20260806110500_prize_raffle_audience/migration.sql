ALTER TABLE "Prize" ADD COLUMN "raffleAudience" TEXT NOT NULL DEFAULT 'ALL_CONFIRMED';

UPDATE "Prize"
SET "raffleAudience" = 'TOURNAMENT_WINNERS'
WHERE "id" IN (
    'prize_bernieri_voucher_200',
    'prize_guricell_fone_gamer',
    'prize_bechi_fone_sem_fio_gamer'
);
