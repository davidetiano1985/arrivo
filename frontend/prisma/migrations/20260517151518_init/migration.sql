-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('super_admin', 'gestore_locale', 'manager', 'staff', 'cliente');

-- CreateEnum
CREATE TYPE "RestaurantStatus" AS ENUM ('pending', 'approved', 'rejected');
