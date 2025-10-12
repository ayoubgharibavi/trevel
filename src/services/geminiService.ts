
import { GoogleGenAI, Type } from "@google/genai";
import type { SearchQuery, Flight, Language } from '../types';

// Read API key from Vite env (must be defined at build time)
const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;

// Temporarily disable Gemini API to avoid CORS issues
// if (!API_KEY) {
//   throw new Error("API_KEY environment variable not set.");
// }

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getFlightSchema = (lang: Language) => ({
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: lang === 'ar' ? "معرف فريد للرحلة" : lang === 'fa' ? "شناسه یکتای پرواز" : "Unique flight identifier" },
    airline: { type: Type.STRING, description: lang === 'ar' ? "اسم شركة الطيران" : lang === 'fa' ? "نام شرکت هواپیمایی" : "Airline name" },
    airlineLogoUrl: { type: Type.STRING, description: lang === 'ar' ? "عنوان URL وهمي لشعار شركة الطيران، على سبيل المثال، https://i.pravatar.cc/40" : lang === 'fa' ? "URL لوگوی شرکت هواپیمایی، برای مثال https://i.pravatar.cc/40" : "A mock URL for the airline logo, e.g., https://i.pravatar.cc/40" },
    flightNumber: { type: Type.STRING, description: lang === 'ar' ? "رقم الرحلة، على سبيل المثال، 'IR 123'" : lang === 'fa' ? "شماره پرواز، برای مثال 'IR 123'" : "Flight number, e.g., 'IR 123'" },
    departure: {
      type: Type.OBJECT,
      properties: {
        airportCode: { type: Type.STRING, description: lang === 'ar' ? "رمز IATA لمطار المغادرة" : lang === 'fa' ? "کد یاتا فرودگاه مبدا" : "IATA code for the departure airport" },
        airportName: { type: Type.STRING, description: lang === 'ar' ? "الاسم الكامل لمطار المغادرة" : lang === 'fa' ? "نام کامل فرودگاه مبدا" : "Full name of the departure airport" },
        city: { type: Type.STRING, description: lang === 'ar' ? "مدينة المغادرة" : lang === 'fa' ? "شهر مبدا" : "Departure city" },
        dateTime: { type: Type.STRING, description: lang === 'ar' ? "تاريخ ووقت المغادرة بتنسيق ISO 8601" : lang === 'fa' ? "تاریخ و زمان حرکت با فرمت ISO 8601" : "Departure date and time in ISO 8601 format" },
      },
      required: ["airportCode", "airportName", "city", "dateTime"],
    },
    arrival: {
      type: Type.OBJECT,
      properties: {
        airportCode: { type: Type.STRING, description: lang === 'ar' ? "رمز IATA لمطار الوصول" : lang === 'fa' ? "کد یاتا فرودگاه مقصد" : "IATA code for the arrival airport" },
        airportName: { type: Type.STRING, description: lang === 'ar' ? "الاسم الكامل لمطار الوصول" : lang === 'fa' ? "نام کامل فرودگاه مقصد" : "Full name of the arrival airport" },
        city: { type: Type.STRING, description: lang === 'ar' ? "مدينة الوصول" : lang === 'fa' ? "شهر مقصد" : "Arrival city" },
        dateTime: { type: Type.STRING, description: lang === 'ar' ? "تاريخ ووقت الوصول بتنسيق ISO 8601" : lang === 'fa' ? "تاریخ و زمان رسیدن با فرمت ISO 8601" : "Arrival date and time in ISO 8601 format" },
      },
      required: ["airportCode", "airportName", "city", "dateTime"],
    },
    duration: { type: Type.STRING, description: lang === 'ar' ? "إجمالي مدة الرحلة، على سبيل المثال، '3h 30m'" : lang === 'fa' ? "مدت زمان کل پرواز، برای مثال '3h 30m'" : "Total flight duration, e.g., '3h 30m'" },
    stops: { type: Type.INTEGER, description: lang === 'ar' ? "عدد التوقفات (0 للرحلة المباشرة)" : lang === 'fa' ? "تعداد توقف‌ها (0 برای مستقیم)" : "Number of stops (0 for direct)" },
    price: { type: Type.NUMBER, description: lang === 'ar' ? "السعر الأساسي للتذكرة بالريال الإيراني" : lang === 'fa' ? "قیمت پایه بلیط به ریال ایران" : "Base ticket price in Iranian Rials (IRR)" },
    taxes: { type: Type.NUMBER, description: lang === 'ar' ? "الضرائب والرسوم بالريال الإيراني" : lang === 'fa' ? "مالیات و عوارض به ریال ایران" : "Taxes and fees in Iranian Rials (IRR)" },
    flightClass: { type: Type.STRING, description: lang === 'ar' ? "درجة الرحلة، على سبيل المثال، 'اقتصادي'" : lang === 'fa' ? "کلاس پروازی، برای مثال 'اکونومی'" : "Flight class, e.g., 'Economy'" },
    aircraft: { type: Type.STRING, description: lang === 'ar' ? "نوع الطائرة، على سبيل المثال، 'Boeing 737'" : lang === 'fa' ? "نوع هواپیما، برای مثال 'Boeing 737'" : "Aircraft type, e.g., 'Boeing 737'" },
    availableSeats: { type: Type.INTEGER, description: lang === 'ar' ? "عدد المقاعد المتاحة" : lang === 'fa' ? "تعداد صندلی‌های موجود" : "Number of available seats" },
    baggageAllowance: { type: Type.STRING, description: lang === 'ar' ? "الوزن المسموح به للأمتعة، على سبيل المثال، '20 كجم'" : lang === 'fa' ? "میزان بار مجاز، برای مثال '20 کیلوگرم'" : "Baggage allowance, e.g., '20 kg'" },
  },
  required: [
    "id", "airline", "airlineLogoUrl", "flightNumber", "departure", "arrival", 
    "duration", "stops", "price", "taxes", "flightClass", "aircraft", "availableSeats", "baggageAllowance"
  ],
});

const generatePrompt = (query: SearchQuery, lang: Language): string => {
  const { from, to, departureDate, returnDate, passengers, tripType } = query;

  if (lang === 'ar') {
      const tripDetails = tripType === 'ROUND_TRIP' 
        ? `رحلة ذهاب وعودة من ${from} إلى ${to}، المغادرة في ${departureDate} والعودة في ${returnDate}`
        : `رحلة باتجاه واحد من ${from} إلى ${to} في ${departureDate}`;
      const passengerDetails = `لـ ${passengers?.adults || 1} بالغ، و ${passengers?.children || 0} طفل، و ${passengers?.infants || 0} رضيع`;
      return `
        قم بإنشاء قائمة واقعية من 5 إلى 8 خيارات طيران لـ ${tripDetails}.
        الرحلة مخصصة لـ ${passengerDetails}.
        استخدم أسماء شركات طيران إيرانية ودولية معروفة.
        يجب أن تكون الأسعار بالريال الإيراني.
        قم بتضمين درجة الرحلة، ونوع الطائرة، وعدد قليل من المقاعد المتاحة، والوزن المسموح به للأمتعة.
        تأكد من أن أوقات المغادرة والوصول منطقية للتواريخ المحددة.
        يجب أن تكون الاستجابة عبارة عن مصفوفة JSON من كائنات الرحلات التي تلتزم بالمخطط المقدم.
      `;
  } else if (lang === 'fa') {
      const tripDetails = tripType === 'ROUND_TRIP' 
        ? `پرواز رفت و برگشت از ${from} به ${to}، حرکت در ${departureDate} و بازگشت در ${returnDate}`
        : `پرواز یک طرفه از ${from} به ${to} در ${departureDate}`;
      const passengerDetails = `برای ${passengers?.adults || 1} بزرگسال، ${passengers?.children || 0} کودک و ${passengers?.infants || 0} نوزاد`;
      return `
        یک لیست واقعی شامل 5 تا 8 گزینه پرواز برای ${tripDetails} ایجاد کن.
        این پرواز برای ${passengerDetails} است.
        از نام‌های شرکت‌های هواپیمایی معروف ایرانی و بین‌المللی استفاده کن.
        قیمت‌ها باید به ریال ایران باشند.
        کلاس پرواز، نوع هواپیما، تعداد صندلی‌های موجود و میزان بار مجاز را نیز لحاظ کن.
        اطمینان حاصل کن که زمان‌های حرکت و رسیدن برای تاریخ‌های مشخص شده منطقی هستند.
        پاسخ باید یک آرایه JSON از اشیاء پرواز باشد که با اسکیمای ارائه شده مطابقت دارد.
      `;
  } else { // lang === 'en'
      const tripDetails = tripType === 'ROUND_TRIP' 
        ? `a round-trip flight from ${from} to ${to}, departing on ${departureDate} and returning on ${returnDate}`
        : `a one-way flight from ${from} to ${to} on ${departureDate}`;
      const passengerDetails = `for ${passengers?.adults || 1} adult(s), ${passengers?.children || 0} child(ren), and ${passengers?.infants || 0} infant(s)`;
      return `
        Create a realistic list of 5 to 8 flight options for ${tripDetails}.
        The flight is for ${passengerDetails}.
        Use well-known Iranian and international airline names.
        Prices must be in Iranian Rials (IRR).
        Include the flight class, aircraft type, a low number of available seats, and baggage allowance.
        Ensure departure and arrival times are logical for the specified dates.
        The response must be a JSON array of flight objects that adheres to the provided schema.
      `;
  }
};

export const generateFlights = async (query: SearchQuery, lang: Language): Promise<Flight[]> => {
  try {
    // Use backend AI search endpoint instead of direct Gemini API call
    const response = await fetch('http://89.42.199.60/api/v1/flights/ai-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: query.from,
        to: query.to,
        departureDate: query.departureDate,
        adults: (query.passengers?.adults || 1).toString(),
        children: (query.passengers?.children || 0).toString(),
        infants: (query.passengers?.infants || 0).toString(),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const flights = await response.json();
    return Array.isArray(flights) ? flights : [flights];
  } catch (error) {
    console.error('Error generating flights with AI search:', error);
    // Return empty array instead of throwing error
    return [];
  }
};
