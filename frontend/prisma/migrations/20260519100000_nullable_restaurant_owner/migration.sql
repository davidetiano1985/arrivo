-- AlterTable: make Restaurant.ownerId nullable with SET NULL on delete
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_ownerId_fkey";
ALTER TABLE "Restaurant" ALTER COLUMN "ownerId" DROP NOT NULL;
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
