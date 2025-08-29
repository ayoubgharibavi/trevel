import React from 'react';
import type { User, CurrencyInfo } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface CurrencyDisplayProps {
    valueIRR: number;
    currentUser: User | null;
    currencies: CurrencyInfo[];
    mainClassName?: string;
    subClassName?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ valueIRR, currentUser, currencies, mainClassName, subClassName }) => {
    const { formatNumber, language } = useLocalization();
    const locale = language === 'fa' ? 'fa-IR' : language === 'ar' ? 'ar-EG' : 'en-US';

    // Find base currencies for conversion (IRR and USD)
    const irrInfo = currencies.find(c => c.code === 'IRR');
    const usdInfo = currencies.find(c => c.code === 'USD');

    // Always display the primary currency (IRR)
    const primaryDisplay = (
        <span className={mainClassName}>
            {formatNumber(valueIRR)} {irrInfo ? irrInfo.symbol[language] : 'IRR'}
        </span>
    );

    // If we can't do conversions (missing IRR or USD data), just show the primary currency
    if (!irrInfo || !usdInfo) {
        return primaryDisplay;
    }
    
    // Perform conversion from IRR to USD, which is our pivot currency
    const valueInUSD = valueIRR / irrInfo.rateToUsd;

    // Determine which other currencies to display based on user preferences
    const preferredCurrencyCodes = currentUser?.displayCurrencies || [];
    const currenciesToDisplay = preferredCurrencyCodes
        .map(code => currencies.find(c => c.code === code))
        .filter((c): c is CurrencyInfo => !!c && c.code !== 'IRR'); // Ensure currency exists and is not IRR

    // If no other currencies are preferred, only show IRR
    if (currenciesToDisplay.length === 0) {
        return (
             <div className="flex flex-col items-center md:items-start">
                {primaryDisplay}
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center md:items-start">
            {primaryDisplay}
            <div className="flex flex-wrap gap-x-2 items-center justify-center md:justify-start">
                {currenciesToDisplay.map(currency => {
                    // Convert from USD to the target currency
                    const convertedValue = valueInUSD * currency.rateToUsd;
                    return (
                        <span key={currency.code} className={subClassName}>
                            (≈ {convertedValue.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency.symbol[language] || currency.code})
                        </span>
                    );
                })}
            </div>
        </div>
    );
};
