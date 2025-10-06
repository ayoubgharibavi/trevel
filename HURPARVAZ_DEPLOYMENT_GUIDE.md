# 🚀 راهنمای دیپلوی Trevel روی دامنه hurparvaz.com

## 📋 مراحل کامل دیپلوی

### مرحله 1: آپلود فایل‌های Frontend

1. **فایل آماده**: `hurparvaz-frontend.zip`
2. **مسیر آپلود**: `/www/wwwroot/hurparvaz.com/`
3. **مراحل**:
   - در پنل ای پنل، روی دامنه `hurparvaz.com` کلیک کنید
   - روی "Conf" کلیک کنید
   - در تب "Site directory"، مسیر `/www/wwwroot/hurparvaz.com/` را انتخاب کنید
   - فایل `hurparvaz-frontend.zip` را آپلود کنید
   - فایل را extract کنید
   - تمام فایل‌های داخل `dist/` را به root دامنه منتقل کنید

### مرحله 2: تنظیمات دامنه

1. **در پنل ای پنل**:
   - روی دامنه `hurparvaz.com` کلیک کنید
   - روی "Conf" کلیک کنید
   - در تب "Domain Manager":
     - `hurparvaz.com` (پورت 80)
     - `www.hurparvaz.com` (پورت 80)
   - در تب "Default indexes":
     - `index.html` را به عنوان فایل پیش‌فرض تنظیم کنید

### مرحله 3: آپلود و تنظیم Backend

1. **فایل آماده**: `hurparvaz-backend.zip`
2. **مسیر آپلود**: `/www/wwwroot/api/` یا `/www/wwwroot/backend/`
3. **مراحل**:
   - فایل `hurparvaz-backend.zip` را آپلود کنید
   - فایل را extract کنید
   - پوشه `backend/` را به `api/` یا `backend/` منتقل کنید

### مرحله 4: تنظیم Node.js

1. **در پنل ای پنل**:
   - به بخش "Node Project" بروید
   - روی "Add site" کلیک کنید
   - تنظیمات:
     - **Domain**: `api.hurparvaz.com` یا `hurparvaz.com:3000`
     - **Port**: `3000`
     - **Root Path**: `/www/wwwroot/api/`
     - **Node Version**: `18.x` یا بالاتر
     - **Start Command**: `npm start`
     - **Run Directory**: `/www/wwwroot/api/`

### مرحله 5: تنظیم متغیرهای محیط

در پنل ای پنل، Environment Variables را اضافه کنید:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./prod.db
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
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

### مرحله 6: نصب Dependencies و راه‌اندازی

1. **در Terminal ای پنل**:
   ```bash
   cd /www/wwwroot/api/
   npm install
   npx prisma generate
   npx prisma migrate deploy
   ```

2. **راه‌اندازی Application**:
   - در پنل ای پنل، Node.js application را start کنید
   - یا از دستور `npm start` استفاده کنید

### مرحله 7: تنظیمات SSL

1. **در پنل ای پنل**:
   - روی دامنه `hurparvaz.com` کلیک کنید
   - روی "Conf" کلیک کنید
   - در تب "SSL":
     - "Let's Encrypt" را انتخاب کنید
     - گواهی SSL را دریافت کنید
     - "Force HTTPS" را فعال کنید

### مرحله 8: تنظیمات Proxy (اختیاری)

اگر می‌خواهید API از همان دامنه سرو شود:

1. **در پنل ای پنل**:
   - روی دامنه `hurparvaz.com` کلیک کنید
   - روی "Conf" کلیک کنید
   - در تب "Reverse proxy":
     - **Proxy Name**: `api`
     - **Target URL**: `http://127.0.0.1:3000`
     - **Send Domain**: `hurparvaz.com`
     - **Proxy Directory**: `/api`

### مرحله 9: تست

1. **Frontend**: `https://hurparvaz.com`
2. **Backend API**: `https://hurparvaz.com:3000/api` یا `https://hurparvaz.com/api`
3. **Health Check**: `https://hurparvaz.com:3000/health`

## 🔧 دستورات مفید

### در Terminal ای پنل:
```bash
# نصب dependencies
cd /www/wwwroot/api/
npm install

# تولید Prisma client
npx prisma generate

# اجرای migrations
npx prisma migrate deploy

# راه‌اندازی application
npm start

# مشاهده لاگ‌ها
tail -f logs/combined.log

# بررسی وضعیت
pm2 status
```

### مدیریت Application:
```bash
# شروع
pm2 start ecosystem.config.js

# توقف
pm2 stop trevel-backend

# راه‌اندازی مجدد
pm2 restart trevel-backend

# مشاهده لاگ‌ها
pm2 logs trevel-backend
```

## ⚠️ نکات مهم

1. **امنیت**: JWT_SECRET را حتماً تغییر دهید
2. **دامنه**: CORS_ORIGIN را با دامنه واقعی تنظیم کنید
3. **پورت**: مطمئن شوید پورت 3000 در دسترس است
4. **SSL**: گواهی SSL را فعال کنید
5. **Backup**: به طور منظم backup بگیرید

## 🆘 عیب‌یابی

### مشکلات رایج:

1. **Application شروع نمی‌شود**:
   - لاگ‌ها را بررسی کنید
   - Dependencies را نصب کنید
   - متغیرهای محیط را بررسی کنید

2. **API در دسترس نیست**:
   - پورت 3000 را بررسی کنید
   - CORS را بررسی کنید
   - Proxy settings را بررسی کنید

3. **دیتابیس مشکل دارد**:
   - DATABASE_URL را بررسی کنید
   - Prisma migrations را اجرا کنید

4. **Frontend لود نمی‌شود**:
   - فایل‌های dist را بررسی کنید
   - .htaccess را بررسی کنید
   - SSL را بررسی کنید

## 📞 پشتیبانی

در صورت مشکل:
1. لاگ‌ها را بررسی کنید
2. وضعیت Application را بررسی کنید
3. متغیرهای محیط را بررسی کنید
4. Dependencies را نصب کنید

---

**خلاصه**: فایل‌های شما کاملاً آماده است! فقط کافیه مراحل بالا را دنبال کنید.

