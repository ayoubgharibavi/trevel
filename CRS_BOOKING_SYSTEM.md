# 🎯 سیستم رزرو آنلاین CRS (Customer Reservation System)

## 📋 فلوی کامل رزرو آنلاین مشابه CRS:

### 🔄 **مراحل اصلی:**

```
1. انتخاب پرواز
   ↓
2. ورود اطلاعات مسافران
   ↓
3. اطلاعات تماس
   ↓
4. انتخاب روش پرداخت
   ↓
5. تأیید نهایی
   ↓
6. پردازش رزرو
   ↓
7. تأیید توسط ادمین
   ↓
8. صدور بلیط
```

## 🏗️ **معماری سیستم:**

### **Domain-Driven Design:**
- ✅ **Booking Domain**: مدیریت رزروها
- ✅ **Payment Domain**: مدیریت پرداخت‌ها
- ✅ **Flight Domain**: مدیریت پروازها
- ✅ **User Domain**: مدیریت کاربران

### **Microservices Architecture:**
- ✅ **Booking Service**: سرویس رزرو
- ✅ **Payment Service**: سرویس پرداخت
- ✅ **Notification Service**: سرویس اطلاع‌رسانی
- ✅ **Admin Service**: سرویس مدیریت

## 🔒 **سیستم امنیتی:**

### **Wallet Blocking System:**
```
1. بررسی موجودی کیف پول
2. بلوکه کردن مبلغ رزرو
3. ایجاد تراکنش PENDING
4. کاهش موجودی قابل استفاده
5. ذخیره شماره تراکنش
```

### **Payment Flow:**
```
تأیید رزرو توسط ادمین
    ↓
انتقال پول از BLOCKED به PAID
    ↓
صدور خودکار بلیط
    ↓
تغییر وضعیت رزرو به COMPLETED
```

### **Error Handling:**
```
خطا در رزرو
    ↓
آزاد کردن پول بلوکه شده
    ↓
تغییر وضعیت تراکنش به CANCELLED
    ↓
بازگشت موجودی به کیف پول
```

## 📊 **مدیریت در پنل ادمین:**

### **Dashboard Features:**
- ✅ **لیست رزروها**: نمایش تمام رزروها با فیلتر
- ✅ **جزئیات رزرو**: اطلاعات کامل هر رزرو
- ✅ **تأیید/رد**: عملیات مدیریت رزروها
- ✅ **صدور بلیط**: صدور خودکار پس از تأیید

### **Admin Actions:**
```
مشاهده رزرو جدید
    ↓
بررسی اطلاعات مسافران
    ↓
تأیید رزرو
    ↓
صدور خودکار بلیط
    ↓
ارسال اطلاع‌رسانی به کاربر
```

## 🎛️ **Frontend Components:**

### **CRSBookingFlow:**
- ✅ **Step-by-step Process**: مراحل تدریجی رزرو
- ✅ **Passenger Management**: مدیریت مسافران
- ✅ **Contact Information**: اطلاعات تماس
- ✅ **Payment Selection**: انتخاب روش پرداخت
- ✅ **Confirmation**: تأیید نهایی

### **AdminBookingManagement:**
- ✅ **Booking List**: لیست رزروها
- ✅ **Status Management**: مدیریت وضعیت
- ✅ **Bulk Actions**: عملیات گروهی
- ✅ **Detailed View**: نمایش جزئیات

## 🔧 **Backend Services:**

### **CRSBookingService:**
```typescript
- createBooking(): ایجاد رزرو جدید
- confirmBooking(): تأیید رزرو توسط ادمین
- getBookingStatus(): دریافت وضعیت رزرو
- getUserBookings(): لیست رزروهای کاربر
```

### **WalletBlockService:**
```typescript
- blockFunds(): بلوکه کردن پول
- unblockFunds(): آزاد کردن پول
- confirmPayment(): تأیید پرداخت
- getWalletBalance(): موجودی کیف پول
```

## 📈 **Database Schema:**

### **Booking Table:**
```sql
- id: شناسه رزرو
- userId: شناسه کاربر
- flightId: شناسه پرواز
- status: وضعیت رزرو
- totalPrice: قیمت کل
- confirmationCode: کد تأیید
- sepehrBookingId: شناسه سپهر
- sepehrPnr: کد PNR سپهر
- walletTransactionId: شناسه تراکنش کیف پول
```

### **WalletTransaction Table:**
```sql
- id: شناسه تراکنش
- walletId: شناسه کیف پول
- type: نوع تراکنش (BLOCK/UNBLOCK/PAYMENT)
- amount: مبلغ
- status: وضعیت (PENDING/COMPLETED/CANCELLED)
- description: توضیحات
- metadata: اطلاعات اضافی
```

## 🚀 **API Endpoints:**

### **Public APIs:**
```
POST /api/v1/booking/create
GET  /api/v1/booking/status/:id
GET  /api/v1/booking/user-bookings
```

### **Admin APIs:**
```
POST /api/v1/booking/admin/confirm
GET  /api/v1/booking/admin/all-bookings
GET  /api/v1/booking/admin/booking/:id
```

### **Wallet APIs:**
```
GET  /api/v1/wallet/balance
POST /api/v1/wallet/block
POST /api/v1/wallet/unblock
POST /api/v1/wallet/confirm-payment/:id
```

## 🎯 **مزایای سیستم CRS:**

### **برای کاربران:**
- ✅ **تجربه کاربری بهتر**: مراحل ساده و واضح
- ✅ **امنیت بالا**: پول قبل از تأیید بلوکه می‌شود
- ✅ **شفافیت کامل**: ردیابی تمام مراحل

### **برای ادمین‌ها:**
- ✅ **کنترل کامل**: مدیریت تمام رزروها
- ✅ **کارایی بالا**: عملیات خودکار
- ✅ **گزارش‌گیری**: آمار و گزارش‌های کامل

### **برای سیستم:**
- ✅ **مقیاس‌پذیری**: معماری microservices
- ✅ **قابلیت اطمینان**: error handling کامل
- ✅ **قابلیت نگهداری**: کد تمیز و مستند

## 📋 **نتیجه‌گیری:**

سیستم CRS Booking یک راه‌حل کامل و حرفه‌ای برای مدیریت رزروهای آنلاین است که:

1. ✅ **امنیت مالی** را تضمین می‌کند
2. ✅ **تجربه کاربری** بهتری ارائه می‌دهد
3. ✅ **مدیریت آسان** برای ادمین‌ها فراهم می‌کند
4. ✅ **مقیاس‌پذیری** برای رشد آینده دارد

این سیستم آماده برای استفاده در محیط production است! 🎫✈️

