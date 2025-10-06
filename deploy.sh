#!/bin/bash

# Trevel Production Deployment Script
# این اسکریپت برای دیپلوی پروژه روی سرور ایران سرور طراحی شده

set -e

echo "🚀 شروع فرآیند دیپلوی Trevel..."

# رنگ‌ها برای خروجی بهتر
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# تابع برای نمایش پیام‌های رنگی
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# بررسی وجود Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker نصب نیست. لطفاً ابتدا Docker را نصب کنید."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose نصب نیست. لطفاً ابتدا Docker Compose را نصب کنید."
    exit 1
fi

# بررسی وجود فایل‌های ضروری
if [ ! -f "env.production" ]; then
    log_error "فایل env.production یافت نشد!"
    exit 1
fi

if [ ! -f "backend/env.production" ]; then
    log_error "فایل backend/env.production یافت نشد!"
    exit 1
fi

log_info "بررسی فایل‌های محیط..."

# ایجاد دایرکتوری‌های مورد نیاز
log_info "ایجاد دایرکتوری‌های مورد نیاز..."
mkdir -p data logs ssl

# تنظیم مجوزهای مناسب
chmod 755 data logs ssl

# توقف کانتینرهای قبلی (اگر وجود دارند)
log_info "توقف کانتینرهای قبلی..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# پاک کردن image های قدیمی
log_info "پاک کردن image های قدیمی..."
docker image prune -f || true

# Build کردن پروژه
log_info "Build کردن پروژه..."
docker-compose -f docker-compose.prod.yml build --no-cache

# اجرای پروژه
log_info "اجرای پروژه..."
docker-compose -f docker-compose.prod.yml up -d

# انتظار برای آماده شدن سرویس‌ها
log_info "انتظار برای آماده شدن سرویس‌ها..."
sleep 30

# بررسی وضعیت کانتینرها
log_info "بررسی وضعیت کانتینرها..."
docker-compose -f docker-compose.prod.yml ps

# بررسی health check
log_info "بررسی health check..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log_success "Backend آماده است!"
else
    log_warning "Backend هنوز آماده نیست. لطفاً چند لحظه صبر کنید."
fi

if curl -f http://localhost > /dev/null 2>&1; then
    log_success "Frontend آماده است!"
else
    log_warning "Frontend هنوز آماده نیست. لطفاً چند لحظه صبر کنید."
fi

log_success "🎉 دیپلوی با موفقیت انجام شد!"
log_info "پروژه شما در آدرس زیر در دسترس است:"
log_info "Frontend: http://your-domain.com"
log_info "Backend API: http://your-domain.com/api"
log_info "Health Check: http://your-domain.com/health"

log_info "برای مشاهده لاگ‌ها از دستور زیر استفاده کنید:"
log_info "docker-compose -f docker-compose.prod.yml logs -f"

log_info "برای توقف سرویس‌ها از دستور زیر استفاده کنید:"
log_info "docker-compose -f docker-compose.prod.yml down"

