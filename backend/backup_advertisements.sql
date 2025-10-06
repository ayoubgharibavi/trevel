PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "advertisements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO advertisements VALUES('ad-1','پروازهای ارزان به مشهد','/ads/mashhad-promo.jpg','/search?from=تهران&to=مشهد','SEARCH_RESULTS_TOP',1,1758111533774);
INSERT INTO advertisements VALUES('ad-2','رزرو هتل در استانبول','/ads/istanbul-hotel.jpg','/hotels/istanbul','SIDEBAR_BOTTOM',1,1758111533783);
COMMIT;
