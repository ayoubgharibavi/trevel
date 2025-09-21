/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `airports` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "airports" ADD COLUMN "code" TEXT;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN "totalPrice" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "isParent" BOOLEAN NOT NULL DEFAULT false,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    CONSTRAINT "accounts_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_accounts" ("balance", "code", "currency", "id", "isParent", "name", "parentId", "type") SELECT "balance", "code", "currency", "id", "isParent", "name", "parentId", "type" FROM "accounts";
DROP TABLE "accounts";
ALTER TABLE "new_accounts" RENAME TO "accounts";
CREATE TABLE "new_expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "accountId" TEXT NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    CONSTRAINT "expenses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "expenses_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_expenses" ("accountId", "amount", "currency", "date", "description", "id", "recordedByUserId") SELECT "accountId", "amount", "currency", "date", "description", "id", "recordedByUserId" FROM "expenses";
DROP TABLE "expenses";
ALTER TABLE "new_expenses" RENAME TO "expenses";
CREATE TABLE "new_refunds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING_EXPERT_REVIEW',
    "originalAmount" INTEGER NOT NULL,
    "penaltyAmount" INTEGER NOT NULL,
    "refundAmount" INTEGER NOT NULL,
    "reason" TEXT,
    "adminNotes" TEXT,
    "processedAt" DATETIME,
    "expertReviewerName" TEXT,
    "expertReviewDate" DATETIME,
    "financialReviewerName" TEXT,
    "financialReviewDate" DATETIME,
    "paymentProcessorName" TEXT,
    "paymentDate" DATETIME,
    "rejecterName" TEXT,
    "rejectionDate" DATETIME,
    "rejectionReason" TEXT,
    CONSTRAINT "refunds_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refunds_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_refunds" ("bookingId", "expertReviewDate", "expertReviewerName", "financialReviewDate", "financialReviewerName", "id", "originalAmount", "paymentDate", "paymentProcessorName", "penaltyAmount", "reason", "refundAmount", "rejecterName", "rejectionDate", "rejectionReason", "requestDate", "status", "userId") SELECT "bookingId", "expertReviewDate", "expertReviewerName", "financialReviewDate", "financialReviewerName", "id", "originalAmount", "paymentDate", "paymentProcessorName", "penaltyAmount", "reason", "refundAmount", "rejecterName", "rejectionDate", "rejectionReason", "requestDate", "status", "userId" FROM "refunds";
DROP TABLE "refunds";
ALTER TABLE "new_refunds" RENAME TO "refunds";
CREATE TABLE "new_seat_allotments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flightId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seat_allotments_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flights" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "seat_allotments_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_seat_allotments" ("agentId", "createdAt", "expiresAt", "flightId", "id", "seats") SELECT "agentId", "createdAt", "expiresAt", "flightId", "id", "seats" FROM "seat_allotments";
DROP TABLE "seat_allotments";
ALTER TABLE "new_seat_allotments" RENAME TO "seat_allotments";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "airports_code_key" ON "airports"("code");
