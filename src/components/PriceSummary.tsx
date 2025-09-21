



import React from 'react';
import type { Flight, Passengers, User, CurrencyInfo } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface PriceSummaryProps {
    flight: Flight;
    passengers: Passengers;
    user?: User | null;
    currencies?: CurrencyInfo[];
    onBack?: () => void;
}

export const PriceSummary: React.FC<PriceSummaryProps> = ({ flight, passengers, onBack }) => {
    const { t, formatNumber } = useLocalization();
    const totalPassengers = passengers.adults + passengers.children + passengers.infants;
    const basePriceTotal = flight.price * totalPassengers;
    const taxesTotal = flight.taxes * totalPassengers;
    const finalPrice = basePriceTotal + taxesTotal;

    const PriceRow: React.FC<{ label: string, value: number, description?: string }> = ({ label, value, description }) => (
        <div className="flex justify-between items-center text-sm">
            <div>
                <p className="text-slate-700">{label}</p>
                {description && <p className="text-xs text-slate-500">{description}</p>}
            </div>
            <p className="font-semibold text-slate-800">
                {formatNumber(value)} <span className="text-xs">{t('flightCard.currency')}</span>
            </p>
        </div>
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{t('priceSummary.title')}</h3>
                        <p className="text-blue-100 text-sm">جزئیات قیمت نهایی</p>
                    </div>
                </div>
            </div>
            
            {/* Price Details */}
            <div className="p-6 space-y-4">
                {passengers.adults > 0 && <PriceRow label={t('priceSummary.adult', passengers.adults)} value={flight.price * passengers.adults} />}
                {passengers.children > 0 && <PriceRow label={t('priceSummary.child', passengers.children)} value={flight.price * passengers.children} />}
                {passengers.infants > 0 && <PriceRow label={t('priceSummary.infant', passengers.infants)} value={flight.price * passengers.infants} />}
                
                <div className="border-t border-slate-200 pt-4">
                     <PriceRow label={t('priceSummary.taxes')} value={taxesTotal} description={t('priceSummary.forPassengers', totalPassengers)} />
                </div>

                {/* Total Price */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 border-2 border-blue-100">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-lg font-bold text-slate-800">{t('priceSummary.total')}</p>
                        </div>
                        <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                             {formatNumber(finalPrice)} <span className="text-sm text-slate-500">{t('flightCard.currency')}</span>
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            {onBack && (
                 <div className="border-t border-slate-200 p-6 space-y-3">
                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        {t('passengerDetails.submit')}
                    </button>
                    <button type="button" onClick={onBack} className="w-full text-center text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t('passengerDetails.backToSearch')}
                    </button>
                </div>
            )}
        </div>
    );
};