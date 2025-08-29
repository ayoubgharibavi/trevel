
import React, { useMemo } from 'react';
import type { User, Booking } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { CurrencyTomanIcon } from '@/components/icons/CurrencyTomanIcon';
import { TicketIcon } from '@/components/icons/TicketIcon';

interface AffiliateStatsProps {
    user: User;
    bookings: Booking[];
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-5 rounded-lg shadow border flex items-center">
        <div className="text-white bg-primary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
            {icon}
        </div>
        <div className="mr-4">
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);


export const AffiliateStats: React.FC<AffiliateStatsProps> = ({ user, bookings }) => {
    const { t, formatNumber } = useLocalization();

    const stats = useMemo(() => {
        const totalEarnings = user.wallet['IRR']?.transactions
            .filter(tx => tx.type === 'COMMISSION_PAYOUT')
            .reduce((sum, tx) => sum + tx.amount, 0) || 0;
            
        const totalBookings = bookings.filter(b => b.status === 'CONFIRMED').length;

        return { totalEarnings, totalBookings };
    }, [user, bookings]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{t('affiliate.sidebar.dashboard')}</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <StatCard 
                    title={t('affiliate.stats.totalEarnings')}
                    value={`${formatNumber(stats.totalEarnings)} ${t('placeholders.rial')}`}
                    icon={<CurrencyTomanIcon className="w-6 h-6" />}
                />
                 <StatCard 
                    title={t('affiliate.stats.totalBookings')} 
                    value={formatNumber(stats.totalBookings)} 
                    icon={<TicketIcon className="w-6 h-6" />}
                />
            </div>
        </div>
    );
};
