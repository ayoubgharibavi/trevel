

import React, { useState } from 'react';
// FIX: Correct import paths for types and utils from './' to '../'
import type { User, Booking, UserStatus, Ticket, TicketMessage, UserRole, AirlineInfo, AircraftInfo, FlightClassInfo, Flight, ActivityLog, AirportInfo, Account, JournalEntry, Expense, CommissionModel, RateLimit, Currency, CurrencyInfo, RefundPolicy, SiteContent, Refund, Advertisement, PassengerDetails, RolePermissions, Tenant } from '../types';
import { Permission } from '../types';
import { hasPermission } from '../utils/permissions';

// FIX: Correct import paths for components from './components/' to './'
import { AdminSidebar } from './admin/AdminSidebar';

import { BookingsDashboard } from './admin/BookingsDashboard';
import { UsersDashboard } from './admin/UsersDashboard';
import { DashboardStats } from './admin/DashboardStats';
import { TicketsDashboard } from './admin/TicketsDashboard';
import { BasicDataDashboard } from './admin/BasicDataDashboard';
import { FlightsDashboard } from './admin/FlightsDashboard';
import { ActivityLogDashboard } from './admin/ActivityLogDashboard';
import { AccountingDashboard } from './admin/accounting/AccountingDashboard';
import { RefundsDashboard } from './admin/RefundsDashboard';
import { useLocalization } from '../hooks/useLocalization';
import { ContentDashboard } from './admin/ContentDashboard';
import { AffiliateDashboard } from './affiliate/AffiliateDashboard';
import { AdvertisementsDashboard } from './admin/AdvertisementsDashboard';
import { ManualBookingDashboard } from './admin/ManualBookingDashboard';
import { PermissionsDashboard } from './admin/PermissionsDashboard';
import { TenantsDashboard } from './admin/TenantsDashboard';


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
    onCreateBasicData: (type: 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy', data: any) => void;
    onUpdateBasicData: (type: 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy', data: any) => void;
    onDeleteBasicData: (type: 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'currency' | 'refundPolicy', id: string) => void;
    onCreateRateLimit: (data: Omit<RateLimit, 'id'>) => void;
    onUpdateRateLimit: (data: RateLimit) => void;
    onDeleteRateLimit: (id: string) => void;
    onCreateFlight: (flightData: Omit<Flight, 'id' | 'creatorId'>) => void;
    onUpdateFlight: (flight: Flight) => void;
    onDeleteFlight: (flightId: string) => void;
    onManualBookingCreate: (data: { flightData: Omit<Flight, 'id' | 'creatorId'>, passengers: { adults: PassengerDetails[], children: PassengerDetails[], infants: PassengerDetails[] }, customerId: string, purchasePrice: number, contactEmail: string, contactPhone: string, buyerReference?: string, notes?: string }) => Promise<Booking | null>;
    onCreateExpense: (expenseData: Omit<Expense, 'id'>) => void;
    onExitAdmin: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = (props) => {
    const { t } = useLocalization();

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
                if (hasAccess) content = <DashboardStats bookings={props.bookings} users={props.users} journalEntries={props.journalEntries} commissionModels={props.commissionModels} />;
                break;
            case 'accounting':
                hasAccess = hasPermission(props.user.role, Permission.MANAGE_ACCOUNTING, props.rolePermissions);
                if (hasAccess) content = <AccountingDashboard
                    chartOfAccounts={props.chartOfAccounts}
                    journalEntries={props.journalEntries}
                    expenses={props.expenses}
                    users={props.users}
                    onCreateExpense={props.onCreateExpense}
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
            default:
                hasAccess = false;
        }

        if (!hasAccess) {
            const defaultSection = getDefaultAdminSection(props.user.role);
            if (activeAdminSection !== defaultSection) {
                setActiveAdminSection(defaultSection);
            }
            return <div className="text-center p-8 bg-white rounded-lg shadow border"><p>{t('dashboard.noAccess')}</p></div>;
        }
        
        return content;
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