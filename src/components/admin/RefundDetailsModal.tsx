import React, { useState } from 'react';
import type { Booking, Refund } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { FlightSummaryCard } from '@/components/FlightSummaryCard';

interface RefundDetailsModalProps {
    refund: Refund;
    booking?: Booking;
    onClose: () => void;
    onUpdateRefund: (refundId: string, action: 'expert_approve' | 'financial_approve' | 'process_payment' | 'reject', reason?: string) => void;
}

const InfoRow: React.FC<{ label: string; value: string; isMono?: boolean }> = ({ label, value, isMono }) => (
    <div className="flex justify-between items-baseline py-1">
        <span className="text-sm text-slate-500">{label}:</span>
        <span className={`text-sm font-semibold text-slate-800 ${isMono ? 'font-mono' : ''}`}>{value}</span>
    </div>
);

export const RefundDetailsModal: React.FC<RefundDetailsModalProps> = ({ refund, booking, onClose, onUpdateRefund }) => {
    const { t, formatDate, formatNumber } = useLocalization();
    const [showRejectionForm, setShowRejectionForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleReject = () => {
        if (rejectionReason.trim()) {
            onUpdateRefund(refund.id, 'reject', rejectionReason.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-primary">{t('dashboard.refunds.detailsModal.title')}</h3>
                        <p className="text-sm text-slate-500 mt-1">{t('dashboard.refunds.bookingRef')}: {refund.bookingId}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                    {booking && <FlightSummaryCard flight={booking.flight} />}
                    <div className="p-4 border rounded-lg bg-slate-50 space-y-2">
                        <InfoRow label={t('dashboard.refunds.detailsModal.refundId')} value={refund.id} isMono />
                        <InfoRow label={t('dashboard.refunds.user')} value={booking?.user.name || 'N/A'} />
                        <InfoRow label={t('dashboard.refunds.requestDate')} value={formatDate(refund.requestDate, {dateStyle: 'medium', timeStyle: 'short'})} />
                         <div className="border-t my-2"></div>
                        <InfoRow label={t('dashboard.refunds.detailsModal.originalAmount')} value={`${formatNumber(refund.originalAmount)} ${t('placeholders.rial')}`} />
                        <InfoRow label={t('dashboard.refunds.detailsModal.penaltyAmount')} value={`- ${formatNumber(refund.penaltyAmount)} ${t('placeholders.rial')}`} />
                        <InfoRow label={t('dashboard.refunds.detailsModal.refundAmount')} value={`${formatNumber(refund.refundAmount)} ${t('placeholders.rial')}`} />
                    </div>
                    
                    {(refund.expertReviewerName || refund.financialReviewerName || refund.paymentProcessorName || refund.rejecterName) && (
                         <div className="p-4 border rounded-lg bg-blue-50">
                             <h4 className="font-semibold text-slate-700 mb-2">{t('dashboard.refunds.tabs.history')}</h4>
                            {refund.expertReviewerName && <InfoRow label={t('dashboard.refunds.history.expertReviewedBy')} value={`${refund.expertReviewerName} در ${formatDate(refund.expertReviewDate!)}`} />}
                            {refund.financialReviewerName && <InfoRow label={t('dashboard.refunds.history.financialReviewedBy')} value={`${refund.financialReviewerName} در ${formatDate(refund.financialReviewDate!)}`} />}
                            {refund.paymentProcessorName && <InfoRow label={t('dashboard.refunds.history.paidBy')} value={`${refund.paymentProcessorName} در ${formatDate(refund.paymentDate!)}`} />}
                            {refund.rejecterName && <InfoRow label={t('dashboard.refunds.history.rejectedBy')} value={`${refund.rejecterName} در ${formatDate(refund.rejectionDate!)}`} />}
                            {refund.rejectionReason && <InfoRow label={t('dashboard.refunds.detailsModal.rejectionReason')} value={refund.rejectionReason} />}
                         </div>
                    )}
                </div>
                 
                {refund.status !== 'COMPLETED' && refund.status !== 'REJECTED' && (
                    <div className="bg-gray-50 px-6 py-4">
                        {!showRejectionForm ? (
                             <div className="flex justify-end gap-3">
                                <button onClick={() => setShowRejectionForm(true)} className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50">{t('dashboard.refunds.detailsModal.rejectButton')}</button>
                                {refund.status === 'PENDING_EXPERT_REVIEW' && 
                                    <button onClick={() => { onUpdateRefund(refund.id, 'expert_approve'); onClose(); }} className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('dashboard.refunds.actions.approveForFinancial')}</button>
                                }
                                {refund.status === 'PENDING_FINANCIAL_REVIEW' && 
                                    <button onClick={() => { onUpdateRefund(refund.id, 'financial_approve'); onClose(); }} className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('dashboard.refunds.actions.approveForPayment')}</button>
                                }
                                {refund.status === 'PENDING_PAYMENT' && 
                                    <button onClick={() => { onUpdateRefund(refund.id, 'process_payment'); onClose(); }} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">{t('dashboard.refunds.actions.processPayment')}</button>
                                }
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-slate-700">{t('dashboard.refunds.detailsModal.rejectionReason')}</label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    placeholder={t('dashboard.refunds.detailsModal.rejectionPlaceholder')}
                                    className="w-full p-2 border rounded"
                                    rows={2}
                                />
                                 <div className="flex justify-end gap-3">
                                    <button onClick={() => setShowRejectionForm(false)} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                                    <button onClick={handleReject} disabled={!rejectionReason.trim()} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50">{t('dashboard.refunds.detailsModal.confirmRejectionButton')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                 )}
            </div>
        </div>
    );
};