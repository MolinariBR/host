ALTER TABLE "Room" ADD COLUMN "climatizacao" TEXT;

UPDATE "Room" SET "type" = 'FAMILIA' WHERE "type" = 'STANDARD';
UPDATE "Room" SET "type" = 'CASAL' WHERE "type" = 'DELUXE';
UPDATE "Room" SET "type" = 'DUPLO' WHERE "type" = 'PREMIUM';
UPDATE "Room" SET "type" = 'INDIVIDUAL' WHERE "type" = 'SUITE';
