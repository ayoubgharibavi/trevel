/*
  Warnings:

  - You are about to alter the column `price` on the `flights` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `taxes` on the `flights` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_flights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airline" TEXT NOT NULL,
    "airlineLogoUrl" TEXT,
    "flightNumber" TEXT NOT NULL,
    "aircraft" TEXT NOT NULL,
    "flightClass" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "price" BIGINT NOT NULL,
    "taxes" BIGINT NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "baggageAllowance" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "bookingClosesBeforeDepartureHours" INTEGER NOT NULL DEFAULT 3,
    "sourcingType" TEXT NOT NULL DEFAULT 'Manual',
    "commissionModelId" TEXT,
    "refundPolicyId" TEXT,
    "creatorId" TEXT,
    "tenantId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "departureAirportId" TEXT NOT NULL,
    "departureTerminal" TEXT,
    "departureGate" TEXT,
    "departureTime" DATETIME NOT NULL,
    "arrivalAirportId" TEXT NOT NULL,
    "arrivalTerminal" TEXT,
    "arrivalGate" TEXT,
    "arrivalTime" DATETIME NOT NULL,
    "airlineId" TEXT NOT NULL,
    "aircraftId" TEXT NOT NULL,
    "flightClassId" TEXT NOT NULL,
    CONSTRAINT "flights_commissionModelId_fkey" FOREIGN KEY ("commissionModelId") REFERENCES "commission_models" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "flights_refundPolicyId_fkey" FOREIGN KEY ("refundPolicyId") REFERENCES "refund_policies" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "flights_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "flights_departureAirportId_fkey" FOREIGN KEY ("departureAirportId") REFERENCES "airports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "flights_arrivalAirportId_fkey" FOREIGN KEY ("arrivalAirportId") REFERENCES "airports" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "flights_airlineId_fkey" FOREIGN KEY ("airlineId") REFERENCES "airlines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "flights_aircraftId_fkey" FOREIGN KEY ("aircraftId") REFERENCES "aircrafts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "flights_flightClassId_fkey" FOREIGN KEY ("flightClassId") REFERENCES "flight_classes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_flights" ("aircraft", "aircraftId", "airline", "airlineId", "airlineLogoUrl", "arrivalAirportId", "arrivalGate", "arrivalTerminal", "arrivalTime", "availableSeats", "baggageAllowance", "bookingClosesBeforeDepartureHours", "commissionModelId", "createdAt", "creatorId", "departureAirportId", "departureGate", "departureTerminal", "departureTime", "duration", "flightClass", "flightClassId", "flightNumber", "id", "price", "refundPolicyId", "sourcingType", "status", "stops", "taxes", "tenantId", "totalCapacity", "updatedAt") SELECT "aircraft", "aircraftId", "airline", "airlineId", "airlineLogoUrl", "arrivalAirportId", "arrivalGate", "arrivalTerminal", "arrivalTime", "availableSeats", "baggageAllowance", "bookingClosesBeforeDepartureHours", "commissionModelId", "createdAt", "creatorId", "departureAirportId", "departureGate", "departureTerminal", "departureTime", "duration", "flightClass", "flightClassId", "flightNumber", "id", "price", "refundPolicyId", "sourcingType", "status", "stops", "taxes", "tenantId", "totalCapacity", "updatedAt" FROM "flights";
DROP TABLE "flights";
ALTER TABLE "new_flights" RENAME TO "flights";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
