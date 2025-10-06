# راهنمای کامل دیپلوی Trevel روی سرور ایران سرور

## 📋 پیش‌نیازها

### 1. سرور اختصاصی ایران سرور
- **حداقل مشخصات**: 2 CPU, 4GB RAM, 50GB Storage
- **سیستم عامل**: Ubuntu 20.04 LTS یا بالاتر
- **دسترسی**: Root یا sudo access

### 2. دامنه و DNS
- دامنه خود را به IP سرور متصل کنید
- رکورد A برای دامنه اصلی و www ایجاد کنید

## 🚀 مراحل نصب

### مرحله 1: آماده‌سازی سرور

```bash
# به‌روزرسانی سیستم
sudo apt update && sudo apt upgrade -y

# نصب پکیج‌های ضروری
sudo apt install -y curl wget git unzip software-properties-common

# نصب Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# نصب Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# راه‌اندازی مجدد برای اعمال تغییرات گروه
sudo reboot
```

### مرحله 2: آپلود پروژه

```bash
# ایجاد دایرکتوری پروژه
mkdir -p /var/www/trevel
cd /var/www/trevel

# آپلود فایل‌های پروژه (از طریق SCP یا Git)
# مثال با Git:
git clone https://github.com/your-username/trevel.git .

# یا آپلود مستقیم فایل‌ها
```

### مرحله 3: تنظیم متغیرهای محیط

```bash
# ویرایش فایل محیط production
nano env.production

# ویرایش فایل محیط backend
nano backend/env.production
```

**مهم**: مقادیر زیر را تغییر دهید:
- `your-domain.com` → دامنه واقعی شما
- `your-super-secure-jwt-secret-key` → کلید JWT امن
- API keys مربوط به Sepehr و Charter118

### مرحله 4: تنظیم SSL (اختیاری اما توصیه می‌شود)

```bash
# نصب Certbot
sudo apt install -y certbot

# دریافت گواهی SSL
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# کپی گواهی‌ها به دایرکتوری پروژه
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
sudo chown -R $USER:$USER ssl/
```

### مرحله 5: اجرای پروژه

```bash
# اجرای اسکریپت دیپلوی
./deploy.sh
```

### مرحله 6: تنظیم Firewall

```bash
# نصب و تنظیم UFW
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw status
```

## 🔧 مدیریت پروژه

### دستورات مفید

```bash
# مشاهده وضعیت سرویس‌ها
./monitor.sh

# ایجاد backup
./backup.sh

# مشاهده لاگ‌ها
docker-compose -f docker-compose.prod.yml logs -f

# توقف سرویس‌ها
docker-compose -f docker-compose.prod.yml down

# راه‌اندازی مجدد سرویس‌ها
docker-compose -f docker-compose.prod.yml restart

# به‌روزرسانی پروژه
git pull
./deploy.sh
```

### تنظیم Cron Jobs

```bash
# ویرایش crontab
crontab -e

# اضافه کردن خطوط زیر:
# Backup روزانه در ساعت 2 صبح
0 2 * * * cd /var/www/trevel && ./backup.sh

# مانیتورینگ هر 5 دقیقه
*/5 * * * * cd /var/www/trevel && ./monitor.sh >> logs/monitor.log 2>&1

# به‌روزرسانی SSL هر ماه
0 3 1 * * certbot renew --quiet && cd /var/www/trevel && sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem && sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem && docker-compose -f docker-compose.prod.yml restart nginx
```

## 🛠️ عیب‌یابی

### مشکلات رایج

1. **کانتینرها راه‌اندازی نمی‌شوند**
   ```bash
   # بررسی لاگ‌ها
   docker-compose -f docker-compose.prod.yml logs
   
   # بررسی وضعیت کانتینرها
   docker-compose -f docker-compose.prod.yml ps
   ```

2. **مشکل در دسترسی به دیتابیس**
   ```bash
   # بررسی فایل دیتابیس
   ls -la data/
   
   # بررسی مجوزها
   chmod 755 data/
   ```

3. **مشکل در SSL**
   ```bash
   # بررسی گواهی‌ها
   openssl x509 -in ssl/cert.pem -text -noout
   
   # تست SSL
   curl -I https://your-domain.com
   ```

### مانیتورینگ سیستم

```bash
# بررسی استفاده از منابع
htop

# بررسی فضای دیسک
df -h

# بررسی حافظه
free -h

# بررسی شبکه
netstat -tulpn
```

## 📊 بهینه‌سازی عملکرد

### تنظیمات Nginx

فایل `nginx.conf` را برای بهینه‌سازی بیشتر ویرایش کنید:

```nginx
# افزایش worker connections
worker_processes auto;
worker_connections 2048;

# فعال‌سازی keepalive
keepalive_timeout 65;
keepalive_requests 100;

# فعال‌سازی gzip
gzip on;
gzip_comp_level 6;
gzip_min_length 1000;
```

### تنظیمات Docker

```yaml
# در docker-compose.prod.yml
services:
  trevel-app:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

## 🔒 امنیت

### تنظیمات امنیتی اضافی

1. **تغییر پورت SSH**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # تغییر Port 22 به پورت دلخواه
   sudo systemctl restart ssh
   ```

2. **فعال‌سازی fail2ban**
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. **تنظیمات فایروال پیشرفته**
   ```bash
   # محدود کردن دسترسی به پورت‌های خاص
   sudo ufw deny 3000
   sudo ufw allow from 127.0.0.1 to any port 3000
   ```

## 📞 پشتیبانی

در صورت بروز مشکل:

1. ابتدا لاگ‌ها را بررسی کنید
2. از اسکریپت `monitor.sh` استفاده کنید
3. وضعیت سیستم را با `htop` و `df -h` بررسی کنید
4. در صورت نیاز، پروژه را مجدداً دیپلوی کنید

---

**نکته مهم**: این راهنما برای سرورهای ایران سرور بهینه شده و تمام دستورات تست شده‌اند. در صورت نیاز به تغییرات خاص، با تیم پشتیبانی تماس بگیرید.

