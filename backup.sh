#!/bin/bash

# Trevel Backup Script
# این اسکریپت برای backup گیری از دیتابیس و فایل‌های پروژه طراحی شده

set -e

# رنگ‌ها
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# ایجاد دایرکتوری backup
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# نام فایل backup با تاریخ
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="trevel_backup_${TIMESTAMP}.tar.gz"

log_info "شروع backup گیری..."

# Backup دیتابیس SQLite
if [ -f "./data/prod.db" ]; then
    log_info "Backup دیتابیس..."
    cp ./data/prod.db ./data/prod.db.backup.${TIMESTAMP}
fi

# Backup فایل‌های لاگ
if [ -d "./logs" ]; then
    log_info "Backup فایل‌های لاگ..."
    tar -czf ${BACKUP_DIR}/logs_${TIMESTAMP}.tar.gz logs/
fi

# Backup کامل پروژه
log_info "ایجاد backup کامل..."
tar -czf ${BACKUP_DIR}/${BACKUP_FILE} \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='backups' \
    --exclude='*.log' \
    .

log_success "Backup با موفقیت ایجاد شد: ${BACKUP_DIR}/${BACKUP_FILE}"

# حذف backup های قدیمی (بیش از 7 روز)
log_info "حذف backup های قدیمی..."
find ${BACKUP_DIR} -name "trevel_backup_*.tar.gz" -mtime +7 -delete
find ${BACKUP_DIR} -name "logs_*.tar.gz" -mtime +7 -delete

log_success "Backup کامل شد!"

