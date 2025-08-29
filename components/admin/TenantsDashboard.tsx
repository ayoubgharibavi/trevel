

import React, { useState, useMemo } from 'react';
import type { Tenant, TenantStatus, User, Booking } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { PlusIcon } from '../icons/PlusIcon';
import { EditIcon } from '../icons/EditIcon';
import { TenantDetailsModal } from './TenantDetailsModal';
import { UsersIcon } from '../icons/UsersIcon';
import { HistoryIcon } from '../icons/HistoryIcon';
import { CurrencyTomanIcon } from '../icons/CurrencyTomanIcon';

interface TenantsDashboardProps {
    tenants: Tenant[];
    users: User[];
    bookings: Booking[];
    // onUpdate: (tenant: Tenant) => void;
    // onCreate: (tenant: Omit<Tenant, 'id'>) => void;
}

const StatusBadge: React.FC<{ status: TenantStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const text = t(`dashboard.tenants.statusValues.${status}` as any);
    const colorClasses: Record<TenantStatus, string> = {
        ACTIVE: 'bg-green-100 text-green-800',
        INACTIVE: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colorClasses[status]}`}>{text}</span>;
};


export const TenantsDashboard: React.FC<TenantsDashboardProps> = ({ tenants, users, bookings }) => {
    const { t, formatNumber } = useLocalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

    const tenantStats = useMemo(() => {
        return tenants.map(tenant => {
            const tenantUsers = users.filter(u => u.tenantId === tenant.id);
            const tenantBookings = bookings.filter(b => b.tenantId === tenant.id && b.status === 'CONFIRMED');
            const totalRevenue = tenantBookings.reduce((acc, booking) => {
                 const totalPassengers = booking.passengers.adults.length + booking.passengers.children.length + booking.passengers.infants.length;
                 const flightPrice = booking.flight.price + booking.flight.taxes;
                 return acc + (flightPrice * totalPassengers);
            }, 0);

            return {
                ...tenant,
                userCount: tenantUsers.length,
                bookingCount: tenantBookings.length,
                totalRevenue: totalRevenue,
            };
        });
    }, [tenants, users, bookings]);

    const handleOpenModal = (tenant: Tenant | null) => {
        setEditingTenant(tenant);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTenant(null);
        setIsModalOpen(false);
    };
    
    const handleSave = (data: Tenant) => {
        console.log("Saving tenant:", data);
        // Here you would call onUpdate or onCreate
        handleCloseModal();
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.tenants.title')}</h2>
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('dashboard.tenants.addTenant')}</span>
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.tenants.name')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.tenants.users')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.tenants.bookings')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.tenants.revenue')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.tenants.status')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('dashboard.general.actions')}</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tenantStats.map(tenant => (
                            <tr key={tenant.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(tenant.userCount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(tenant.bookingCount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{formatNumber(tenant.totalRevenue)} {t('placeholders.rial')}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={tenant.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                    <button onClick={() => handleOpenModal(tenant)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100 transition" title={t('dashboard.general.edit')}>
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <TenantDetailsModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    tenant={editingTenant}
                    users={users}
                />
            )}
        </div>
    );
};