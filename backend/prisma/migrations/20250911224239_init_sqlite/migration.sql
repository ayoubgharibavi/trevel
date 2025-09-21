-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "canBypassRateLimit" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT,
    "displayCurrencies" TEXT NOT NULL DEFAULT '[]'
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_passengers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "nationalId" TEXT,
    "passportNumber" TEXT,
    "passportIssuingCountry" TEXT,
    "dateOfBirth" TEXT,
    "passportExpiryDate" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookingId" TEXT,
    CONSTRAINT "saved_passengers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "saved_passengers_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'default',
    "homepageContentId" TEXT NOT NULL DEFAULT 'home-1',
    "supportedLanguages" TEXT NOT NULL DEFAULT '["fa", "en", "ar"]',
    "supportedCurrencies" TEXT NOT NULL DEFAULT '["IRR", "USD"]'
);

-- CreateTable
CREATE TABLE "flights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airline" TEXT NOT NULL,
    "airlineLogoUrl" TEXT,
    "flightNumber" TEXT NOT NULL,
    "aircraft" TEXT NOT NULL,
    "flightClass" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "stops" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL,
    "taxes" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "baggageAllowance" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "bookingClosesBeforeDepartureHours" INTEGER NOT NULL DEFAULT 3,
    "sourcingType" TEXT NOT NULL DEFAULT 'Manual',
    "commissionModelId" TEXT,
    "refundPolicyId" TEXT,
    "creatorId" TEXT,
    "tenantId" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "seat_allotments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flightId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "seat_allotments_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flights" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "bookingDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "cancellationDate" DATETIME,
    "purchasePrice" INTEGER,
    "buyerReference" TEXT,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "passengersData" TEXT NOT NULL,
    "searchQuery" TEXT NOT NULL,
    CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_flightId_fkey" FOREIGN KEY ("flightId") REFERENCES "flights" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookingId" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorType" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING_EXPERT_REVIEW',
    "originalAmount" INTEGER NOT NULL,
    "penaltyAmount" INTEGER NOT NULL,
    "refundAmount" INTEGER NOT NULL,
    "reason" TEXT,
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

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "relatedBookingId" TEXT,
    "relatedUserId" TEXT,
    CONSTRAINT "wallet_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" TEXT NOT NULL,
    "parentId" TEXT,
    "isParent" BOOLEAN NOT NULL DEFAULT false,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'IRR'
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "userId" TEXT,
    "bookingId" TEXT,
    CONSTRAINT "journal_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalEntryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debit" INTEGER NOT NULL DEFAULT 0,
    "credit" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "transactions_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "journal_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IRR',
    "accountId" TEXT NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    CONSTRAINT "expenses_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "airlines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "aircrafts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "flight_classes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "airports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iata" TEXT NOT NULL,
    "icao" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "commission_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "calculationType" TEXT NOT NULL,
    "charterCommission" REAL NOT NULL,
    "creatorCommission" REAL NOT NULL,
    "webServiceCommission" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "rate_limits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromCity" TEXT NOT NULL,
    "toCity" TEXT NOT NULL,
    "maxPrice" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "refund_policies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "policyType" TEXT,
    "airlineId" TEXT,
    "rules" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "exchangeRateToUSD" REAL NOT NULL,
    "isBaseCurrency" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baseCurrencyId" TEXT NOT NULL,
    "targetCurrencyId" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "exchange_rates_baseCurrencyId_fkey" FOREIGN KEY ("baseCurrencyId") REFERENCES "currencies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exchange_rates_targetCurrencyId_fkey" FOREIGN KEY ("targetCurrencyId") REFERENCES "currencies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "countries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "flag" TEXT,
    "dialingCode" TEXT NOT NULL,
    "currency" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "site_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "telegram_bot_config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'telegram_config',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "botToken" TEXT,
    "chatId" TEXT,
    "notifyOn" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "whatsapp_bot_config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'whatsapp_config',
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "phoneNumberId" TEXT,
    "notifyOn" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'role_permissions',
    "permissions" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_userId_key" ON "wallets"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "airports_iata_key" ON "airports"("iata");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_baseCurrencyId_targetCurrencyId_key" ON "exchange_rates"("baseCurrencyId", "targetCurrencyId");

-- CreateIndex
CREATE UNIQUE INDEX "site_content_section_key" ON "site_content"("section");
