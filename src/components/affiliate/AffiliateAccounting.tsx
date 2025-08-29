import React, { useMemo } from 'react';
import type { User, WalletTransaction } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { CurrencyTomanIcon } from '@/components/icons/CurrencyTomanIcon';

export const AffiliateAccounting: React.FC<{ user: User }> = ({ user }) => {
    const { t, formatNumber, formatDate } = useLocalization();
    
    const { totalEarnings, commissionTransactions } = useMemo(() => {
        const transactions = user.wallet['IRR']?.transactions || [];
        const commissions = transactions
            .filter(tx => tx.type === 'COMMISSION_PAYOUT')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const earnings = commissions.reduce((sum, tx) => sum + tx.amount, 0);

        return { totalEarnings: earnings, commissionTransactions: commissions };
    }, [user.wallet]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">{t('affiliate.accounting.title')}</h2>
            
            <div className="bg-white p-5 rounded-lg shadow border flex items-center">
                <div className="text-white bg-green-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <CurrencyTomanIcon className="w-6 h-6" />
                </div>
                <div className="mr-4">
                    <p className="text-sm text-slate-500 font-medium">{t('affiliate.accounting.totalEarnings')}</p>
                    <p className="text-2xl font-bold text-slate-800">{formatNumber(totalEarnings)} {t('placeholders.rial')}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
                <h3 className="text-xl font-bold text-slate-800 mb-4">{t('affiliate.accounting.transactions')}</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('affiliate.accounting.date')}</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('affiliate.accounting.description')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('affiliate.accounting.amount')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {commissionTransactions.length > 0 ? commissionTransactions.map(tx => (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(tx.date, { dateStyle: 'medium', timeStyle: 'short'})}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{tx.description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold font-mono text-left">
                                        + {formatNumber(tx.amount)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-10 text-center text-gray-500">
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