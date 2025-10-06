PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
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
INSERT INTO users VALUES('admin-1',1758111532859,1758158448399,'admin@trevel.com','admin','مدیر سیستم','+98-912-1234567','$2b$10$LYPubaVUhEOlgHL3t.b.m.pNcZPa5qzf3TL2L73U4dun.hLGNwul.','SUPER_ADMIN','ACTIVE',1,'tenant-1','["IRR", "USD"]');
INSERT INTO users VALUES('user-1',1758111533493,1758156984068,'user@trevel.com','user','کاربر عادی','+98-912-7654321','$2b$10$GVzXMCqAD5xx1A0I/pjMAumEKfCK2674TV6GBPc51Cv7GrkxBwEaO','USER','ACTIVE',0,'tenant-1','["IRR"]');
INSERT INTO users VALUES('cmfoapkcy0002funig0eg3ixj',1758132522322,1758132522322,'mobinghcrs@gmail.com','itsmoobin ','Mobin Gharibavi',NULL,'$2b$10$J7bpaKfuA7a.zD7ZQhxWQeJy8B.3E0Z.Z2oQ27ZqGKLa4rFIYU84a','SUPER_ADMIN','ACTIVE',0,'clmey6sjo6d000fumywum4qyk','[]');
COMMIT;
