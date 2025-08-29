import React, { useMemo } from 'react';
import type { Booking, RefundPolicy, RefundPolicyRule } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

interface CancelBookingModalProps {
    booking: Booking;
    policy: RefundPolicy;
    onClose: () => void;
    onConfirm: () => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({ booking, policy, onClose, onConfirm }) => {
    const { t, formatNumber } = useLocalization();

    const refundCalculation = useMemo(() => {
        const now = new Date();
        const departure = new Date(booking.flight.departure.dateTime);
        const hoursBeforeDeparture = (departure.getTime() - now.getTime()) / (1000 * 60 * 60);

        const applicableRule = policy.rules
            .sort((a, b) => a.hoursBeforeDeparture - b.hoursBeforeDeparture)
            .find(rule => hoursBeforeDeparture <= rule.hoursBeforeDeparture);

        const penaltyPercentage = applicableRule ? applicableRule.penaltyPercentage : 100;

        const totalPassengers = booking.passengers.adults.length + booking.passengers.children.length + booking.passengers.infants.length;
        const originalAmount = (booking.flight.price + booking.flight.taxes) * totalPassengers;
        const penaltyAmount = (originalAmount * penaltyPercentage) / 100;
        const refundAmount = originalAmount - penaltyAmount;

        return { applicableRule, originalAmount, penaltyAmount, refundAmount };
    }, [booking, policy]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-primary">{t('profile.myBookings.cancelModal.title')}</h3>
                    <p className="text-sm text-slate-500 mt-1">{t('profile.myBookings.cancelModal.subtitle')}</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">{t('profile.myBookings.cancelModal.policyTitle')}</h4>
                        <div className="bg-slate-50 border p-3 rounded-md text-sm text-slate-600">
                             {refundCalculation.applicableRule ? (
                                <p>
                                    {t('profile.myBookings.cancelModal.policyRule', 
                                        refundCalculation.applicableRule.hoursBeforeDeparture, 
                                        refundCalculation.applicableRule.penaltyPercentage
                                    )}
                                </p>
                            ) : (
                                <p>{t('profile.myBookings.cancelModal.noPolicy')}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-600">{t('profile.myBookings.cancelModal.bookingAmount')}</span>
                            <span className="font-semibold">{formatNumber(refundCalculation.originalAmount)} {t('placeholders.rial')}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span >{t('profile.myBookings.cancelModal.penaltyAmount')}</span>
                            <span className="font-semibold">- {formatNumber(refundCalculation.penaltyAmount)} {t('placeholders.rial')}</span>
                        </div>
                         <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                            <span>{t('profile.myBookings.cancelModal.refundableAmount')}</span>
                            <span className="text-green-600">{formatNumber(refundCalculation.refundAmount)} {t('placeholders.rial')}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                    <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700">{t('profile.myBookings.cancelModal.confirmButton')}</button>
                </div>
            </div>
        </div>
    );
};
