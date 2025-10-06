# 🚀 Trevel - سیستم رزرو بلیط هوایی

## دیپلوی سریع روی سرور ایران سرور

### ⚡ شروع سریع

1. **آپلود پروژه به سرور**
   ```bash
   scp -r . user@your-server:/var/www/trevel/
   ```

2. **تنظیم متغیرهای محیط**
   ```bash
   nano env.production
   nano backend/env.production
   ```

3. **اجرای دیپلوی**
   ```bash
   ./deploy.sh
   ```

### 📁 فایل‌های مهم

- `deploy.sh` - اسکریپت دیپلوی اصلی
- `backup.sh` - اسکریپت backup گیری
- `monitor.sh` - اسکریپت مانیتورینگ
- `docker-compose.prod.yml` - تنظیمات Docker برای production
- `nginx.conf` - تنظیمات Nginx
- `DEPLOYMENT_GUIDE.md` - راهنمای کامل

### 🔧 دستورات مفید

```bash
# دیپلوی
npm run deploy

# مانیتورینگ
npm run monitor

# Backup
npm run backup

# مشاهده لاگ‌ها
docker-compose -f docker-compose.prod.yml logs -f
```

### 🌐 دسترسی

- **Frontend**: http://your-domain.com
- **API**: http://your-domain.com/api
- **Health Check**: http://your-domain.com/health

### 📞 پشتیبانی

در صورت مشکل، راهنمای کامل را در `DEPLOYMENT_GUIDE.md` مطالعه کنید.

---
**نکته**: این پروژه برای سرورهای ایران سرور بهینه شده است.

