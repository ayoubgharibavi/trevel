



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
        <div className="bg-white rounded-lg shadow p-5 border border-slate-200/80 space-y-4">
            <h3 className="text-xl font-bold text-primary border-b pb-3 mb-3">{t('priceSummary.title')}</h3>
            
            {passengers.adults > 0 && <PriceRow label={t('priceSummary.adult', passengers.adults)} value={flight.price * passengers.adults} />}
            {passengers.children > 0 && <PriceRow label={t('priceSummary.child', passengers.children)} value={flight.price * passengers.children} />}
            {passengers.infants > 0 && <PriceRow label={t('priceSummary.infant', passengers.infants)} value={flight.price * passengers.infants} />}
            
            <div className="border-t pt-4">
                 <PriceRow label={t('priceSummary.taxes')} value={taxesTotal} description={t('priceSummary.forPassengers', totalPassengers)} />
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">{t('priceSummary.total')}</p>
                    <p className="text-xl font-bold text-accent">
                         {formatNumber(finalPrice)} <span className="text-sm">{t('flightCard.currency')}</span>
                    </p>
                </div>
            </div>
            {onBack && (
                 <div className="border-t pt-4 space-y-3">
                    <button type="submit" className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-hover transition duration-300 text-lg">
                         {t('passengerDetails.submit')}
                     </button>
                     <button type="button" onClick={onBack} className="w-full text-center text-primary font-semibold py-2 rounded-lg hover:bg-secondary transition-colors">
                         {t('passengerDetails.backToSearch')}
                     </button>
                 </div>
            )}
        </div>
    );
};