# Persian Flight Results Components

این مجموعه کامپوننت‌ها برای نمایش نتایج پرواز با طراحی مشابه سایت‌های ایرانی ساخته شده است.

## کامپوننت‌های اصلی

### 1. PersianFlightResults
کامپوننت اصلی که تمام بخش‌های صفحه نتایج پرواز را شامل می‌شود:
- هدر جستجو
- تقویم قیمتی
- جدول مقایسه پروازها
- تب‌های مرتب‌سازی
- لیست پروازها
- سایدبار فیلترها

### 2. HorizontalPriceCalendar
تقویم قیمتی افقی که قیمت‌های روزهای مختلف را نمایش می‌دهد:
- نمایش قیمت‌ها به صورت افقی
- امکان انتخاب تاریخ
- نمایش کمترین و بیشترین قیمت
- ناوبری بین هفته‌ها

### 3. FlightComparisonTable
جدول مقایسه قیمت پروازها بر اساس شرکت هواپیمایی و تعداد توقف:
- مقایسه قیمت پروازهای مستقیم، یک توقف و بیش از یک توقف
- ناوبری بین صفحات
- نمایش قیمت‌ها بر اساس میلیون تومان

### 4. PersianFilterSidebar
سایدبار فیلترها با تمام گزینه‌های فیلتر کردن:
- فیلتر شرکت‌های هواپیمایی
- فیلتر تعداد توقف‌ها
- فیلتر قیمت با اسلایدر
- فیلتر مدت زمان سفر
- فیلتر مدت زمان توقف‌ها
- فیلتر فرودگاه‌ها
- فیلتر مدل هواپیما
- فیلتر نوع بلیط

### 5. PersianFlightCard
کارت نمایش اطلاعات پرواز:
- نمایش اطلاعات کامل پرواز
- نمایش قیمت و کمیسیون
- تب‌های اطلاعات اضافی
- دکمه انتخاب پرواز

### 6. SortTabs
تب‌های مرتب‌سازی نتایج:
- ارزان‌ترین
- سریع‌ترین
- پیشنهاد علی‌بابا
- مرتب‌سازی
- سایر

### 7. PersianResultsHeader
هدر صفحه نتایج:
- نمایش اطلاعات جستجو
- نمایش مسیر پرواز
- نمایش تعداد مسافران

## نحوه استفاده

```tsx
import { PersianFlightResults } from '@/components/PersianFlightResults';

const MyComponent = () => {
  const flights = []; // آرایه پروازها
  const searchQuery = {}; // اطلاعات جستجو
  
  return (
    <PersianFlightResults
      flights={flights}
      searchQuery={searchQuery}
      onSelectFlight={(flight) => console.log(flight)}
      refundPolicies={[]}
      advertisements={[]}
      currentUser={null}
      currencies={['IRR', 'USD']}
      popularRoutes={[]}
      onSearch={(query) => console.log(query)}
    />
  );
};
```

## ویژگی‌های طراحی

- **RTL Support**: پشتیبانی کامل از راست به چپ
- **Responsive**: طراحی واکنش‌گرا برای تمام اندازه‌های صفحه
- **Persian Typography**: استفاده از فونت‌های فارسی
- **Modern UI**: طراحی مدرن با استفاده از Tailwind CSS
- **Interactive**: تعامل کامل با کاربر

## فایل‌های مرتبط

- `src/components/PersianFlightResults.tsx` - کامپوننت اصلی
- `src/components/HorizontalPriceCalendar.tsx` - تقویم قیمتی
- `src/components/FlightComparisonTable.tsx` - جدول مقایسه
- `src/components/PersianFilterSidebar.tsx` - سایدبار فیلترها
- `src/components/PersianFlightCard.tsx` - کارت پرواز
- `src/components/SortTabs.tsx` - تب‌های مرتب‌سازی
- `src/components/PersianResultsHeader.tsx` - هدر نتایج
- `src/pages/PersianFlightResultsDemo.tsx` - صفحه نمونه

## تست

برای تست کامپوننت‌ها، از صفحه `PersianFlightResultsDemo` استفاده کنید که شامل داده‌های نمونه است.







