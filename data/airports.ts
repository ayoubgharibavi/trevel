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
  { id: 'AZD', iata: 'AZD', name: { ar: 'مطار الشهيد صدوقي يزد', fa: 'فرودگاه شهید صدوقی یزد', en: 'Shahid Sadooghi Airport' }, city: { ar: 'يزد', fa: 'یزد', en: 'Yazd' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'KER', iata: 'KER', name: { ar: 'مطار كرمان الدولي', fa: 'فرودگاه بین‌المللی کرمان', en: 'Kerman Airport' }, city: { ar: 'كرمان', fa: 'کرمان', en: 'Kerman' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'RAS', iata: 'RAS', name: { ar: 'مطار رشت سردار جنكل', fa: 'فرودگاه سردار جنگل رشت', en: 'Rasht Airport' }, city: { ar: 'رشت', fa: 'رشت', en: 'Rasht' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'OMH', iata: 'OMH', name: { ar: 'مطار الشهيد باکری الدولي', fa: 'فرودگاه بین‌المللی شهید باکری ارومیه', en: 'Urmia Airport' }, city: { ar: 'أرومية', fa: 'ارومیه', en: 'Urmia' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'SRY', iata: 'SRY', name: { ar: 'مطار دشت ناز ساري', fa: 'فرودگاه دشت ناز ساری', en: 'Sari Dasht-e Naz Airport' }, city: { ar: 'ساري', fa: 'ساری', en: 'Sari' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'ZAH', iata: 'ZAH', name: { ar: 'مطار زاهدان الدولي', fa: 'فرودگاه بین‌المللی زاهدان', en: 'Zahedan International Airport' }, city: { ar: 'زاهدان', fa: 'زاهدان', en: 'Zahedan' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'BUZ', iata: 'BUZ', name: { ar: 'مطار بوشهر', fa: 'فرودگاه بوشهر', en: 'Bushehr Airport' }, city: { ar: 'بوشهر', fa: 'بوشهر', en: 'Bushehr' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'GSM', iata: 'GSM', name: { ar: 'مطار قشم الدولي', fa: 'فرودگاه بین‌المللی قشم', en: 'Qeshm International Airport' }, city: { ar: 'قشم', fa: 'قشم', en: 'Qeshm' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'KSH', iata: 'KSH', name: { ar: 'مطار كرمانشاه', fa: 'فرودگاه کرمانشاه', en: 'Kermanshah Airport' }, city: { ar: 'كرمانشاه', fa: 'کرمانشاه', en: 'Kermanshah' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'SDG', iata: 'SDG', name: { ar: 'مطار سنندج', fa: 'فرودگاه سنندج', en: 'Sanandaj Airport' }, city: { ar: 'سنندج', fa: 'سنندج', en: 'Sanandaj' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'LRR', iata: 'LRR', name: { ar: 'مطار لارستان الدولي', fa: 'فرودگاه بین‌المللی لارستان', en: 'Larestan International Airport' }, city: { ar: 'لار', fa: 'لار', en: 'Lar' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },
  { id: 'PGU', iata: 'PGU', name: { ar: 'مطار الخليج الفارسي', fa: 'فرودگاه خلیج فارس', en: 'Persian Gulf Airport' }, city: { ar: 'عسلوية', fa: 'عسلویه', en: 'Asaluyeh' }, country: { ar: 'إيران', fa: 'ایران', en: 'Iran' } },

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
  { id: 'NJF', iata: 'NJF', name: { ar: 'مطار النجف الدولي', fa: 'فرودگاه بین‌المللی نجف', en: 'Al Najaf International Airport' }, city: { ar: 'النجف', fa: 'نجف', en: 'Najaf' }, country: { ar: 'العراق', fa: 'عراق', en: 'Iraq' } },
  { id: 'EBL', iata: 'EBL', name: { ar: 'مطار أربيل الدولي', fa: 'فرودگاه بین‌المللی اربیل', en: 'Erbil International Airport' }, city: { ar: 'أربيل', fa: 'اربیل', en: 'Erbil' }, country: { ar: 'العراق', fa: 'عراق', en: 'Iraq' } },

  // Saudi Arabia
  { id: 'JED', iata: 'JED', name: { ar: 'مطار الملك عبد العزيز الدولي', fa: 'فرودگاه بین‌المللی ملک عبدالعزیز', en: 'King Abdulaziz International Airport' }, city: { ar: 'جدة', fa: 'جده', en: 'Jeddah' }, country: { ar: 'السعودية', fa: 'عربستان سعودی', en: 'Saudi Arabia' } },
  { id: 'RUH', iata: 'RUH', name: { ar: 'مطار الملك خالد الدولي', fa: 'فرودگاه بین‌المللی ملک خالد', en: 'King Khalid International Airport' }, city: { ar: 'الرياض', fa: 'ریاض', en: 'Riyadh' }, country: { ar: 'السعودية', fa: 'عربستان سعودی', en: 'Saudi Arabia' } },

  // Qatar
  { id: 'DOH', iata: 'DOH', name: { ar: 'مطار حمد الدولي', fa: 'فرودگاه بین‌المللی حمد', en: 'Hamad International Airport' }, city: { ar: 'الدوحة', fa: 'دوحه', en: 'Doha' }, country: { ar: 'قطر', fa: 'قطر', en: 'Qatar' } },

  // Egypt
  { id: 'CAI', iata: 'CAI', name: { ar: 'مطار القاهرة الدولي', fa: 'فرودگاه بین‌المللی قاهره', en: 'Cairo International Airport' }, city: { ar: 'القاهرة', fa: 'قاهره', en: 'Cairo' }, country: { ar: 'مصر', fa: 'مصر', en: 'Egypt' } },

  // Lebanon
  { id: 'BEY', iata: 'BEY', name: { ar: 'مطار رفيق الحريري الدولي', fa: 'فرودگاه بین‌المللی رفیق حریری بیروت', en: 'Beirut–Rafic Hariri International Airport' }, city: { ar: 'بيروت', fa: 'بیروت', en: 'Beirut' }, country: { ar: 'لبنان', fa: 'لبنان', en: 'Lebanon' } },
  
  // Europe
  { id: 'LHR', iata: 'LHR', name: { ar: 'مطار هيثرو', fa: 'فرودگاه هیترو', en: 'Heathrow Airport' }, city: { ar: 'لندن', fa: 'لندن', en: 'London' }, country: { ar: 'المملكة المتحدة', fa: 'بریتانیا', en: 'United Kingdom' } },
  { id: 'CDG', iata: 'CDG', name: { ar: 'مطار شارل ديغول', fa: 'فرودگاه شارل دوگل', en: 'Charles de Gaulle Airport' }, city: { ar: 'باريس', fa: 'پاریس', en: 'Paris' }, country: { ar: 'فرنسا', fa: 'فرانسه', en: 'France' } },
  { id: 'AMS', iata: 'AMS', name: { ar: 'مطار سخيبول أمستردام', fa: 'فرودگاه آمستردام اسخیپول', en: 'Amsterdam Airport Schiphol' }, city: { ar: 'أمستردام', fa: 'آمستردام', en: 'Amsterdam' }, country: { ar: 'هولندا', fa: 'هلند', en: 'Netherlands' } },
  { id: 'FRA', iata: 'FRA', name: { ar: 'مطار فرانكفورت', fa: 'فرودگاه فرانکفورت', en: 'Frankfurt Airport' }, city: { ar: 'فرانكفورت', fa: 'فرانکفورت', en: 'Frankfurt' }, country: { ar: 'ألمانيا', fa: 'آلمان', en: 'Germany' } },
  { id: 'FCO', iata: 'FCO', name: { ar: 'مطار ليوناردو دا فينشي', fa: 'فرودگاه لئوناردو داوینچی-فیومیچینو', en: 'Leonardo da Vinci–Fiumicino Airport' }, city: { ar: 'روما', fa: 'رم', en: 'Rome' }, country: { ar: 'إيطاليا', fa: 'ایتالیا', en: 'Italy' } },
  { id: 'MAD', iata: 'MAD', name: { ar: 'مطار مدريد باراخاس الدولي', fa: 'فرودگاه مادرید-باراخاس', en: 'Adolfo Suárez Madrid–Barajas Airport' }, city: { ar: 'مدريد', fa: 'مادرید', en: 'Madrid' }, country: { ar: 'إسبانيا', fa: 'اسپانیا', en: 'Spain' } },
  { id: 'MUC', iata: 'MUC', name: { ar: 'مطار ميونخ', fa: 'فرودگاه مونیخ', en: 'Munich Airport' }, city: { ar: 'ميونخ', fa: 'مونیخ', en: 'Munich' }, country: { ar: 'ألمانيا', fa: 'آلمان', en: 'Germany' } },
  { id: 'ZRH', iata: 'ZRH', name: { ar: 'مطار زيورخ', fa: 'فرودگاه زوریخ', en: 'Zurich Airport' }, city: { ar: 'زيورخ', fa: 'زوریخ', en: 'Zurich' }, country: { ar: 'سويسرا', fa: 'سوئیس', en: 'Switzerland' } },
  { id: 'SVO', iata: 'SVO', name: { ar: 'مطار شيريميتييفو الدولي', fa: 'فرودگاه بین‌المللی شرمتیوو', en: 'Sheremetyevo International Airport' }, city: { ar: 'موسكو', fa: 'مسکو', en: 'Moscow' }, country: { ar: 'روسيا', fa: 'روسیه', en: 'Russia' } },

  // Asia
  { id: 'KUL', iata: 'KUL', name: { ar: 'مطار كوالالمبور الدولي', fa: 'فرودگاه بین‌المللی کوالالامپور', en: 'Kuala Lumpur International Airport' }, city: { ar: 'كوالالمبور', fa: 'کوالالامپور', en: 'Kuala Lumpur' }, country: { ar: 'ماليزيا', fa: 'مالزی', en: 'Malaysia' } },
  { id: 'BKK', iata: 'BKK', name: { ar: 'مطار سوفارنابومي', fa: 'فرودگاه سووارنابومی', en: 'Suvarnabhumi Airport' }, city: { ar: 'بانكوك', fa: 'بانکوک', en: 'Bangkok' }, country: { ar: 'تايلاند', fa: 'تایلند', en: 'Thailand' } },
  { id: 'SIN', iata: 'SIN', name: { ar: 'مطار شانغي سنغافورة', fa: 'فرودگاه چانگی سنگاپور', en: 'Singapore Changi Airport' }, city: { ar: 'سنغافورة', fa: 'سنگاپور', en: 'Singapore' }, country: { ar: 'سنغافورة', fa: 'سنگاپور', en: 'Singapore' } },
  { id: 'HKG', iata: 'HKG', name: { ar: 'مطار هونغ كونغ الدولي', fa: 'فرودگاه بین‌المللی هنگ کنگ', en: 'Hong Kong International Airport' }, city: { ar: 'هونغ كونغ', fa: 'هنگ کنگ', en: 'Hong Kong' }, country: { ar: 'هونغ كونغ', fa: 'هنگ کنگ', en: 'Hong Kong' } },
  { id: 'ICN', iata: 'ICN', name: { ar: 'مطار إنتشون الدولي', fa: 'فرودگاه بین‌المللی اینچئون', en: 'Incheon International Airport' }, city: { ar: 'سيول', fa: 'سئول', en: 'Seoul' }, country: { ar: 'كوريا الجنوبية', fa: 'کره جنوبی', en: 'South Korea' } },
  { id: 'NRT', iata: 'NRT', name: { ar: 'مطار ناريتا الدولي', fa: 'فرودگاه بین‌المللی ناریتا', en: 'Narita International Airport' }, city: { ar: 'طوكيو', fa: 'توکیو', en: 'Tokyo' }, country: { ar: 'اليابان', fa: 'ژاپن', en: 'Japan' } },
  { id: 'PEK', iata: 'PEK', name: { ar: 'مطار بكين العاصمة الدولي', fa: 'فرودگاه بین‌المللی پکن', en: 'Beijing Capital International Airport' }, city: { ar: 'بكين', fa: 'پکن', en: 'Beijing' }, country: { ar: 'الصين', fa: 'چین', en: 'China' } },
  { id: 'DEL', iata: 'DEL', name: { ar: 'مطار انديرا غاندي الدولي', fa: 'فرودگاه بین‌المللی ایندیرا گاندی', en: 'Indira Gandhi International Airport' }, city: { ar: 'دلهي', fa: 'دهلی', en: 'Delhi' }, country: { ar: 'الهند', fa: 'هند', en: 'India' } },

  // North America
  { id: 'JFK', iata: 'JFK', name: { ar: 'مطار جون إف كينيدي الدولي', fa: 'فرودگاه بین‌المللی جان اف کندی', en: 'John F. Kennedy International Airport' }, city: { ar: 'نيويورك', fa: 'نیویورک', en: 'New York' }, country: { ar: 'الولايات المتحدة', fa: 'ایالات متحده آمریکا', en: 'USA' } },
  { id: 'LAX', iata: 'LAX', name: { ar: 'مطار لوس أنجلوس الدولي', fa: 'فرودگاه بین‌المللی لس آنجلس', en: 'Los Angeles International Airport' }, city: { ar: 'لوس أنجلوس', fa: 'لس آنجلس', en: 'Los Angeles' }, country: { ar: 'الولايات المتحدة', fa: 'ایالات متحده آمریکا', en: 'USA' } },
  { id: 'ORD', iata: 'ORD', name: { ar: 'مطار أوهير الدولي', fa: 'فرودگاه بین‌المللی اوهیر شیکاگو', en: "O'Hare International Airport" }, city: { ar: 'شيكاغو', fa: 'شیکاگو', en: 'Chicago' }, country: { ar: 'الولايات المتحدة', fa: 'ایالات متحده آمریکا', en: 'USA' } },
  { id: 'YYZ', iata: 'YYZ', name: { ar: 'مطار تورونتو بيرسون الدولي', fa: 'فرودگاه بین‌المللی پیرسون تورنتو', en: 'Toronto Pearson International Airport' }, city: { ar: 'تورونتو', fa: 'تورنتو', en: 'Toronto' }, country: { ar: 'كندا', fa: 'کانادا', en: 'Canada' } },
  { id: 'YVR', iata: 'YVR', name: { ar: 'مطار فانكوفر الدولي', fa: 'فرودگاه بین‌المللی ونکوور', en: 'Vancouver International Airport' }, city: { ar: 'فانكوفر', fa: 'ونکوور', en: 'Vancouver' }, country: { ar: 'كندا', fa: 'کانادا', en: 'Canada' } },

  // South America
  { id: 'GRU', iata: 'GRU', name: { ar: 'مطار ساو باولو غواروليوس الدولي', fa: 'فرودگاه بین‌المللی سائو پائولو گوارولوس', en: 'São Paulo/Guarulhos International Airport' }, city: { ar: 'ساو باولو', fa: 'سائو پائولو', en: 'São Paulo' }, country: { ar: 'البرازيل', fa: 'برزیل', en: 'Brazil' } },

  // Australia
  { id: 'SYD', iata: 'SYD', name: { ar: 'مطار سيدني', fa: 'فرودگاه سیدنی', en: 'Sydney Airport' }, city: { ar: 'سيدني', fa: 'سیدنی', en: 'Sydney' }, country: { ar: 'أستراليا', fa: 'استرالیا', en: 'Australia' } },

  // Africa
  { id: 'JNB', iata: 'JNB', name: { ar: 'مطار أو آر تامبو الدولي', fa: 'فرودگاه بین‌المللی اولیور تامبو', en: 'O. R. Tambo International Airport' }, city: { ar: 'جوهانسبرغ', fa: 'ژوهانسبورگ', en: 'Johannesburg' }, country: { ar: 'جنوب أفريقيا', fa: 'آفریقای جنوبی', en: 'South Africa' } },
];
