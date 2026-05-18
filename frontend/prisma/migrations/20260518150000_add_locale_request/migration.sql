-- CreateTable
CREATE TABLE "LocaleRequest" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT,
    "citta" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "status" "RestaurantStatus" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocaleRequest_pkey" PRIMARY KEY ("id")
);
