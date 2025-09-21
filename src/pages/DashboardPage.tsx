

import React, { useState } from 'react';
import type { User, Booking, Ticket, TicketMessage, AirlineInfo, AircraftInfo, FlightClassInfo, Flight, AirportInfo, SiteContent, Refund, PassengerDetails, RolePermissions } from '@/types';
import { UserStatus, UserRole, Currency, CommissionModel, RateLimit, BookingStatus, CurrencyInfo, RefundPolicy, ActivityLog, Account, JournalEntry, Expense, Advertisement, Tenant, TelegramBotConfig, WhatsAppBotConfig, CountryInfo, Permission } from '@/types';
import { hasPermission } from '@/utils/permissions';

import { AdminSidebar } from '@/components/admin/AdminSidebar';

import { BookingsDashboard } from '@/components/admin/BookingsDashboard';
import { UsersDashboard } from '@/components/admin/UsersDashboard';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { TicketsDashboard } from '@/components/admin/TicketsDashboard';
import { BasicDataDashboard } from '@/components/admin/BasicDataDashboard';
import { FlightsDashboard } from '@/components/admin/FlightsDashboard';
import { ActivityLogDashboard } from '@/components/admin/ActivityLogDashboard';
import { AccountingDashboard } from '@/components/admin/accounting/AccountingDashboard';
import { RefundsDashboard } from '@/components/admin/RefundsDashboard';
import { useLocalization } from '@/hooks/useLocalization';
import { ContentDashboard } from '@/components/admin/ContentDashboard';
import { AffiliateDashboard } from '@/pages/AffiliateDashboard';
import { AdvertisementsDashboard } from '@/components/admin/AdvertisementsDashboard';
import { ManualBookingDashboard } from '@/components/admin/ManualBookingDashboard';
import { PermissionsDashboard } from '@/components/admin/PermissionsDashboard';
import { TenantsDashboard } from '@/components/admin/TenantsDashboard';
import { TelegramBotDashboard } from '@/components/admin/TelegramBotDashboard';
import { WhatsAppBotDashboard } from '@/components/admin/WhatsAppBotDashboard';
import { ExchangeRatesDashboard } from '@/components/ExchangeRatesDashboard';


interface DashboardPageProps {
    user: User;
    bookings: Booking[];
    users: User[];
    tenants: Tenant[];
    tickets: Ticket[];
    airlines: AirlineInfo[];
    aircrafts: AircraftInfo[];
    flightClasses: FlightClassInfo[];
    airports: AirportInfo[];
    commissionModels: CommissionModel[];
    rateLimits: RateLimit[];
    allFlights: Flight[];
    activityLogs: ActivityLog[];
    chartOfAccounts: Account[];
    journalEntries: JournalEntry[];
    expenses: Expense[];
    currencies: CurrencyInfo[];
    refundPolicies: RefundPolicy[];
    refunds: Refund[];
    siteContent: SiteContent;
    advertisements: Advertisement[];
    rolePermissions: RolePermissions;
    telegramConfig: TelegramBotConfig;
    whatsappConfig: WhatsAppBotConfig;
    countries: CountryInfo[];
    onUpdateTelegramConfig: (config: TelegramBotConfig) => void;
    onUpdateWhatsAppBotConfig: (config: WhatsAppBotConfig) => void;
    onUpdateRolePermissions: (newPermissions: RolePermissions) => void;
    onCreateAdvertisement: (ad: Omit<Advertisement, 'id'>) => void;
    onUpdateAdvertisement: (ad: Advertisement) => void;
    onDeleteAdvertisement: (adId: string) => void;
    onUpdateSiteContent: (newContent: SiteContent) => void;
    onLogout: () => void;
    onUpdateBooking: (booking: Booking) => void;
    onUpdateRefund: (refundId: string, action: 'expert_approve' | 'financial_approve' | 'process_payment' | 'reject', reason?: string) => void;
    onUpdateUser: (userId: string, name: string, role: UserRole, status: UserStatus, canBypassRateLimit: boolean, displayCurrencies: Currency[], tenantId?: string) => void;
    onResetUserPassword: (userId: string, newPassword: string) => void;
    onChargeUserWallet: (userId: string, amount: number, currency: Currency, description: string) => void;
    onCreateUser: (newUser: Omit<User, 'id' | 'wallet' | 'createdAt' | 'canBypassRateLimit'>) => void;
    onUpdateTicket: (ticket: Ticket) => void;
    onAddMessageToTicket: (ticketId: string, message: TicketMessage) => void;
    onCreateBasicData: (type: 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy' | 'country', data: any) => void;
    onUpdateBasicData: (type: 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy' | 'country', data: any) => void;
    onDeleteBasicData: (type: 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy' | 'country', id: string) => void;
    onCreateRateLimit: (data: Omit<RateLimit, 'id'>) => void;
    onUpdateRateLimit: (data: RateLimit) => void;
    onDeleteRateLimit: (id: string) => void;
    onCreateFlight: (flightData: Omit<Flight, 'id' | 'creatorId'>) => void;
    onUpdateFlight: (flight: Flight) => void;
    onDeleteFlight: (flightId: string) => void;
    onManualBookingCreate: (data: { flightData: Omit<Flight, 'id' | 'creatorId'>, passengers: { adults: PassengerDetails[], children: PassengerDetails[], infants: PassengerDetails[] }, customerId: string, purchasePrice: number, contactEmail: string, contactPhone: string, buyerReference?: string, notes?: string }) => Promise<Booking | null>;
    onCreateExpense: (expenseData: Omit<Expense, 'id'>) => void;
    onExitAdmin: () => void;
    onCreateAccount: (newAccount: Account) => boolean;
    onUpdateAccount: (updatedAccount: Account) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = (props) => {
    const { t } = useLocalization();

    // Debug logs removed

    const getDefaultAdminSection = (role: UserRole) => {
        if (role === 'AFFILIATE') return 'stats'; // Affiliate default
        if (hasPermission(role, Permission.VIEW_STATS, props.rolePermissions)) return 'stats';
        if ([Permission.CREATE_FLIGHTS, Permission.EDIT_FLIGHTS, Permission.DELETE_FLIGHTS].some(p => hasPermission(role, p, props.rolePermissions))) return 'flights';
        if (hasPermission(role, Permission.MANAGE_TICKETS, props.rolePermissions)) return 'tickets';
        return 'stats'; // Fallback
    };
    
    const [activeAdminSection, setActiveAdminSection] = useState(getDefaultAdminSection(props.user.role));

    if (props.user.role === 'AFFILIATE') {
        return <AffiliateDashboard 
            user={props.user}
            allFlights={props.allFlights}
            bookings={props.bookings}
            users={props.users}
            airlines={props.airlines}
            aircrafts={props.aircrafts}
            flightClasses={props.flightClasses}
            airports={props.airports}
            commissionModels={props.commissionModels}
            refundPolicies={props.refundPolicies}
            onCreateFlight={props.onCreateFlight}
            onUpdateFlight={props.onUpdateFlight}
            onDeleteFlight={props.onDeleteFlight}
            onExitAdmin={props.onExitAdmin}
            rolePermissions={props.rolePermissions}
        />
    }

    const renderAdminContent = () => {
        let content: React.ReactNode = null;
        let hasAccess = false;

        switch (activeAdminSection) {
            case 'stats':
                hasAccess = hasPermission(props.user.role, Permission.VIEW_STATS, props.rolePermissions);
                if (hasAccess) {
                    try {
                        content = <DashboardStats bookings={props.bookings} users={props.users} journalEntries={props.journalEntries} commissionModels={props.commissionModels} />;
                    } catch (error) {
                        console.error('Error rendering DashboardStats:', error);
                        content = <div className="text-center p-8 bg-white rounded-lg shadow border">
                            <p>خطا در نمایش آمار: {error.message}</p>
                        </div>;
                    }
                }
                break;
            case 'accounting':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_ACCOUNTING, props.rolePermissions);
                if (hasAccess) content = <AccountingDashboard
                    chartOfAccounts={props.chartOfAccounts}
                    journalEntries={props.journalEntries}
                    expenses={props.expenses}
                    users={props.users}
                    onCreateExpense={props.onCreateExpense}
                    onCreateAccount={props.onCreateAccount}
                    // FIX: Pass the missing onUpdateAccount prop
                    onUpdateAccount={props.onUpdateAccount}
                />;
                break;
            case 'flights':
                 hasAccess = [Permission.CREATE_FLIGHTS, Permission.EDIT_FLIGHTS, Permission.DELETE_FLIGHTS].some(p => hasPermission(props.user.role, p, props.rolePermissions));
                 if (hasAccess) content = <FlightsDashboard
                    flights={props.allFlights}
                    bookings={props.bookings}
                    users={props.users}
                    currentUser={props.user}
                    rolePermissions={props.rolePermissions}
                    airlines={props.airlines}
                    aircrafts={props.aircrafts}
                    flightClasses={props.flightClasses}
                    airports={props.airports}
                    commissionModels={props.commissionModels}
                    refundPolicies={props.refundPolicies}
                    onCreateFlight={props.onCreateFlight}
                    onUpdateFlight={props.onUpdateFlight}
                    onDeleteFlight={props.onDeleteFlight}
                />;
                break;
            case 'bookings':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_BOOKINGS, props.rolePermissions);
                if (hasAccess) content = <BookingsDashboard 
                    bookings={props.bookings} 
                    onUpdateBooking={props.onUpdateBooking}
                    airports={props.airports}
                    airlines={props.airlines}
                    aircrafts={props.aircrafts}
                    flightClasses={props.flightClasses}
                />;
                break;
            case 'manualBooking':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_BOOKINGS, props.rolePermissions);
                if (hasAccess) content = <ManualBookingDashboard
                    users={props.users}
                    airlines={props.airlines}
                    aircrafts={props.aircrafts}
                    flightClasses={props.flightClasses}
                    airports={props.airports}
                    allFlights={props.allFlights}
                    onManualBookingCreate={props.onManualBookingCreate}
                />;
                break;
            case 'refunds':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_REFUNDS, props.rolePermissions);
                if (hasAccess) content = <RefundsDashboard refunds={props.refunds} bookings={props.bookings} onUpdateRefund={props.onUpdateRefund} />;
                break;
            case 'users':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_USERS, props.rolePermissions);
                if (hasAccess) content = <UsersDashboard users={props.users} currentUser={props.user} onUpdateUser={props.onUpdateUser} onCreateUser={props.onCreateUser} onResetUserPassword={props.onResetUserPassword} onChargeUserWallet={props.onChargeUserWallet} currencies={props.currencies} rolePermissions={props.rolePermissions} tenants={props.tenants} />;
                break;
            case 'tenants':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_TENANTS, props.rolePermissions);
                if (hasAccess) content = <TenantsDashboard tenants={props.tenants} users={props.users} bookings={props.bookings} />;
                break;
            case 'permissions':
                hasAccess = hasPermission(props.user.role, Permission.EDIT_USER_ROLE, props.rolePermissions);
                if(hasAccess) content = <PermissionsDashboard rolePermissions={props.rolePermissions} onUpdate={props.onUpdateRolePermissions} />;
                break;
            case 'tickets':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_TICKETS, props.rolePermissions);
                if (hasAccess) content = <TicketsDashboard 
                            tickets={props.tickets} 
                            onUpdateTicket={props.onUpdateTicket}
                            onAddMessage={props.onAddMessageToTicket}
                            adminUser={props.user}
                        />;
                break;
            case 'basicData':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_BASIC_DATA, props.rolePermissions);
                if (hasAccess) content = <BasicDataDashboard 
                            airlines={props.airlines}
                            aircrafts={props.aircrafts}
                            flightClasses={props.flightClasses}
                            airports={props.airports}
                            commissionModels={props.commissionModels}
                            rateLimits={props.rateLimits}
                            currencies={props.currencies}
                            refundPolicies={props.refundPolicies}
                            countries={props.countries}
                            onCreate={props.onCreateBasicData}
                            onUpdate={props.onUpdateBasicData}
                            onDelete={props.onDeleteBasicData}
                            onCreateRateLimit={props.onCreateRateLimit}
                            onUpdateRateLimit={props.onUpdateRateLimit}
                            onDeleteRateLimit={props.onDeleteRateLimit}
                        />;
                break;
            case 'activityLog':
                hasAccess = hasPermission(props.user.role, Permission.VIEW_ACTIVITY_LOG, props.rolePermissions);
                if (hasAccess) content = <ActivityLogDashboard logs={props.activityLogs} />;
                break;
            case 'content':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_CONTENT, props.rolePermissions);
                if (hasAccess) content = <ContentDashboard content={props.siteContent} onUpdate={props.onUpdateSiteContent} />;
                break;
            case 'ads':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_ADS, props.rolePermissions);
                if (hasAccess) content = <AdvertisementsDashboard 
                    advertisements={props.advertisements}
                    onCreate={props.onCreateAdvertisement}
                    onUpdate={props.onUpdateAdvertisement}
                    onDelete={props.onDeleteAdvertisement}
                />;
                break;
             case 'telegram':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_TELEGRAM_BOT, props.rolePermissions);
                if (hasAccess) content = <TelegramBotDashboard config={props.telegramConfig} onSave={props.onUpdateTelegramConfig} />;
                break;
            case 'whatsapp':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_WHATSAPP_BOT, props.rolePermissions);
                if (hasAccess) content = <WhatsAppBotDashboard config={props.whatsappConfig} onSave={props.onUpdateWhatsAppBotConfig} />;
                break;
            case 'exchangeRates':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_BASIC_DATA, props.rolePermissions);
                if (hasAccess) content = <ExchangeRatesDashboard />;
                break;
            default:
                hasAccess = false;
        }

        if (!hasAccess) {
            const defaultSection = getDefaultAdminSection(props.user.role);
            if (activeAdminSection !== defaultSection) {
                setActiveAdminSection(defaultSection);
            }
            return <div className="text-center p-8 bg-white rounded-lg shadow border">
                <p>{t('dashboard.noAccess') || 'شما دسترسی به این بخش را ندارید'}</p>
            </div>;
        }
        
        return content || <div className="text-center p-8 bg-white rounded-lg shadow border">
            <p>محتوا در حال بارگذاری...</p>
        </div>;
    };

    return (
        <div className="bg-secondary">
            <div className="container mx-auto px-4 py-12">
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="lg:col-span-1 lg:sticky top-8">
                        <AdminSidebar
                            activeSection={activeAdminSection}
                            user={props.user}
                            rolePermissions={props.rolePermissions}
                            onSelectSection={setActiveAdminSection}
                            onExitAdmin={props.onExitAdmin}
                        />
                    </aside>
                    <main className="lg:col-span-3 space-y-8">
                         {renderAdminContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};