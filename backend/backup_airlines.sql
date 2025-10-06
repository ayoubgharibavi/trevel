PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "airlines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL
);
INSERT INTO airlines VALUES('airline-1','{"fa":"ایران ایر","en":"Iran Air","ar":"إيران إير"}','/airlines/iran-air.png');
INSERT INTO airlines VALUES('airline-2','{"fa":"ماهان ایر","en":"Mahan Air","ar":"ماهان إير"}','/airlines/mahan-air.png');
INSERT INTO airlines VALUES('airline-3','{"fa":"ترکیش ایرلاینز","en":"Turkish Airlines","ar":"الخطوط الجوية التركية"}','/airlines/turkish-airlines.png');
INSERT INTO airlines VALUES('cmfog4blq0002fu2d8u8x3qt0','{"fa":"اوا ایر ","ar":"اوا ایر","en":"ava air"}','https://airhex.com/images/airline-logos/ava-airlines.png');
INSERT INTO airlines VALUES('cmfop1u080004fums89dh0q2h','{"fa":"کاسپین","ar":"کاسبین","en":"CASPIAN"}','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjer8HRnGjnjxQRCFdvJP3-dmZhyIq9NhThA&s');
COMMIT;
