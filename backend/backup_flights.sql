PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "flights" (
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
INSERT INTO flights VALUES('cmfnycfzo0001fut6jknt9xl2','ماهان ایر','/airlines/mahan-air.png','1020','بوئینگ ۷۳۷','اکونومی',2,0,1000000,2,8,180,'30','SCHEDULED',3,'MANUAL','cm-1',NULL,'admin-1','tenant-1',1758111754740,1758114304424,'airport-2','','',1759222260000,'airport-4','','',1759197240000,'airline-2','aircraft-1','class-1');
INSERT INTO flights VALUES('cmfnypntw0003fuj1kktsv7tf','ایران ایر','/airlines/iran-air.png','7890','ایرباس A320','بیزنس',120,0,2200000,2,5,150,'20','CANCELLED',3,'MANUAL','cm-1','rp-1','admin-1','tenant-1',1758112371428,1758746118804,'airport-1','','',1758366060000,'airport-2','','',1758376860000,'airline-1','aircraft-2','class-2');
INSERT INTO flights VALUES('cmfnzm4uz0009fuj1y232oyce','ترکیش ایرلاینز','/airlines/turkish-airlines.png','204','بوئینگ ۷۷۷','اکونومی',480,0,10000000,4,15,300,'30','SCHEDULED',3,'MANUAL',NULL,NULL,'admin-1','tenant-1',1758113886491,1758113886491,'airport-3','','',1758878820000,'airport-4','','',1758965220000,'airline-3','aircraft-3','class-1');
INSERT INTO flights VALUES('cmfogw1de0001fujlrmjulmza','cmfog4blq0002fu2d8u8x3qt0','https://airhex.com/images/airline-logos/ava-airlines.png','AXV6990','cmfoifiuf0000fuqpv0ator2c','class-1',120,0,5000000,5,20,172,'20','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758142902001,1758147127129,'airport-2','','',1759001580000,'airport-1','','',1758994260000,'cmfog4blq0002fu2d8u8x3qt0','aircraft-2','class-1');
INSERT INTO flights VALUES('cmfoofx630001fums1p1cph5c','cmfog4blq0002fu2d8u8x3qt0','https://airhex.com/images/airline-logos/ava-airlines.png','AXV7703','cmfoifiuf0000fuqpv0ator2c','class-1',120,0,5000000,5,20,172,NULL,'SCHEDULED',3,'Manual',NULL,'cmfombxhv0000fu3y4njm6g6u','admin-1','tenant-1',1758155586987,1758155586987,'cmfojknnj0002fu6mbywt57ob','','',1759179720000,'airport-2','','',1759179720000,'cmfog4blq0002fu2d8u8x3qt0','cmfoifiuf0000fuqpv0ator2c','class-1');
INSERT INTO flights VALUES('flight-1','ایران ایر','/airlines/iran-air.png','IR701','بوئینگ ۷۳۷','اکونومی',120,0,2200000,150000,150,180,'20kg','CANCELLED',3,'Manual','cm-1','rp-1','admin-1','tenant-1',1758163435497,1758746118816,'airport-1','T1','A1',1707991200000,'airport-2','T1','B1',1707998400000,'airline-1','aircraft-1','class-1');
INSERT INTO flights VALUES('flight-2','ماهان ایر','/airlines/mahan-air.png','W5-1234','ایرباس A320','اکونومی',180,0,3500000,200000,120,150,'25kg','CANCELLED',3,'Manual','cm-2','rp-1','admin-1','tenant-1',1758163435507,1758735000013,'airport-1','T2','C1',1708005600000,'airport-3','T1','D1',1708016400000,'airline-2','aircraft-2','class-1');
INSERT INTO flights VALUES('cmfpto0ro0008fult95et82yb','cmfop1u080004fums89dh0q2h','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjer8HRnGjnjxQRCFdvJP3-dmZhyIq9NhThA&s','1030','aircraft-1','class-1',120,0,200,1,180,180,NULL,'CANCELLED',3,'Manual','cm-1','cmfombxhv0000fu3y4njm6g6u','admin-1','tenant-1',1758224829156,1758735000013,'airport-2','','',1758384900000,'cmfojknnj0002fu6mbywt57ob','','',1758370560000,'cmfop1u080004fums89dh0q2h','aircraft-1','class-1');
INSERT INTO flights VALUES('cmfpvq1yr0003fu082qthbm4p','cmfop1u080004fums89dh0q2h','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjer8HRnGjnjxQRCFdvJP3-dmZhyIq9NhThA&s','1030','aircraft-1','class-1',120,0,200,1,50,180,NULL,'CANCELLED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758228283251,1758735000013,'airport-2','','',1758474840000,'cmfojknnj0002fu6mbywt57ob','','',1758474840000,'cmfop1u080004fums89dh0q2h','aircraft-1','class-1');
INSERT INTO flights VALUES('cmfpvte0t0007fu08t3vgufqe','cmfop1u080004fums89dh0q2h','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjer8HRnGjnjxQRCFdvJP3-dmZhyIq9NhThA&s','1030','aircraft-1','class-1',480,0,200,1,180,180,NULL,'CANCELLED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758228438845,1758735000013,'airport-2','','',1758474960000,'cmfojknnj0002fu6mbywt57ob','','',1758388560000,'cmfop1u080004fums89dh0q2h','aircraft-1','class-1');
INSERT INTO flights VALUES('cmfpw663n0005fulvq7mynmzj','airline-1','/airlines/iran-air.png','IR999','aircraft-1','class-1',120,0,2500000,200000,150,180,NULL,'CANCELLED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758229035107,1758746118829,'airport-1',NULL,NULL,1758733388774,'airport-2',NULL,NULL,1758733388774,'airline-1','aircraft-1','class-1');
INSERT INTO flights VALUES('cmfy8rq9k0001fugsz86vfynp','airline-1','/airlines/iran-air.png','IR999','aircraft-1','class-1',90,0,1800000,300000,150,180,'20kg','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758733925816,1758746118840,'airport-1','T1','A1',1758866400000,'airport-2','T1','B1',1758871800000,'airline-1','aircraft-1','class-1');
INSERT INTO flights VALUES('cmfy8rqal0003fugstvc90zug','airline-2','/airlines/mahan-air.png','W5-1234','aircraft-2','class-2',95,0,1800000,336000,120,150,'20kg','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758733925853,1758746118852,'airport-1','T1','A2',1758873600000,'airport-2','T1','B2',1758879300000,'airline-2','aircraft-2','class-2');
INSERT INTO flights VALUES('cmfy8rqau0005fugsygp2swvm','airline-3','/airlines/turkish-airlines.png','1030','aircraft-3','class-3',85,0,2200000,264000,100,120,'20kg','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758733925862,1758746118863,'airport-1','T1','A3',1758880800000,'airport-2','T1','B3',1758885900000,'airline-3','aircraft-3','class-3');
INSERT INTO flights VALUES('cmfy8rqb10007fugslo3zaih0','cmfog4blq0002fu2d8u8x3qt0','https://airhex.com/images/airline-logos/ava-airlines.png','AXV7703','cmfoifiuf0000fuqpv0ator2c','cmfojvbcj0000fuhkf8hnuxfc',100,0,2200000,384000,80,100,'20kg','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758733925869,1758746118873,'airport-1','T1','A4',1758888000000,'airport-2','T1','B4',1758894000000,'cmfog4blq0002fu2d8u8x3qt0','cmfoifiuf0000fuqpv0ator2c','cmfojvbcj0000fuhkf8hnuxfc');
INSERT INTO flights VALUES('cmfy8rqba0009fugsqectx8ho','cmfop1u080004fums89dh0q2h','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjer8HRnGjnjxQRCFdvJP3-dmZhyIq9NhThA&s','AXV6990','aircraft-1','class-1',88,0,2200000,420000,200,250,'20kg','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758733925878,1758746118881,'airport-1','T1','A5',1758895200000,'airport-2','T1','B5',1758900480000,'cmfop1u080004fums89dh0q2h','aircraft-1','class-1');
INSERT INTO flights VALUES('cmfy8rqbk000bfugs0rv2xfw5','airline-1','/airlines/iran-air.png','204','aircraft-2','class-2',92,0,2500000,312000,140,180,'20kg','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758733925888,1758746118895,'airport-1','T1','A6',1758902400000,'airport-2','T1','B6',1758907920000,'airline-1','aircraft-2','class-2');
INSERT INTO flights VALUES('cmfy8rqbs000dfugsg3tmfhfc','airline-2','/airlines/mahan-air.png','7890','aircraft-3','class-3',95,0,2500000,348000,110,140,'20kg','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758733925897,1758746118909,'airport-1','T1','A7',1758909600000,'airport-2','T1','B7',1758915300000,'airline-2','aircraft-3','class-3');
INSERT INTO flights VALUES('cmfy8rqc1000ffugs4ovzdd50','airline-3','/airlines/turkish-airlines.png','1020','cmfoifiuf0000fuqpv0ator2c','cmfojvbcj0000fuhkf8hnuxfc',90,0,2500000,288000,90,110,'20kg','SCHEDULED',3,'Manual',NULL,NULL,'admin-1','tenant-1',1758733925905,1758746118921,'airport-1','T1','A8',1758916800000,'airport-2','T1','B8',1758922200000,'airline-3','cmfoifiuf0000fuqpv0ator2c','cmfojvbcj0000fuhkf8hnuxfc');
COMMIT;
