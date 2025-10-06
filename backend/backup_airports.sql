PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "airports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iata" TEXT NOT NULL,
    "icao" TEXT,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL
, "code" TEXT);
INSERT INTO airports VALUES('airport-1','IKA','OIIE','{"fa":"فرودگاه بین‌المللی امام خمینی","en":"Imam Khomeini International Airport","ar":"مطار الإمام الخميني الدولي"}','{"fa":"تهران","en":"Tehran","ar":"طهران"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('airport-2','MHD','OIMM','{"fa":"فرودگاه بین‌المللی مشهد","en":"Mashhad International Airport","ar":"مطار مشهد الدولي"}','{"fa":"مشهد","en":"Mashhad","ar":"مشهد"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('airport-3','IST','LTFM','{"fa":"فرودگاه بین‌المللی استانبول","en":"Istanbul Airport","ar":"مطار إسطنبول"}','{"fa":"استانبول","en":"Istanbul","ar":"إسطنبول"}','{"fa":"ترکیه","en":"Turkey","ar":"تركيا"}',NULL);
INSERT INTO airports VALUES('airport-4','DXB','OMDB','{"fa":"فرودگاه بین‌المللی دبی","en":"Dubai International Airport","ar":"مطار دبي الدولي"}','{"fa":"دبی","en":"Dubai","ar":"دبي"}','{"fa":"امارات متحده عربی","en":"United Arab Emirates","ar":"الإمارات العربية المتحدة"}',NULL);
INSERT INTO airports VALUES('cmfojknnj0002fu6mbywt57ob','AWZ',NULL,'{"fa":"شهید قاسم سلیمانی","ar":"شهید قاسم سلیمانی","en":"شهید قاسم سلیمانی"}','{"fa":"اهواز","ar":"اهواز","en":"ahwaz"}','{"en":"iran","fa":"ایران","ar":"ایران"}',NULL);
INSERT INTO airports VALUES('cmfwzp0zj0000fuo48kngsh39','SYZ','OISS','{"fa":"فرودگاه بین‌المللی شیراز","en":"Shiraz International Airport","ar":"مطار شيراز الدولي"}','{"fa":"شیراز","en":"Shiraz","ar":"شيراز"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp0zu0001fuo4tptsw6eh','IFN','OIFM','{"fa":"فرودگاه بین‌المللی اصفهان","en":"Isfahan International Airport","ar":"مطار أصفهان الدولي"}','{"fa":"اصفهان","en":"Isfahan","ar":"أصفهان"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp1030002fuo40stksmq8','TBZ','OITT','{"fa":"فرودگاه بین‌المللی تبریز","en":"Tabriz International Airport","ar":"مطار تبريز الدولي"}','{"fa":"تبریز","en":"Tabriz","ar":"تبريز"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp10g0003fuo4w0vsxwvd','KER','OIKK','{"fa":"فرودگاه بین‌المللی کرمان","en":"Kerman International Airport","ar":"مطار كرمان الدولي"}','{"fa":"کرمان","en":"Kerman","ar":"كرمان"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp10x0004fuo4bblkwzut','KSH','OICC','{"fa":"فرودگاه بین‌المللی کرمانشاه","en":"Kermanshah International Airport","ar":"مطار كرمانشاه الدولي"}','{"fa":"کرمانشاه","en":"Kermanshah","ar":"كرمانشاه"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp1170005fuo4madw3ym4','RAS','OIGG','{"fa":"فرودگاه بین‌المللی رشت","en":"Rasht International Airport","ar":"مطار رشت الدولي"}','{"fa":"رشت","en":"Rasht","ar":"رشت"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp11j0006fuo4up1f6k45','ZAH','OIZC','{"fa":"فرودگاه بین‌المللی زاهدان","en":"Zahedan International Airport","ar":"مطار زاهدان الدولي"}','{"fa":"زاهدان","en":"Zahedan","ar":"زاهدان"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp11v0007fuo4qkaqc1bo','BND','OIKB','{"fa":"فرودگاه بین‌المللی بندرعباس","en":"Bandar Abbas International Airport","ar":"مطار بندر عباس الدولي"}','{"fa":"بندرعباس","en":"Bandar Abbas","ar":"بندر عباس"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp1240008fuo4otdfzffp','BUZ','OIBB','{"fa":"فرودگاه بین‌المللی بوشهر","en":"Bushehr International Airport","ar":"مطار بوشهر الدولي"}','{"fa":"بوشهر","en":"Bushehr","ar":"بوشهر"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp12d0009fuo4dq3f0l3c','KIH','OIBK','{"fa":"فرودگاه بین‌المللی کیش","en":"Kish International Airport","ar":"مطار كيش الدولي"}','{"fa":"کیش","en":"Kish","ar":"كيش"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp12o000afuo4wxomsuwb','QOM','OIKQ','{"fa":"فرودگاه بین‌المللی قم","en":"Qom International Airport","ar":"مطار قم الدولي"}','{"fa":"قم","en":"Qom","ar":"قم"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp12z000bfuo4zop9erw7','GSM','OIKG','{"fa":"فرودگاه بین‌المللی قشم","en":"Qeshm International Airport","ar":"مطار قشم الدولي"}','{"fa":"قشم","en":"Qeshm","ar":"قشم"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp139000cfuo4mhfd7sar','LRR','OISL','{"fa":"فرودگاه بین‌المللی لارستان","en":"Lar International Airport","ar":"مطار لار الدولي"}','{"fa":"لار","en":"Lar","ar":"لار"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp13h000dfuo4yvodj53o','YAZ','OIYY','{"fa":"فرودگاه بین‌المللی یزد","en":"Yazd International Airport","ar":"مطار يزد الدولي"}','{"fa":"یزد","en":"Yazd","ar":"يزد"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp13s000efuo4kp1ljd8a','ABD','OIAA','{"fa":"فرودگاه بین‌المللی آبادان","en":"Abadan International Airport","ar":"مطار عبادان الدولي"}','{"fa":"آبادان","en":"Abadan","ar":"عبادان"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp142000ffuo4zkzbquhp','ADU','OITL','{"fa":"فرودگاه بین‌المللی اردبیل","en":"Ardabil International Airport","ar":"مطار أردبيل الدولي"}','{"fa":"اردبیل","en":"Ardabil","ar":"أردبيل"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
INSERT INTO airports VALUES('cmfwzp14d000gfuo4j91la7ni','BJB','OIMN','{"fa":"فرودگاه بین‌المللی بجنورد","en":"Bojnurd International Airport","ar":"مطار بجنورد الدولي"}','{"fa":"بجنورد","en":"Bojnurd","ar":"بجنورد"}','{"fa":"ایران","en":"Iran","ar":"إيران"}',NULL);
COMMIT;
