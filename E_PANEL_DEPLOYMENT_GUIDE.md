# راهنمای دیپلوی Trevel روی سرور ای پنل

## 📋 مراحل دیپلوی

### مرحله 1: آماده‌سازی فایل‌ها

1. **Frontend Build** (انجام شده ✅):
   ```bash
   npm run build:prod
   ```
   فایل‌های build شده در پوشه `dist/` قرار دارند.

2. **Backend آماده**:
   - فایل‌های TypeScript در پوشه `backend/src/` هستند
   - نیازی به build نیست، Node.js مستقیماً TypeScript رو اجرا می‌کنه

### مرحله 2: آپلود فایل‌ها به سرور ای پنل

#### 2.1: آپلود Frontend
- تمام محتویات پوشه `dist/` رو به پوشه `public_html/` یا `www/` سرور آپلود کنید
- این شامل فایل‌های زیر است:
  - `index.html`
  - پوشه `assets/` (شامل CSS و JS)

#### 2.2: آپلود Backend
- پوشه `backend/` رو به پوشه `api/` یا `backend/` سرور آپلود کنید
- فایل‌های مهم:
  - `src/` (تمام کدهای TypeScript)
  - `package.json`
  - `prisma/` (شامل schema و migrations)
  - `env.production` (متغیرهای محیط)

### مرحله 3: تنظیمات سرور ای پنل

#### 3.1: ایجاد دامنه
- در پنل ای پنل، دامنه خود را اضافه کنید
- Document Root را به پوشه `public_html/` تنظیم کنید

#### 3.2: تنظیم Node.js
- در پنل ای پنل، Node.js را فعال کنید
- ورژن Node.js را روی 18 یا بالاتر تنظیم کنید
- Application Root را به پوشه `backend/` تنظیم کنید
- Start Command: `npm start`
- Port: `3000` (یا پورت دلخواه)

#### 3.3: تنظیم متغیرهای محیط
- در پنل ای پنل، Environment Variables را اضافه کنید:
  ```
  NODE_ENV=production
  PORT=3000
  DATABASE_URL=file:./prod.db
  JWT_SECRET=your-super-secure-jwt-secret-key
  JWT_EXPIRES_IN=7d
  SEPEHR_API_BASE_URL=https://partners.sepehrsupport.ir
  SEPEHR_API_KEY=your-sepehr-api-key
  SEPEHR_API_SECRET=your-sepehr-api-secret
  CHARTER118_BASE_URL=https://api.charter118.com
  CHARTER118_API_KEY=your-charter118-api-key
  CORS_ORIGIN=https://your-domain.com
  ```

### مرحله 4: تنظیمات دیتابیس

#### 4.1: SQLite (پیشنهادی)
- SQLite نیازی به تنظیمات خاص ندارد
- فایل دیتابیس در پوشه `backend/` ایجاد می‌شود

#### 4.2: MySQL (اختیاری)
- اگر می‌خواهید از MySQL استفاده کنید:
  - در پنل ای پنل، دیتابیس MySQL ایجاد کنید
  - DATABASE_URL را تغییر دهید:
    ```
    DATABASE_URL=mysql://username:password@localhost:3306/database_name
    ```

### مرحله 5: تنظیمات Nginx (اختیاری)

اگر ای پنل شما Nginx پشتیبانی می‌کند، فایل `nginx.conf` را در پنل تنظیم کنید.

### مرحله 6: راه‌اندازی

1. **نصب Dependencies**:
   - در پنل ای پنل، دستور `npm install` را اجرا کنید

2. **راه‌اندازی دیتابیس**:
   - دستور `npx prisma migrate deploy` را اجرا کنید
   - دستور `npx prisma generate` را اجرا کنید

3. **راه‌اندازی سرویس**:
   - Node.js application را start کنید

### مرحله 7: تست

- Frontend: `https://your-domain.com`
- Backend API: `https://your-domain.com:3000/api`
- Health Check: `https://your-domain.com:3000/health`

## 🔧 مدیریت

### دستورات مفید در پنل ای پنل:
- **Restart Application**: برای راه‌اندازی مجدد
- **View Logs**: برای مشاهده لاگ‌ها
- **Environment Variables**: برای تغییر متغیرهای محیط
- **File Manager**: برای مدیریت فایل‌ها

### Backup:
- فایل‌های مهم برای backup:
  - `backend/prod.db` (دیتابیس)
  - `backend/logs/` (لاگ‌ها)
  - `public_html/` (frontend)

## ⚠️ نکات مهم

1. **امنیت**: JWT_SECRET را حتماً تغییر دهید
2. **دامنه**: CORS_ORIGIN را با دامنه واقعی تنظیم کنید
3. **پورت**: مطمئن شوید پورت 3000 در دسترس است
4. **SSL**: گواهی SSL را فعال کنید
5. **Backup**: به طور منظم backup بگیرید

## 🆘 عیب‌یابی

### مشکلات رایج:
1. **Application شروع نمی‌شود**: لاگ‌ها را بررسی کنید
2. **API در دسترس نیست**: پورت و CORS را بررسی کنید
3. **دیتابیس مشکل دارد**: DATABASE_URL را بررسی کنید
4. **Frontend لود نمی‌شود**: فایل‌های dist را بررسی کنید

### بررسی وضعیت:
- در پنل ای پنل، وضعیت Application را بررسی کنید
- لاگ‌ها را مطالعه کنید
- Health check را تست کنید

