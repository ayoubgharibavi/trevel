
import React from 'react';
import type { Wallet, WalletTransaction, CurrencyInfo } from '@/types';
import { Currency } from '@/types';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { useLocalization } from '@/hooks/useLocalization';

const BalanceCard: React.FC<{
    balance: number;
    currencyInfo: CurrencyInfo;
}> = ({ balance, currencyInfo }) => {
    const { t, formatNumber, language } = useLocalization();
    
    // Debug balance formatting
    console.log('🔍 BalanceCard - balance:', balance);
    console.log('🔍 BalanceCard - currencyInfo.code:', currencyInfo.code);
    console.log('🔍 BalanceCard - language:', language);
    
    const info = {
        name: currencyInfo.name[language],
        symbol: currencyInfo.symbol[language],
    };

    const formattedBalance = currencyInfo.code === 'USD'
        ? balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : formatNumber(balance);
    
    console.log('🔍 BalanceCard - formattedBalance:', formattedBalance);
    
    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-slate-500">{info.name}</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">
                        {formattedBalance} <span className="text-lg font-normal">{info.symbol}</span>
                    </p>
                </div>
                <button className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm flex items-center gap-1">
                    <PlusIcon className="w-4 h-4" />
                    <span>{t('profile.wallet.charge')}</span>
                </button>
            </div>
        </div>
    );
};

const TransactionRow: React.FC<{ tx: WalletTransaction }> = ({ tx }) => {
    const { formatDate, formatNumber } = useLocalization();
    const isCredit = tx.type === 'CREDIT' || tx.type === 'DEPOSIT' || tx.type === 'REFUND';
    const amountColor = isCredit ? 'text-green-600' : 'text-red-600';
    const sign = isCredit ? '+' : '';

    return (
        <tr className="border-b last:border-b-0">
            <td className="p-3 text-sm text-slate-500 whitespace-nowrap">{formatDate(tx.date, { dateStyle: 'medium', timeStyle: 'short'})}</td>
            <td className="p-3 text-sm text-slate-700">{tx.description}</td>
            <td className={`p-3 text-sm font-mono font-semibold text-left ${amountColor}`}>
                {sign}{formatNumber(Math.abs(tx.amount))}
            </td>
            <td className="p-3 text-sm text-slate-500 text-left font-mono">{tx.currency}</td>
        </tr>
    );
};

export const WalletSection: React.FC<{ wallet: Wallet; currencies: CurrencyInfo[] }> = ({ wallet, currencies }) => {
    const { t } = useLocalization();
    
    // Debug wallet data
    console.log('🔍 WalletSection - wallet prop:', wallet);
    console.log('🔍 WalletSection - wallet.IRR:', wallet?.IRR);
    console.log('🔍 WalletSection - wallet.IRR?.balance:', wallet?.IRR?.balance);
    
    // Fallback for wallet if it's undefined
    const safeWallet = wallet || {};
    
    const allTransactions = safeWallet ? Object.values(safeWallet)
        .flatMap(balanceInfo => balanceInfo.transactions)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
        
    const activeCurrencies = currencies.filter(c => c.isActive);
    
    // Debug currencies
    console.log('🔍 WalletSection - currencies:', currencies);
    console.log('🔍 WalletSection - activeCurrencies:', activeCurrencies);
    console.log('🔍 WalletSection - safeWallet:', safeWallet);
    
    // Fallback: If no active currencies, show IRR directly
    const currenciesToShow = activeCurrencies.length > 0 ? activeCurrencies : [
        {
            id: 'IRR',
            code: 'IRR',
            name: { fa: 'ریال ایران', en: 'Iranian Rial', ar: 'ريال إيراني' },
            symbol: { fa: 'ریال', en: 'IRR', ar: 'ريال' },
            isActive: true
        }
    ];
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('profile.wallet.balanceTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currenciesToShow.map(currency => {
                        const balance = safeWallet?.[currency.code]?.balance || 0;
                        console.log(`🔍 WalletSection - Currency ${currency.code}:`, { currency, balance });
                        
                        // Force display the correct balance for IRR
                        const displayBalance = currency.code === 'IRR' ? 
                            (safeWallet?.IRR?.balance || 0) : balance;
                        
                        return (
                            <BalanceCard
                                key={currency.code}
                                balance={displayBalance}
                                currencyInfo={currency}
                            />
                        );
                    })}
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
                 <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('profile.wallet.transactionsTitle')}</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 text-left">
                            <tr>
                                <th className="p-3 text-xs font-medium text-slate-500 uppercase text-right">{t('profile.wallet.date')}</th>
                                <th className="p-3 text-xs font-medium text-slate-500 uppercase text-right">{t('profile.wallet.description')}</th>
                                <th className="p-3 text-xs font-medium text-slate-500 uppercase">{t('profile.wallet.amount')}</th>
                                <th className="p-3 text-xs font-medium text-slate-500 uppercase">{t('profile.wallet.currency')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTransactions.length > 0 ? (
                                allTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-10 text-slate-500">
                                        {t('profile.wallet.noTransactions')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
