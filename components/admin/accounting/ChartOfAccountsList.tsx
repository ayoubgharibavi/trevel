
import React from 'react';
import type { Account } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface ChartOfAccountsListProps {
    accounts: Account[];
}

const accountTypeMap: Record<string, string> = {
    Asset: 'دارایی',
    Liability: 'بدهی',
    Equity: 'حقوق صاحبان سهام',
    Revenue: 'درآمد',
    Expense: 'هزینه',
};

export const ChartOfAccountsList: React.FC<ChartOfAccountsListProps> = ({ accounts }) => {
    const { language } = useLocalization();
    const renderAccountRow = (account: Account, level: number) => {
        const isParent = account.isParent;
        const padding = level * 20; // 20px padding for each level of hierarchy

        return (
            <tr key={account.id} className={isParent ? 'bg-slate-50' : ''}>
                <td className="px-6 py-3 whitespace-nowrap" style={{ paddingRight: `${padding + 24}px` }}>
                    <span className={`font-mono ${isParent ? 'font-bold' : ''}`}>{account.id}</span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap">
                    <span className={isParent ? 'font-bold text-slate-800' : 'text-slate-700'}>{account.name[language]}</span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-slate-600">{accountTypeMap[account.type]}</td>
            </tr>
        );
    };

    const renderAccounts = (parentId: string | null = null, level = 0) => {
        const children = accounts.filter(acc => acc.parent === parentId);
        return children.flatMap(acc => [
            renderAccountRow(acc, level),
            ...renderAccounts(acc.id, level + 1)
        ]);
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">سرفصل حساب‌ها (Chart of Accounts)</h3>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کد حساب</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام حساب</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع حساب</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {renderAccounts()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
