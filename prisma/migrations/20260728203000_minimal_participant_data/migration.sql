UPDATE "Participant"
SET
  "fullName" = "publicName",
  "email" = NULL,
  "birthDate" = NULL,
  "city" = 'Nao informado',
  "updatedAt" = NOW();
