

import { UserRole, Permission, LocalizedName, type RolePermissions } from '../types';

export const hasPermission = (role: UserRole, permission: Permission, rolePermissions: RolePermissions): boolean => {
    return rolePermissions[role]?.includes(permission) || false;
};

export const getPermissionsForRole = (role: UserRole, rolePermissions: RolePermissions): Permission[] => {
    return rolePermissions[role] || [];
};

export const permissionDescriptions: Record<Permission, LocalizedName> = {
    [Permission.VIEW_STATS]: { ar: 'عرض الإحصائيات العامة', fa: 'مشاهده آمار کلی', en: 'View General Statistics' },
    [Permission.CREATE_FLIGHTS]: { ar: 'إنشاء رحلات', fa: 'ایجاد پروازها', en: 'Create Flights' },
    [Permission.EDIT_FLIGHTS]: { ar: 'تعديل الرحلات', fa: 'ویرایش پروازها', en: 'Edit Flights' },
    [Permission.DELETE_FLIGHTS]: { ar: 'حذف الرحلات', fa: 'حذف پروازها', en: 'Delete Flights' },
    [Permission.MANAGE_BOOKINGS]: { ar: 'إدارة الحجوزات', fa: 'مدیریت رزروها', en: 'Manage Bookings' },
    [Permission.MANAGE_REFUNDS]: { ar: 'إدارة استرداد التذاكر', fa: 'مدیریت استردادها', en: 'Manage Refunds' },
    [Permission.MANAGE_TICKETS]: { ar: 'إدارة تذاكر الدعم', fa: 'مدیریت تیکت‌ها', en: 'Manage Support Tickets' },
    [Permission.MANAGE_USERS]: { ar: 'إدارة المستخدمين (إنشاء/تغيير الحالة)', fa: 'مدیریت کاربران (ایجاد/تغییر وضعیت)', en: 'Manage Users (Create/Change Status)' },
    [Permission.EDIT_USER_ROLE]: { ar: 'تغيير أدوار المستخدمين', fa: 'تغییر نقش کاربران', en: 'Change User Roles' },
    [Permission.MANAGE_BASIC_DATA]: { ar: 'إدارة البيانات الأساسية', fa: 'مدیریت داده‌های پایه', en: 'Manage Basic Data' },
    [Permission.MANAGE_COMMISSION_MODELS]: { ar: 'إدارة نماذج العمولات', fa: 'مدیریت مدل‌های درآمدی', en: 'Manage Commission Models' },
    [Permission.VIEW_ACTIVITY_LOG]: { ar: 'عرض سجل الأنشطة', fa: 'مشاهده گزارش فعالیت‌ها', en: 'View Activity Log' },
    [Permission.MANAGE_ACCOUNTING]: { ar: 'إدارة نظام المحاسبة', fa: 'مدیریت حسابداری', en: 'Manage Accounting System' },
    [Permission.MANAGE_RATE_LIMITS]: { ar: 'إدارة حدود الأسعار', fa: 'مدیریت محدودیت‌های نرخ', en: 'Manage Rate Limits' },
    [Permission.MANAGE_CONTENT]: { ar: 'إدارة محتوى الموقع', fa: 'مدیریت محتوای سایت', en: 'Manage Site Content' },
    [Permission.MANAGE_ADS]: { ar: 'إدارة الإعلانات', fa: 'مدیریت تبلیغات', en: 'Manage Advertisements' },
    [Permission.MANAGE_TENANTS]: { ar: 'إدارة الشركاء الفرعيين', fa: 'مدیریت همکاران فروش', en: 'Manage Tenants' },
    [Permission.CREATE_OWN_FLIGHTS]: { ar: 'إنشاء رحلاتي الخاصة', fa: 'ایجاد پروازهای خود', en: 'Create Own Flights' },
    [Permission.EDIT_OWN_FLIGHTS]: { ar: 'تعديل رحلاتي الخاصة', fa: 'ویرایش پروازهای خود', en: 'Edit Own Flights' },
    [Permission.DELETE_OWN_FLIGHTS]: { ar: 'حذف رحلاتي الخاصة', fa: 'حذف پروازهای خود', en: 'Delete Own Flights' },
    [Permission.VIEW_OWN_BOOKINGS]: { ar: 'عرض حجوزاتي الخاصة', fa: 'مشاهده رزروهای خود', en: 'View Own Bookings' },
    [Permission.VIEW_OWN_ACCOUNTING]: { ar: 'عرض حساباتي', fa: 'مشاهده حسابداری خود', en: 'View Own Accounting' },
};