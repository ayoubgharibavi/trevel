import type { CurrencyInfo } from '../types';

export const initialCurrencies: CurrencyInfo[] = [
    { id: 'curr-1', name: { ar: 'ريال إيراني', fa: 'ریال ایران', en: 'Iranian Rial' }, code: 'IRR', symbol: { ar: 'ریال', fa: 'ریال', en: 'IRR' }, isActive: true, rateToUsd: 500000 },
    { id: 'curr-2', name: { ar: 'دولار أمريكي', fa: 'دلار آمریکا', en: 'US Dollar' }, code: 'USD', symbol: { ar: '$', fa: '$', en: '$' }, isActive: true, rateToUsd: 1 },
    { id: 'curr-3', name: { ar: 'دينار عراقي', fa: 'دینار عراق', en: 'Iraqi Dinar' }, code: 'IQD', symbol: { ar: 'IQD', fa: 'IQD', en: 'IQD' }, isActive: true, rateToUsd: 1460 },
    { id: 'curr-4', name: { ar: 'ريال سعودي', fa: 'ریال عربستان', en: 'Saudi Riyal' }, code: 'SAR', symbol: { ar: 'SAR', fa: 'SAR', en: 'SAR' }, isActive: false, rateToUsd: 3.75 },
];
