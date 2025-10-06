#!/bin/bash

# Start script for Trevel on E-Panel - Unified Deployment
# این اسکریپت برای راه‌اندازی پروژه روی سرور ای پنل طراحی شده

echo "🚀 Starting Trevel Application (Unified Deployment)..."

# تنظیم متغیرهای محیط
export NODE_ENV=production
export PORT=3000
export DATABASE_URL=file:/www/wwwroot/hurparvaz.com/database/prod.db

# ایجاد دایرکتوری‌های مورد نیاز
mkdir -p /www/wwwroot/hurparvaz.com/database
mkdir -p /www/wwwroot/hurparvaz.com/logs

# رفتن به دایرکتوری backend
cd /www/wwwroot/hurparvaz.com/api

# نصب dependencies (اگر نیاز باشد)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# تولید Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# اجرای migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# راه‌اندازی application
echo "🌟 Starting application..."
npm start

