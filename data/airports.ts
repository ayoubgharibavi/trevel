import type { AirportInfo } from '../types';

export const initialAirports: AirportInfo[] = [
  // Iran
  { id: 'IKA', iata: 'IKA', name: { ar: 'مطار الإمام الخميني الدولي', fa: 'فرودگاه بین‌المللی امام خمینی', en: 'Imam Khomeini International Airport' }, city: { ar: 'طهران', fa: 'تهران', en: 'Tehran' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'THR', iata: 'THR', name: { ar: 'مطار مهرآباد الدولي', fa: 'فرودگاه بین‌المللی مهرآباد', en: 'Mehrabad International Airport' }, city: { ar: 'طهران', fa: 'تهران', en: 'Tehran' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'MHD', iata: 'MHD', name: { ar: 'مطار مشهد الدولي', fa: 'فرودگاه بین‌المللی مشهد', en: 'Mashhad International Airport' }, city: { ar: 'مشهد', fa: 'مشهد', en: 'Mashhad' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'SYZ', iata: 'SYZ', name: { ar: 'مطار شيراز الدولي', fa: 'فرودگاه بین‌المللی شیراز', en: 'Shiraz International Airport' }, city: { ar: 'شيراز', fa: 'شیراز', en: 'Shiraz' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'ISF', iata: 'ISF', name: { ar: 'مطار أصفهان الدولي', fa: 'فرودگاه بین‌المللی اصفهان', en: 'Isfahan International Airport' }, city: { ar: 'أصفهان', fa: 'اصفهان', en: 'Isfahan' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'TBZ', iata: 'TBZ', name: { ar: 'مطار تبريز الدولي', fa: 'فرودگاه بین‌المللی تبریز', en: 'Tabriz International Airport' }, city: { ar: 'تبريز', fa: 'تبریز', en: 'Tabriz' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'KIH', iata: 'KIH', name: { ar: 'مطار كيش الدولي', fa: 'فرودگاه بین‌المللی کیش', en: 'Kish International Airport' }, city: { ar: 'كيش', fa: 'کیش', en: 'Kish' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'BND', iata: 'BND', name: { ar: 'مطار بندر عباس الدولي', fa: 'فرودگاه بین‌المللی بندرعباس', en: 'Bandar Abbas International Airport' }, city: { ar: 'بندر عباس', fa: 'بندرعباس', en: 'Bandar Abbas' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'AWZ', iata: 'AWZ', name: { ar: 'مطار الأهواز الدولي', fa: 'فرودگاه بین‌المللی اهواز', en: 'Ahvaz International Airport' }, city: { ar: 'الأهواز', fa: 'اهواز', en: 'Ahvaz' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'ABD', iata: 'ABD', name: { ar: 'مطار عبادان الدولي', fa: 'فرودگاه بین‌المللی آبادان', en: 'Abadan International Airport' }, city: { ar: 'عبادان', fa: 'آبادان', en: 'Abadan' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },

  // Turkey
  { id: 'IST', iata: 'IST', name: { ar: 'مطار إسطنبول', fa: 'فرودگاه استانبول', en: 'Istanbul Airport' }, city: { ar: 'إسطنبول', fa: 'استانبول', en: 'Istanbul' }, country: { ar: 'تركيا', fa: 'ترکیه', en: 'Turkey' } },
  { id: 'SAW', iata: 'SAW', name: { ar: 'مطار صبيحة كوكجن الدولي', fa: 'فرودگاه بین‌المللی صبیحه گوکچن', en: 'Sabiha Gökçen International Airport' }, city: { ar: 'إسطنبول', fa: 'استانبول', en: 'Istanbul' }, country: { ar: 'تركيا', fa: 'ترکیه', en: 'Turkey' } },
  { id: 'ESB', iata: 'ESB', name: { ar: 'مطار إيسنبوغا أنقرة', fa: 'فرودگاه اسن‌بوغا آنکارا', en: 'Ankara Esenboğa Airport' }, city: { ar: 'أنقرة', fa: 'آنکارا', en: 'Ankara' }, country: { ar: 'تركيا', fa: 'ترکیه', en: 'Turkey' } },
  { id: 'AYT', iata: 'AYT', name: { ar: 'مطار أنطاليا', fa: 'فرودگاه آنتالیا', en: 'Antalya Airport' }, city: { ar: 'أنطاليا', fa: 'آنتالیا', en: 'Antalya' }, country: { ar: 'تركيا', fa: 'ترکیه', en: 'Turkey' } },
  { id: 'ADB', iata: 'ADB', name: { ar: 'مطار عدنان مندريس', fa: 'فرودگاه عدنان مندرس', en: 'Adnan Menderes Airport' }, city: { ar: 'إزمير', fa: 'ازمیر', en: 'Izmir' }, country: { ar: 'تركيا', fa: 'ترکیه', en: 'Turkey' } },

  // UAE
  { id: 'DXB', iata: 'DXB', name: { ar: 'مطار دبي الدولي', fa: 'فرودگاه بین‌المللی دبی', en: 'Dubai International Airport' }, city: { ar: 'دبي', fa: 'دبی', en: 'Dubai' }, country: { ar: 'الإمارات', fa: 'امارات', en: 'UAE' } },
  { id: 'AUH', iata: 'AUH', name: { ar: 'مطار أبو ظبي الدولي', fa: 'فرودگاه بین‌المللی ابوظبی', en: 'Abu Dhabi International Airport' }, city: { ar: 'أبو ظبي', fa: 'ابوظبی', en: 'Abu Dhabi' }, country: { ar: 'الإمارات', fa: 'امارات', en: 'UAE' } },
  { id: 'SHJ', iata: 'SHJ', name: { ar: 'مطار الشارقة الدولي', fa: 'فرودگاه بین‌المللی شارجه', en: 'Sharjah International Airport' }, city: { ar: 'الشارقة', fa: 'شارجه', en: 'Sharjah' }, country: { ar: 'الإمارات', fa: 'امارات', en: 'UAE' } },

  // Iraq
  { id: 'BGW', iata: 'BGW', name: { ar: 'مطار بغداد الدولي', fa: 'فرودگاه بین‌المللی بغداد', en: 'Baghdad International Airport' }, city: { ar: 'بغداد', fa: 'بغداد', en: 'Baghdad' }, country: { ar: 'العراق', fa: 'عراق', en: 'Iraq' } },
  
  // Europe
  { id: 'LHR', iata: 'LHR', name: { ar: 'مطار هيثرو', fa: 'فرودگاه هیترو', en: 'Heathrow Airport' }, city: { ar: 'لندن', fa: 'لندن', en: 'London' }, country: { ar: 'المملكة المتحدة', fa: 'بریتانیا', en: 'United Kingdom' } },
  { id: 'CDG', iata: 'CDG', name: { ar: 'مطار شارل ديغول', fa: 'فرودگاه شارل دوگل', en: 'Charles de Gaulle Airport' }, city: { ar: 'باريس', fa: 'پاریس', en: 'Paris' }, country: { ar: 'فرنسا', fa: 'فرانسه', en: 'France' } },
  { id: 'AMS', iata: 'AMS', name: { ar: 'مطار سخيبول أمستردام', fa: 'فرودگاه آمستردام اسخیپول', en: 'Amsterdam Airport Schiphol' }, city: { ar: 'أمستردام', fa: 'آمستردام', en: 'Amsterdam' }, country: { ar: 'هولندا', fa: 'هلند', en: 'Netherlands' } },
  { id: 'FRA', iata: 'FRA', name: { ar: 'مطار فرانكفورت', fa: 'فرودگاه فرانکفورت', en: 'Frankfurt Airport' }, city: { ar: 'فرانكفورت', fa: 'فرانکفورت', en: 'Frankfurt' }, country: { ar: 'ألمانيا', fa: 'آلمان', en: 'Germany' } },
  
  // Asia
  { id: 'KUL', iata: 'KUL', name: { ar: 'مطار كوالالمبور الدولي', fa: 'فرودگاه بین‌المللی کوالالامپور', en: 'Kuala Lumpur International Airport' }, city: { ar: 'كوالالمبور', fa: 'کوالالامپور', en: 'Kuala Lumpur' }, country: { ar: 'ماليزيا', fa: 'مالزی', en: 'Malaysia' } },
  { id: 'BKK', iata: 'BKK', name: { ar: 'مطار سوفارنابومي', fa: 'فرودگاه سووارنابومی', en: 'Suvarnabhumi Airport' }, city: { ar: 'بانكوك', fa: 'بانکوک', en: 'Bangkok' }, country: { ar: 'تايلاند', fa: 'تایلند', en: 'Thailand' } },
];