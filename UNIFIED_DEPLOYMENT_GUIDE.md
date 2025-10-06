# راهنمای دیپلوی یکپارچه Trevel روی سرور ای پنل
# همه چیز روی یک سرور: Frontend + Backend + Database

## 🎯 هدف: یکپارچه‌سازی کامل

### ساختار پیشنهادی:
```
/www/wwwroot/hurparvaz.com/
├── index.html (Frontend)
├── assets/ (CSS, JS, Images)
├── api/ (Backend API)
├── database/ (SQLite Database)
└── logs/ (Application Logs)
```

## 📋 مراحل دیپلوی یکپارچه

### مرحله 1: آماده‌سازی فایل‌ها

#### 1.1: Frontend Build
```bash
npm run build:prod
```

#### 1.2: Backend Build
```bash
cd backend
npm run build
```

### مرحله 2: ایجاد ساختار یکپارچه

#### 2.1: ایجاد دایرکتوری‌های مورد نیاز
```bash
mkdir -p /www/wwwroot/hurparvaz.com/api
mkdir -p /www/wwwroot/hurparvaz.com/database
mkdir -p /www/wwwroot/hurparvaz.com/logs
```

#### 2.2: آپلود Frontend
- فایل‌های `dist/` را به `/www/wwwroot/hurparvaz.com/` آپلود کنید
- شامل: `index.html`, `assets/`, `images/`, `.htaccess`

#### 2.3: آپلود Backend
- فایل‌های `backend/dist/` را به `/www/wwwroot/hurparvaz.com/api/` آپلود کنید
- شامل: تمام فایل‌های build شده

### مرحله 3: تنظیمات دیتابیس

#### 3.1: SQLite Database
```bash
# ایجاد دیتابیس در مسیر مشترک
touch /www/wwwroot/hurparvaz.com/database/prod.db
chmod 666 /www/wwwroot/hurparvaz.com/database/prod.db
```

#### 3.2: تنظیم DATABASE_URL
```
DATABASE_URL=file:/www/wwwroot/hurparvaz.com/database/prod.db
```

### مرحله 4: تنظیمات ای پنل

#### 4.1: دامنه اصلی
- **Domain**: `hurparvaz.com`
- **Port**: `80` (HTTP) و `443` (HTTPS)
- **Document Root**: `/www/wwwroot/hurparvaz.com/`
- **Default Index**: `index.html`

#### 4.2: Node.js Application
- **Domain**: `api.hurparvaz.com` یا `hurparvaz.com:3000`
- **Port**: `3000`
- **Root Path**: `/www/wwwroot/hurparvaz.com/api/`
- **Start Command**: `node main.js`
- **Run Directory**: `/www/wwwroot/hurparvaz.com/api/`

### مرحله 5: تنظیمات Proxy

#### 5.1: Reverse Proxy
- **Proxy Name**: `api`
- **Target URL**: `http://127.0.0.1:3000`
- **Send Domain**: `hurparvaz.com`
- **Proxy Directory**: `/api`

### مرحله 6: متغیرهای محیط

```bash
# در پنل ای پنل Environment Variables
NODE_ENV=production
PORT=3000
DATABASE_URL=file:/www/wwwroot/hurparvaz.com/database/prod.db
JWT_SECRET=9cb317757470f206022a085db7eb323f5942fa56b0739274add4545bd9ea34466058b773a4ceb2c9d111ac05713350d0a58e1100e0722a12ae1de8a20206301e
JWT_EXPIRES_IN=7d
SEPEHR_API_BASE_URL=https://partners.sepehrsupport.ir
SEPEHR_API_KEY=your-sepehr-api-key
SEPEHR_API_SECRET=your-sepehr-api-secret
CHARTER118_BASE_URL=https://api.charter118.com
CHARTER118_API_KEY=your-charter118-api-key
CORS_ORIGIN=https://hurparvaz.com
HELMET_ENABLED=true
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
LOG_LEVEL=info
COMPRESSION_ENABLED=true
MORGAN_FORMAT=combined
```

### مرحله 7: راه‌اندازی

#### 7.1: نصب Dependencies
```bash
cd /www/wwwroot/hurparvaz.com/api/
npm install --production
```

#### 7.2: تنظیم دیتابیس
```bash
# تولید Prisma client
npx prisma generate

# اجرای migrations
npx prisma migrate deploy

# Seed دیتابیس (اختیاری)
npx prisma db seed
```

#### 7.3: راه‌اندازی Application
```bash
# شروع Node.js application
npm start
```

### مرحله 8: تنظیمات SSL

#### 8.1: گواهی SSL
- در پنل ای پنل، SSL را فعال کنید
- "Let's Encrypt" را انتخاب کنید
- "Force HTTPS" را فعال کنید

### مرحله 9: تست

#### 9.1: Frontend
- `https://hurparvaz.com` ✅
- `https://www.hurparvaz.com` ✅

#### 9.2: Backend API
- `https://hurparvaz.com/api/health` ✅
- `https://hurparvaz.com/api/auth/login` ✅

#### 9.3: دیتابیس
- فایل دیتابیس در `/www/wwwroot/hurparvaz.com/database/prod.db` ✅

## 🔧 مدیریت یکپارچه

### دستورات مفید:
```bash
# بررسی وضعیت
pm2 status

# مشاهده لاگ‌ها
pm2 logs trevel-backend

# راه‌اندازی مجدد
pm2 restart trevel-backend

# Backup دیتابیس
cp /www/wwwroot/hurparvaz.com/database/prod.db /www/wwwroot/hurparvaz.com/database/prod.db.backup.$(date +%Y%m%d_%H%M%S)

# بررسی فضای دیسک
df -h /www/wwwroot/hurparvaz.com/
```

### فایل‌های مهم:
- **Frontend**: `/www/wwwroot/hurparvaz.com/index.html`
- **Backend**: `/www/wwwroot/hurparvaz.com/api/main.js`
- **Database**: `/www/wwwroot/hurparvaz.com/database/prod.db`
- **Logs**: `/www/wwwroot/hurparvaz.com/logs/`

## ⚠️ نکات مهم

1. **امنیت**: JWT_SECRET را حتماً تغییر دهید
2. **دیتابیس**: به طور منظم backup بگیرید
3. **لاگ‌ها**: لاگ‌ها را به طور منظم پاک کنید
4. **فضای دیسک**: فضای دیسک را مانیتور کنید
5. **SSL**: گواهی SSL را فعال کنید

## 🆘 عیب‌یابی

### مشکلات رایج:
1. **Application شروع نمی‌شود**: لاگ‌ها را بررسی کنید
2. **دیتابیس مشکل دارد**: مسیر DATABASE_URL را بررسی کنید
3. **API در دسترس نیست**: Proxy settings را بررسی کنید
4. **Frontend لود نمی‌شود**: فایل‌های dist را بررسی کنید

---

**خلاصه**: این راهنما یک راه حل یکپارچه ارائه می‌دهد که همه چیز روی یک سرور باشد و از دیتابیس مشترک استفاده کند.
