#!/bin/bash

# Trevel Monitoring Script
# این اسکریپت برای مانیتورینگ وضعیت سرویس‌ها طراحی شده

set -e

# رنگ‌ها
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🔍 مانیتورینگ وضعیت سرویس‌های Trevel..."
echo "========================================"

# بررسی وضعیت کانتینرها
log_info "بررسی وضعیت کانتینرها..."
docker-compose -f docker-compose.prod.yml ps

echo ""

# بررسی استفاده از منابع
log_info "بررسی استفاده از منابع سیستم..."
echo "CPU Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose -f docker-compose.prod.yml ps -q)

echo ""

# بررسی لاگ‌های اخیر
log_info "بررسی لاگ‌های اخیر (آخرین 10 خط)..."
docker-compose -f docker-compose.prod.yml logs --tail=10

echo ""

# بررسی health check
log_info "بررسی health check..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log_success "✅ Backend سالم است"
else
    log_error "❌ Backend مشکل دارد"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    log_success "✅ Frontend سالم است"
else
    log_error "❌ Frontend مشکل دارد"
fi

echo ""

# بررسی فضای دیسک
log_info "بررسی فضای دیسک..."
df -h | grep -E "(Filesystem|/dev/)"

echo ""

# بررسی حافظه
log_info "بررسی حافظه..."
free -h

echo ""

# بررسی پروسه‌های Docker
log_info "بررسی پروسه‌های Docker..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
log_success "مانیتورینگ کامل شد!"

