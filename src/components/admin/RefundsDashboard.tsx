

import React, { useState, useMemo } from 'react';
import type { Booking, Refund } from '@/types';
import { RefundStatus } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { RefundDetailsModal } from './RefundDetailsModal';

interface RefundsDashboardProps {
    refunds: Refund[];
    bookings: Booking[];
    onUpdateRefund: (refundId: string, action: 'expert_approve' | 'financial_approve' | 'process_payment' | 'reject', reason?: string) => void;
}

const StatusBadge: React.FC<{ status: RefundStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const styles: Record<RefundStatus, string> = {
        PENDING_EXPERT_REVIEW: 'bg-yellow-100 text-yellow-800',
        PENDING_FINANCIAL_REVIEW: 'bg-orange-100 text-orange-800',
        PENDING_PAYMENT: 'bg-blue-100 text-blue-800',
        REJECTED: 'bg-red-100 text-red-800',
        COMPLETED: 'bg-green-100 text-green-800',
    };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[status]}`}>{t(`dashboard.refunds.statusValues.${status}`)}</span>;
};

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        {label}
    </button>
);

type ActiveTab = 'expert_review' | 'financial_review' | 'payment' | 'history';

export const RefundsDashboard: React.FC<RefundsDashboardProps> = ({ refunds, bookings, onUpdateRefund }) => {
    const { t, formatDate, formatNumber } = useLocalization();
    const [activeTab, setActiveTab] = useState<ActiveTab>('expert_review');
    const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

    const refundsByStatus = useMemo(() => {
        const expert_review = refunds.filter(r => r.status === 'PENDING_EXPERT_REVIEW').sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        const financial_review = refunds.filter(r => r.status === 'PENDING_FINANCIAL_REVIEW').sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        const payment = refunds.filter(r => r.status === 'PENDING_PAYMENT').sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        const history = refunds.filter(r => r.status === 'COMPLETED' || r.status === 'REJECTED').sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        return { expert_review, financial_review, payment, history };
    }, [refunds]);

    const refundsToShow = refundsByStatus[activeTab];
    
    const getBookingForRefund = (refund: Refund): Booking | undefined => {
        return bookings.find(b => b.id === refund.bookingId);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.refunds.title')}</h2>
                <p className="text-sm text-slate-500 mt-1">{t('dashboard.refunds.subtitle')}</p>
            </div>
            
            <div className="flex items-center gap-2 mb-4 border-b pb-4 flex-wrap">
                <TabButton label={t('dashboard.refunds.tabs.expertReview')} isActive={activeTab === 'expert_review'} onClick={() => setActiveTab('expert_review')} />
                <TabButton label={t('dashboard.refunds.tabs.financialReview')} isActive={activeTab === 'financial_review'} onClick={() => setActiveTab('financial_review')} />
                <TabButton label={t('dashboard.refunds.tabs.payment')} isActive={activeTab === 'payment'} onClick={() => setActiveTab('payment')} />
                <TabButton label={t('dashboard.refunds.tabs.history')} isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.refunds.bookingRef')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.refunds.user')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.refunds.requestDate')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.refunds.amount')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.refunds.status')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('dashboard.general.actions')}</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {refundsToShow.length > 0 ? refundsToShow.map(refund => {
                            const booking = getBookingForRefund(refund);
                            return (
                                <tr key={refund.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{refund.bookingId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking?.user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(refund.requestDate, {dateStyle: 'short', timeStyle: 'short'})}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatNumber(refund.refundAmount)} {t('placeholders.rial')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={refund.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <button onClick={() => setSelectedRefund(refund)} className="text-primary hover:text-purple-800">{t('dashboard.general.viewDetails')}</button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                    {t('dashboard.refunds.noRequests')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {selectedRefund && (
                <RefundDetailsModal
                    refund={selectedRefund}
                    booking={getBookingForRefund(selectedRefund)}
                    onClose={() => setSelectedRefund(null)}
                    onUpdateRefund={onUpdateRefund}
                />
            )}
        </div>
    );
};