
import React, { useMemo } from 'react';
import type { JournalEntry, Account } from '../../../types';
import { AccountType } from '../../../types';
import { CurrencyTomanIcon } from '../../icons/CurrencyTomanIcon';

interface AccountingOverviewProps {
    journalEntries: JournalEntry[];
    accounts: Account[];
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-lg shadow border flex items-center">
        <div className={`text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 ${color}`}>
            {icon}
        </div>
        <div className="mr-4">
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

export const AccountingOverview: React.FC<AccountingOverviewProps> = ({ journalEntries, accounts }) => {
    
    const financialSummary = useMemo(() => {
        let totalRevenue = 0;
        let totalExpenses = 0;

        const revenueAccountIds = accounts.filter(a => a.type === AccountType.Revenue).map(a => a.id);
        const expenseAccountIds = accounts.filter(a => a.type === AccountType.Expense).map(a => a.id);

        journalEntries.forEach(entry => {
            entry.transactions.forEach(t => {
                if (revenueAccountIds.includes(t.accountId)) {
                    totalRevenue += t.credit - t.debit; // Revenue has a credit balance
                }
                if (expenseAccountIds.includes(t.accountId)) {
                    totalExpenses += t.debit - t.credit; // Expenses have a debit balance
                }
            });
        });
        
        const netIncome = totalRevenue - totalExpenses;

        return { totalRevenue, totalExpenses, netIncome };

    }, [journalEntries, accounts]);

    const formatCurrency = (amount: number) => `${amount.toLocaleString('fa-IR')} تومان`;

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">نمای کلی مالی</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard 
                    title="مجموع درآمد" 
                    value={formatCurrency(financialSummary.totalRevenue)} 
                    icon={<CurrencyTomanIcon className="w-6 h-6" />}
                    color="bg-green-500"
                />
                 <StatCard 
                    title="مجموع هزینه‌ها" 
                    value={formatCurrency(financialSummary.totalExpenses)} 
                    icon={<CurrencyTomanIcon className="w-6 h-6" />}
                    color="bg-red-500"
                />
                 <StatCard 
                    title="سود خالص" 
                    value={formatCurrency(financialSummary.netIncome)} 
                    icon={<CurrencyTomanIcon className="w-6 h-6" />}
                    color={financialSummary.netIncome >= 0 ? "bg-blue-500" : "bg-orange-500"}
                />
            </div>
            <div className="mt-8 text-center text-sm text-slate-500">
                <p>این آمار بر اساس تمام تراکنش‌های ثبت شده در دفتر روزنامه محاسبه شده است.</p>
            </div>
        </div>
    );
};
