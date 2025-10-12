# 🎯 راهنمای تست سیستم رزرو CRS

## 🚀 **دسترسی به سیستم:**

### **Frontend:**
```
http://localhost:5173/?test=crs
```

### **Backend APIs:**
```
POST /api/v1/booking/create
GET  /api/v1/booking/status/:id
GET  /api/v1/booking/user-bookings
POST /api/v1/booking/admin/confirm
GET  /api/v1/wallet/balance
POST /api/v1/wallet/block
POST /api/v1/wallet/unblock
```

## 📋 **مراحل تست:**

### **1️⃣ تست Frontend:**
1. باز کردن `http://localhost:5173/?test=crs`
2. انتخاب یکی از پروازهای نمونه
3. تکمیل اطلاعات مسافران
4. وارد کردن اطلاعات تماس
5. انتخاب روش پرداخت
6. تأیید نهایی و ایجاد رزرو

### **2️⃣ تست Backend:**
1. بررسی لاگ‌های سرور
2. بررسی database برای رکوردهای جدید
3. تست API endpoints با Postman/curl

### **3️⃣ تست Admin Panel:**
1. ورود به پنل ادمین
2. مشاهده رزروهای جدید
3. تأیید/رد رزروها
4. بررسی صدور خودکار بلیط

## 🔧 **فایل‌های ایجاد شده:**

### **Backend:**
- ✅ `crs-booking.service.ts` - سرویس اصلی رزرو
- ✅ `crs-booking.controller.ts` - کنترلر API
- ✅ `wallet-block.service.ts` - سرویس بلوکه کردن پول
- ✅ `wallet.controller.ts` - کنترلر کیف پول
- ✅ `admin-bookings.controller.ts` - مدیریت رزروها

### **Frontend:**
- ✅ `CRSBookingFlow.tsx` - فلوی رزرو
- ✅ `CRSBookingTest.tsx` - صفحه تست
- ✅ `AdminBookingManagement.tsx` - مدیریت ادمین

### **Database:**
- ✅ جدول `Booking` - رزروها
- ✅ جدول `WalletTransaction` - تراکنش‌های کیف پول
- ✅ جدول `Passenger` - مسافران
- ✅ جدول `Ticket` - بلیط‌ها

## 🎯 **سناریوهای تست:**

### **سناریو 1: رزرو موفق**
```
1. کاربر پرواز را انتخاب می‌کند
2. اطلاعات مسافران را وارد می‌کند
3. اطلاعات تماس را تکمیل می‌کند
4. روش پرداخت را انتخاب می‌کند
5. رزرو ایجاد می‌شود
6. پول بلوکه می‌شود
7. ادمین رزرو را تأیید می‌کند
8. بلیط صادر می‌شود
9. پول از بلوکه به پرداخت منتقل می‌شود
```

### **سناریو 2: رد رزرو**
```
1. کاربر رزرو را ایجاد می‌کند
2. پول بلوکه می‌شود
3. ادمین رزرو را رد می‌کند
4. پول آزاد می‌شود
5. رزرو به وضعیت REJECTED تغییر می‌کند
```

### **سناریو 3: خطا در رزرو**
```
1. کاربر رزرو را ایجاد می‌کند
2. خطا در سیستم رخ می‌دهد
3. پول خودکار آزاد می‌شود
4. رزرو به وضعیت FAILED تغییر می‌کند
```

## 🔍 **بررسی‌های مهم:**

### **Database Checks:**
```sql
-- بررسی رزروها
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;

-- بررسی تراکنش‌های کیف پول
SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 10;

-- بررسی مسافران
SELECT * FROM passengers ORDER BY created_at DESC LIMIT 10;

-- بررسی بلیط‌ها
SELECT * FROM tickets ORDER BY created_at DESC LIMIT 10;
```

### **API Tests:**
```bash
# ایجاد رزرو
curl -X POST http://localhost:3000/api/v1/booking/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "flightId": "crs-flight-1",
    "passengers": [
      {
        "firstName": "علی",
        "lastName": "احمدی",
        "gender": "MALE",
        "birthDate": "1990-01-01",
        "nationality": "Iranian"
      }
    ],
    "contactInfo": {
      "email": "test@example.com",
      "phone": "+989123456789"
    },
    "paymentMethod": "wallet"
  }'

# بررسی وضعیت رزرو
curl -X GET http://localhost:3000/api/v1/booking/status/BOOKING_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# تأیید رزرو توسط ادمین
curl -X POST http://localhost:3000/api/v1/booking/admin/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "bookingId": "BOOKING_ID",
    "action": "CONFIRM",
    "adminNotes": "تأیید شد"
  }'
```

## 📊 **نکات مهم:**

### **امنیت:**
- ✅ تمام API ها احراز هویت می‌شوند
- ✅ عملیات ادمین نیاز به نقش ADMIN دارد
- ✅ پول قبل از تأیید بلوکه می‌شود

### **Performance:**
- ✅ استفاده از transaction برای عملیات مالی
- ✅ Indexing مناسب در database
- ✅ Error handling کامل

### **Scalability:**
- ✅ معماری microservices
- ✅ Domain-driven design
- ✅ Separation of concerns

## 🎉 **نتیجه:**

سیستم CRS Booking یک راه‌حل کامل و حرفه‌ای برای مدیریت رزروهای آنلاین است که:

1. ✅ **امنیت مالی** را تضمین می‌کند
2. ✅ **تجربه کاربری** بهتری ارائه می‌دهد
3. ✅ **مدیریت آسان** برای ادمین‌ها فراهم می‌کند
4. ✅ **مقیاس‌پذیری** برای رشد آینده دارد

**آماده برای استفاده در محیط production!** 🚀

