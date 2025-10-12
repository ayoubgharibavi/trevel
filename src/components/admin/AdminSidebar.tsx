

import React from 'react';
import type { User, RolePermissions } from '@/types';
import { Permission } from '@/types';
import { hasPermission } from '@/utils/permissions';
import { HistoryIcon } from '@/components/icons/HistoryIcon';
import { LogoutIcon } from '@/components/icons/LogoutIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { ChartBarIcon } from '@/components/icons/ChartBarIcon';
import { TicketIcon } from '@/components/icons/TicketIcon';
import { DatabaseIcon } from '@/components/icons/DatabaseIcon';
import { PlaneIcon } from '@/components/icons/PlaneIcon';
import { ClipboardListIcon } from '@/components/icons/ClipboardListIcon';
import { BookOpenIcon } from '@/components/icons/BookOpenIcon';
import { RefundIcon } from '@/components/icons/RefundIcon';
import { useLocalization } from '@/hooks/useLocalization';
import { FileTextIcon } from '@/components/icons/FileTextIcon';
import { MegaphoneIcon } from '@/components/icons/MegaphoneIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { ShieldCheckIcon } from '@/components/icons/ShieldCheckIcon';
import { BriefcaseIcon } from '@/components/icons/BriefcaseIcon';
import { TelegramIcon } from '@/components/icons/TelegramIcon';
import { WhatsappIcon } from '@/components/icons/WhatsappIcon';
import { CurrencyTomanIcon } from '@/components/icons/CurrencyTomanIcon';
import { CogIcon } from '@/components/icons/CogIcon';
import { CreditCardIcon } from '@/components/icons/CreditCardIcon';

interface AdminSidebarProps {
    activeSection: string;
    user: User;
    rolePermissions: RolePermissions;
    onSelectSection: (section: string) => void;
    onExitAdmin: () => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-lg text-right transition-colors ${
            isActive
                ? 'bg-blue-100 text-primary font-bold'
                : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        <span className="ml-3">{icon}</span>
        <span>{label}</span>
    </button>
);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, user, rolePermissions, onSelectSection, onExitAdmin }) => {
    const { t } = useLocalization();
    
    // Debug log
    console.log('AdminSidebar - User role:', user.role);
    console.log('AdminSidebar - Role permissions:', rolePermissions);
    console.log('AdminSidebar - User permissions:', rolePermissions[user.role]);
    
    interface Section {
        key: string;
        permissions: Permission[];
        icon: React.ReactNode;
        label?: string;
    }

    const adminSections: Section[] = [
        { key: 'stats', permissions: [Permission.VIEW_STATS], icon: <ChartBarIcon className="w-5 h-5" /> },
        { key: 'accounting', permissions: [Permission.MANAGE_ACCOUNTING], icon: <BookOpenIcon className="w-5 h-5" /> },
        { key: 'flights', permissions: [Permission.CREATE_FLIGHTS, Permission.EDIT_FLIGHTS, Permission.DELETE_FLIGHTS], icon: <PlaneIcon className="w-5 h-5" /> },
        { key: 'bookings', permissions: [Permission.MANAGE_BOOKINGS], icon: <HistoryIcon className="w-5 h-5" /> },
        { key: 'manualBooking', permissions: [Permission.MANAGE_BOOKINGS], icon: <PhoneIcon className="w-5 h-5" /> },
        { key: 'refunds', permissions: [Permission.MANAGE_REFUNDS], icon: <RefundIcon className="w-5 h-5" /> },
        { key: 'tickets', permissions: [Permission.MANAGE_TICKETS], icon: <TicketIcon className="w-5 h-5" /> },
        { key: 'users', permissions: [Permission.MANAGE_USERS], icon: <UsersIcon className="w-5 h-5" /> },
        { key: 'tenants', permissions: [Permission.MANAGE_TENANTS], icon: <BriefcaseIcon className="w-5 h-5" /> },
        { key: 'permissions', permissions: [Permission.EDIT_USER_ROLE], icon: <ShieldCheckIcon className="w-5 h-5" /> },
        { key: 'basicData', permissions: [Permission.MANAGE_BASIC_DATA], icon: <DatabaseIcon className="w-5 h-5" /> },
        { key: 'content', permissions: [Permission.MANAGE_CONTENT], icon: <FileTextIcon className="w-5 h-5" /> },
        { key: 'ads', permissions: [Permission.MANAGE_ADS], icon: <MegaphoneIcon className="w-5 h-5" /> },
        { key: 'telegram', permissions: [Permission.MANAGE_TELEGRAM_BOT], icon: <TelegramIcon className="w-5 h-5" /> },
        { key: 'whatsapp', permissions: [Permission.MANAGE_WHATSAPP_BOT], icon: <WhatsappIcon className="w-5 h-5" /> },
        { key: 'exchangeRates', permissions: [Permission.MANAGE_BASIC_DATA], icon: <CurrencyTomanIcon className="w-5 h-5" /> },
        { key: 'apiManagement', permissions: [Permission.MANAGE_BASIC_DATA], icon: <CogIcon className="w-5 h-5" /> },
        { key: 'sepehrCredit', permissions: [Permission.MANAGE_BASIC_DATA], icon: <CreditCardIcon className="w-5 h-5" /> },
        { key: 'loadingSettings', permissions: [Permission.MANAGE_CONTENT], icon: <ClipboardListIcon className="w-5 h-5" /> },
        { key: 'activityLog', permissions: [Permission.VIEW_ACTIVITY_LOG], icon: <ClipboardListIcon className="w-5 h-5" /> },
    ];
    
    const affiliateSections: Section[] = [
        { key: 'stats', permissions: [Permission.VIEW_STATS], icon: <ChartBarIcon className="w-5 h-5" />, label: t('affiliate.sidebar.dashboard') },
        { key: 'flights', permissions: [Permission.CREATE_OWN_FLIGHTS, Permission.EDIT_OWN_FLIGHTS, Permission.DELETE_OWN_FLIGHTS], icon: <PlaneIcon className="w-5 h-5" />, label: t('affiliate.sidebar.myFlights') },
        { key: 'bookings', permissions: [Permission.VIEW_OWN_BOOKINGS], icon: <HistoryIcon className="w-5 h-5" />, label: t('affiliate.sidebar.myBookings') },
        { key: 'accounting', permissions: [Permission.VIEW_OWN_ACCOUNTING], icon: <BookOpenIcon className="w-5 h-5" />, label: t('affiliate.sidebar.accounting') },
    ];
    
    const sections: Section[] = user.role === 'AFFILIATE' ? affiliateSections : adminSections;

    return (
        <div className="bg-white p-4 rounded-lg shadow border space-y-2">
            {sections.map(section => {
                const hasAccess = section.permissions.some(p => hasPermission(user.role, p, rolePermissions));
                console.log(`Section ${section.key} - Has access: ${hasAccess}, Permissions needed:`, section.permissions);
                return hasAccess && (
                    <NavItem 
                        key={section.key}
                        icon={section.icon}
                        label={section.label || t(`dashboard.sidebar.${section.key}`)}
                        isActive={activeSection === section.key}
                        onClick={() => onSelectSection(section.key)}
                    />
                )
            })}
            
            <div className="pt-2 border-t mt-2 space-y-2">
                <button
                    onClick={() => {
                        console.log('🔄 Manual token clear requested');
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = window.location.origin;
                    }}
                    className="w-full flex items-center p-2 rounded-lg text-right text-red-600 hover:bg-red-50 transition-colors text-sm"
                >
                    <span className="ml-3">🔄</span>
                    <span>پاک کردن کش و ورود مجدد</span>
                </button>
                <button
                    onClick={() => {
                        console.log('🔍 Debug info:');
                        console.log('- User:', user);
                        console.log('- Role permissions:', rolePermissions);
                        console.log('- localStorage accessToken:', localStorage.getItem('accessToken')?.substring(0, 50));
                        console.log('- localStorage refreshToken:', localStorage.getItem('refreshToken')?.substring(0, 50));
                    }}
                    className="w-full flex items-center p-2 rounded-lg text-right text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                >
                    <span className="ml-3">🔍</span>
                    <span>Debug Info</span>
                </button>
                <button
                    onClick={onExitAdmin}
                    className="w-full flex items-center p-3 rounded-lg text-right text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <LogoutIcon className="w-5 h-5 ml-3 transform -scale-x-100" />
                    <span>{t('dashboard.sidebar.backToSite')}</span>
                </button>
            </div>
        </div>
    );
};
