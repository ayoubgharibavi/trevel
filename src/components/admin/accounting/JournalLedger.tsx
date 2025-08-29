
import React from 'react';
import type { JournalEntry, Account } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

interface JournalLedgerProps {
    entries: JournalEntry[];
    accounts: Account[];
}

export const JournalLedger: React.FC<JournalLedgerProps> = ({ entries, accounts }) => {
    const { language } = useLocalization();
    const getAccountName = (id: string) => {
        return accounts.find(a => a.id === id)?.name[language] || 'ناشناخته';
    };

    const formatCurrency = (amount: number) => {
        if (amount === 0) return '-';
        return amount.toLocaleString('fa-IR');
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">دفتر روزنامه (General Ledger)</h3>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">شرح</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">حساب</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">بدهکار (تومان)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">بستانکار (تومان)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {entries.length > 0 ? entries.map((entry, entryIndex) => (
                            <React.Fragment key={entry.id}>
                                <tr className="bg-slate-50 font-semibold">
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(entry.date).toLocaleDateString('fa-IR')}</td>
                                    <td colSpan={4} className="px-4 py-3 text-slate-800">{entry.description}</td>
                                </tr>
                                {entry.transactions.map((t, transIndex) => (
                                     <tr key={`${entry.id}-${transIndex}`}>
                                        <td className="px-4 py-2"></td>
                                        <td className="px-4 py-2"></td>
                                        <td className="px-4 py-2 text-slate-700">{getAccountName(t.accountId)}</td>
                                        <td className="px-4 py-2 text-slate-800 font-mono text-left">{formatCurrency(t.debit)}</td>
                                        <td className="px-4 py-2 text-slate-800 font-mono text-left">{formatCurrency(t.credit)}</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-slate-500">
                                    هیچ تراکنشی برای نمایش وجود ندارد.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
