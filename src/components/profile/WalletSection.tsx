
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
    
    const info = {
        name: currencyInfo.name[language],
        symbol: currencyInfo.symbol[language],
    };

    const formattedBalance = currencyInfo.code === 'USD'
        ? balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : formatNumber(balance);
    
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
    const isCredit = tx.type === 'DEPOSIT' || tx.type === 'REFUND';
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
    
    const allTransactions = Object.values(wallet)
        .flatMap(balanceInfo => balanceInfo.transactions)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
    const activeCurrencies = currencies.filter(c => c.isActive);
    
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('profile.wallet.balanceTitle')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCurrencies.map(currency => (
                        <BalanceCard
                            key={currency.code}
                            balance={wallet[currency.code]?.balance || 0}
                            currencyInfo={currency}
                        />
                    ))}
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
