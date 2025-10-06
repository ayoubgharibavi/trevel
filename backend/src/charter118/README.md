# Charter118 API Integration

این ماژول برای اتصال به [Charter118 API](https://api.charter118.com/swagger/index.html) طراحی شده است.

## ویژگی‌ها

### Backend (NestJS)
- ✅ **Charter118Service** - سرویس اصلی برای ارتباط با API
- ✅ **Charter118Controller** - کنترلر REST API
- ✅ **Charter118Module** - ماژول NestJS
- ✅ **Authentication** - احراز هویت با JWT
- ✅ **Authorization** - کنترل دسترسی بر اساس نقش
- ✅ **Error Handling** - مدیریت خطاها
- ✅ **Logging** - ثبت لاگ کامل

### Frontend (React)
- ✅ **Charter118Dashboard** - داشبورد مدیریت
- ✅ **charter118Service** - سرویس فرانت‌اند
- ✅ **UI Components** - کامپوننت‌های رابط کاربری
- ✅ **Internationalization** - پشتیبانی از چند زبان

## API Endpoints

### جستجوی پروازها
```http
POST /api/v1/charter118/search
Content-Type: application/json
Authorization: Bearer <token>

{
  "origin": "THR",
  "destination": "DXB",
  "departureDate": "2025-10-01",
  "returnDate": "2025-10-08",
  "adults": 2,
  "children": 1,
  "infants": 0,
  "cabinClass": "economy"
}
```

### دریافت جزئیات پرواز
```http
GET /api/v1/charter118/flight/{flightId}
Authorization: Bearer <token>
```

### رزرو پرواز
```http
POST /api/v1/charter118/book
Content-Type: application/json
Authorization: Bearer <token>

{
  "flightId": "flight-123",
  "passengers": {
    "adults": [
      {
        "firstName": "علی",
        "lastName": "احمدی",
        "nationality": "Iranian",
        "gender": "Male"
      }
    ],
    "children": [],
    "infants": []
  },
  "contactInfo": {
    "email": "user@example.com",
    "phone": "09123456789",
    "firstName": "علی",
    "lastName": "احمدی"
  }
}
```

### دریافت وضعیت رزرو
```http
GET /api/v1/charter118/booking/{bookingId}
Authorization: Bearer <token>
```

### لغو رزرو
```http
DELETE /api/v1/charter118/booking/{bookingId}
Authorization: Bearer <token>
```

### دریافت لیست فرودگاه‌ها
```http
GET /api/v1/charter118/airports
Authorization: Bearer <token>
```

### دریافت لیست ایرلاین‌ها
```http
GET /api/v1/charter118/airlines
Authorization: Bearer <token>
```

### تست اتصال
```http
GET /api/v1/charter118/test-connection
Authorization: Bearer <token>
```

### بررسی وضعیت API
```http
GET /api/v1/charter118/health
Authorization: Bearer <token>
```

## تنظیمات

### Environment Variables
```env
# Charter118 API Configuration
CHARTER118_BASE_URL="https://api.charter118.com"
CHARTER118_API_KEY="your-charter118-api-key"
```

### دسترسی‌ها
- **ADMIN** - دسترسی کامل
- **SUPER_ADMIN** - دسترسی کامل
- **USER** - دسترسی محدود

## نحوه استفاده

### 1. تنظیم Environment Variables
```bash
# در فایل .env
CHARTER118_BASE_URL="https://api.charter118.com"
CHARTER118_API_KEY="your-api-key-here"
```

### 2. راه‌اندازی Backend
```bash
cd backend
npm install
npm run start:dev
```

### 3. راه‌اندازی Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. دسترسی به داشبورد
1. وارد پنل مدیریت شوید
2. از منوی کناری "Charter118" را انتخاب کنید
3. تست اتصال را انجام دهید
4. جستجوی پروازها را شروع کنید

## ویژگی‌های پیشرفته

### مدیریت خطا
- ✅ **Retry Logic** - تلاش مجدد در صورت خطا
- ✅ **Timeout Handling** - مدیریت timeout
- ✅ **Error Logging** - ثبت خطاها
- ✅ **User-friendly Messages** - پیام‌های کاربرپسند

### امنیت
- ✅ **JWT Authentication** - احراز هویت
- ✅ **Role-based Access** - کنترل دسترسی
- ✅ **API Key Protection** - محافظت از کلید API
- ✅ **Request Validation** - اعتبارسنجی درخواست‌ها

### عملکرد
- ✅ **Connection Pooling** - مدیریت اتصالات
- ✅ **Caching** - کش کردن نتایج
- ✅ **Async Operations** - عملیات ناهمزمان
- ✅ **Response Optimization** - بهینه‌سازی پاسخ‌ها

## مثال‌های استفاده

### جستجوی پرواز
```typescript
import { charter118Service } from './services/charter118Service';

const searchRequest = {
  origin: 'THR',
  destination: 'DXB',
  departureDate: '2025-10-01',
  adults: 2,
  children: 1,
  cabinClass: 'economy'
};

const result = await charter118Service.searchFlights(searchRequest);
if (result.success) {
  console.log('Found flights:', result.data);
} else {
  console.error('Search failed:', result.error);
}
```

### رزرو پرواز
```typescript
const bookingRequest = {
  flightId: 'flight-123',
  passengers: {
    adults: [{ firstName: 'علی', lastName: 'احمدی', nationality: 'Iranian', gender: 'Male' }]
  },
  contactInfo: {
    email: 'user@example.com',
    phone: '09123456789',
    firstName: 'علی',
    lastName: 'احمدی'
  }
};

const bookingResult = await charter118Service.bookFlight(bookingRequest);
if (bookingResult.success) {
  console.log('Booking successful:', bookingResult.bookingId);
}
```

## عیب‌یابی

### مشکلات رایج

1. **خطای اتصال**
   - بررسی URL و API Key
   - تست اتصال اینترنت
   - بررسی firewall

2. **خطای احراز هویت**
   - بررسی JWT token
   - بررسی نقش کاربر
   - بررسی دسترسی‌ها

3. **خطای API**
   - بررسی format درخواست
   - بررسی پارامترهای اجباری
   - بررسی rate limits

### لاگ‌ها
```bash
# مشاهده لاگ‌های Charter118
tail -f logs/charter118.log

# لاگ‌های NestJS
npm run start:dev | grep Charter118
```

## پشتیبانی

برای پشتیبانی و گزارش باگ:
- **Email**: support@trevel.com
- **Documentation**: [Charter118 API Docs](https://api.charter118.com/swagger/index.html)
- **Issues**: GitHub Issues

## نسخه‌ها

- **v1.0.0** - نسخه اولیه
  - پیاده‌سازی کامل API
  - داشبورد مدیریت
  - پشتیبانی از چند زبان
  - مدیریت خطا و امنیت
