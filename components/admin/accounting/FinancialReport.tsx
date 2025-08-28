

import React, { useState, useMemo } from 'react';
import type { JournalEntry, Account, User } from '../../../types';
import { AccountType } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface FinancialReportProps {
    journalEntries: JournalEntry[];
    accounts: Account[];
    users: User[];
}

type ReportType = 'pnl' | 'accountLedger' | 'customerLedger';

interface ReportLine {
    name: string;
    amount: number;
    isTotal: boolean;
    level: number;
}

interface LedgerLine {
    date: string;
    description: string;
    debit: number;
    credit: number;
    balance: number;
}

export const FinancialReport: React.FC<FinancialReportProps> = ({ journalEntries, accounts, users }) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const { language } = useLocalization();

    const [activeReport, setActiveReport] = useState<ReportType>('pnl');
    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    
    // State for Account Ledger
    const [selectedAccountId, setSelectedAccountId] = useState<string>('1010'); // Default to Cash/Bank

    // State for Customer Ledger
    const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');

    const pnlReportData = useMemo(() => {
        // ... (Profit & Loss calculation logic) ...
        const lines: ReportLine[] = [];
        let totalRevenue = 0;
        let totalExpenses = 0;

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const relevantEntries = journalEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= start && entryDate <= end;
        });

        const accountBalances: { [key: string]: number } = {};
        accounts.forEach(acc => accountBalances[acc.id] = 0);

        relevantEntries.forEach(entry => {
            entry.transactions.forEach(t => {
                const account = accounts.find(a => a.id === t.accountId);
                if (account) {
                    if (account.type === AccountType.Revenue) {
                        accountBalances[t.accountId] += t.credit - t.debit;
                    } else if (account.type === AccountType.Expense) {
                        accountBalances[t.accountId] += t.debit - t.credit;
                    }
                }
            });
        });

        lines.push({ name: 'درآمدها', amount: 0, isTotal: true, level: 0 });
        const revenueAccounts = accounts.filter(a => a.type === AccountType.Revenue && !a.isParent);
        revenueAccounts.forEach(acc => {
            if (accountBalances[acc.id] !== 0) {
                 lines.push({ name: acc.name[language], amount: accountBalances[acc.id], isTotal: false, level: 1 });
                 totalRevenue += accountBalances[acc.id];
            }
        });
        lines.push({ name: 'جمع کل درآمدها', amount: totalRevenue, isTotal: true, level: 0 });
        lines.push({ name: '', amount: 0, isTotal: false, level: -1 }); // Spacer

        lines.push({ name: 'هزینه‌ها', amount: 0, isTotal: true, level: 0 });
        const expenseAccounts = accounts.filter(a => a.type === AccountType.Expense && !a.isParent);
        expenseAccounts.forEach(acc => {
            if (accountBalances[acc.id] !== 0) {
                lines.push({ name: acc.name[language], amount: accountBalances[acc.id], isTotal: false, level: 1 });
                totalExpenses += accountBalances[acc.id];
            }
        });
        lines.push({ name: 'جمع کل هزینه‌ها', amount: totalExpenses, isTotal: true, level: 0 });
        lines.push({ name: '', amount: 0, isTotal: false, level: -1 }); // Spacer

        const netIncome = totalRevenue - totalExpenses;
        lines.push({ name: 'سود (زیان) خالص', amount: netIncome, isTotal: true, level: -2 });

        return lines;
    }, [journalEntries, accounts, startDate, endDate, language]);
    
    const accountLedgerData = useMemo(() => {
        if (!selectedAccountId) return [];
        const lines: LedgerLine[] = [];
        let runningBalance = 0;
        
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const sortedEntries = [...journalEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            const transaction = entry.transactions.find(t => t.accountId === selectedAccountId);
            if (transaction && entryDate >= start && entryDate <= end) {
                runningBalance += transaction.debit - transaction.credit;
                lines.push({
                    date: entry.date,
                    description: entry.description,
                    debit: transaction.debit,
                    credit: transaction.credit,
                    balance: runningBalance,
                });
            }
        });
        return lines;
    }, [journalEntries, selectedAccountId, startDate, endDate]);
    
     const customerLedgerData = useMemo(() => {
        if (!selectedUserId) return [];
        const lines: LedgerLine[] = [];
        let runningBalance = 0; // Balance from the customer's perspective (Debit = they owe us)
        
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const sortedEntries = [...journalEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        sortedEntries.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entry.userId === selectedUserId && entryDate >= start && entryDate <= end) {
                const arTransaction = entry.transactions.find(t => t.accountId === '1020'); // Accounts Receivable
                 if (arTransaction) {
                    runningBalance += arTransaction.debit - arTransaction.credit;
                    lines.push({
                        date: entry.date,
                        description: entry.description,
                        debit: arTransaction.debit, // A debit to A/R means a sale
                        credit: arTransaction.credit, // A credit to A/R means a cancellation/payment
                        balance: runningBalance,
                    });
                }
            }
        });
        return lines;
    }, [journalEntries, selectedUserId, startDate, endDate]);

    const formatCurrency = (amount: number, forLedger = false) => {
        if (!forLedger && amount === 0) return '0';
        if (forLedger && amount === 0) return '-';
        return `${Math.abs(amount).toLocaleString('fa-IR')}`;
    };

    const ReportHeader = ({ title, subTitle }: { title: string, subTitle: string }) => (
        <div className="text-center mb-4">
            <h4 className="font-bold text-lg">{title}</h4>
            <p className="text-sm text-slate-500">
                {subTitle}
            </p>
        </div>
    );
    
    const ReportTab: React.FC<{ report: ReportType, label: string }> = ({ report, label }) => (
        <button
            onClick={() => setActiveReport(report)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeReport === report ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-4 flex-wrap">
                 <h3 className="text-xl font-bold text-slate-800">گزارشات مالی</h3>
                 <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                    <ReportTab report="pnl" label="سود و زیان" />
                    <ReportTab report="accountLedger" label="دفتر تفکیکی حساب" />
                    <ReportTab report="customerLedger" label="صورتحساب مشتری" />
                </div>
            </div>
            
            <div className="mb-6 p-4 border rounded-lg bg-slate-50 flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-slate-600 mb-1">از تاریخ</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium text-slate-600 mb-1">تا تاریخ</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                {activeReport === 'accountLedger' && (
                    <div className="flex-1 min-w-[200px]">
                         <label className="block text-sm font-medium text-slate-600 mb-1">انتخاب حساب</label>
                         <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full p-2 border rounded bg-white">
                            {accounts.filter(a => !a.isParent).map(acc => <option key={acc.id} value={acc.id}>{acc.name[language]} ({acc.id})</option>)}
                         </select>
                    </div>
                )}
                 {activeReport === 'customerLedger' && (
                    <div className="flex-1 min-w-[200px]">
                         <label className="block text-sm font-medium text-slate-600 mb-1">انتخاب مشتری</label>
                         <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-2 border rounded bg-white">
                            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                         </select>
                    </div>
                )}
            </div>
            
            <div className="border rounded-lg p-4">
                {activeReport === 'pnl' && (
                    <>
                        <ReportHeader title="صورت سود و زیان" subTitle={`برای دوره از ${new Date(startDate).toLocaleDateString('fa-IR')} تا ${new Date(endDate).toLocaleDateString('fa-IR')}`} />
                        <div className="space-y-2 max-w-lg mx-auto">
                            {pnlReportData.map((line, index) => {
                                if (line.level === -1) return <div key={index} className="h-4"></div>;
                                const isNetIncome = line.level === -2;
                                return (
                                    <div key={index} className={`flex justify-between items-center py-2 ${line.isTotal ? 'border-t' : ''} ${isNetIncome ? 'border-t-2 border-slate-800 font-bold' : ''}`}>
                                        <span className={`${line.isTotal ? 'font-bold' : ''} ${isNetIncome ? 'text-lg text-primary' : 'text-slate-800'}`} style={{ paddingRight: `${line.level * 20}px` }}>{line.name}</span>
                                        <span className={`font-mono ${isNetIncome ? 'text-lg' : 'text-slate-800'}`}>{`${formatCurrency(line.amount)} ${line.amount < 0 ? '(زیان)' : ''}`}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {activeReport === 'accountLedger' && (
                    <>
                        <ReportHeader title={`دفتر تفکیکی حساب: ${accounts.find(a => a.id === selectedAccountId)?.name[language] || ''}`} subTitle={`از ${new Date(startDate).toLocaleDateString('fa-IR')} تا ${new Date(endDate).toLocaleDateString('fa-IR')}`} />
                        <table className="w-full text-sm text-right">
                            <thead className="bg-slate-100"><tr><th className="p-2 font-semibold">تاریخ</th><th className="p-2 font-semibold">شرح</th><th className="p-2 font-semibold">بدهکار</th><th className="p-2 font-semibold">بستانکار</th><th className="p-2 font-semibold">مانده</th></tr></thead>
                            <tbody>
                                {accountLedgerData.map((line, index) => <tr key={index} className="border-b"><td className="p-2 whitespace-nowrap">{new Date(line.date).toLocaleDateString('fa-IR')}</td><td className="p-2">{line.description}</td><td className="p-2 font-mono">{formatCurrency(line.debit, true)}</td><td className="p-2 font-mono">{formatCurrency(line.credit, true)}</td><td className="p-2 font-mono">{formatCurrency(line.balance, false)}</td></tr>)}
                                {accountLedgerData.length === 0 && <tr><td colSpan={5} className="text-center p-8 text-slate-500">هیچ تراکنشی در این بازه زمانی برای این حساب یافت نشد.</td></tr>}
                            </tbody>
                        </table>
                    </>
                )}

                {activeReport === 'customerLedger' && (
                    <>
                        <ReportHeader title={`صورتحساب مشتری: ${users.find(u => u.id === selectedUserId)?.name || ''}`} subTitle={`از ${new Date(startDate).toLocaleDateString('fa-IR')} تا ${new Date(endDate).toLocaleDateString('fa-IR')}`} />
                         <table className="w-full text-sm text-right">
                            <thead className="bg-slate-100"><tr><th className="p-2 font-semibold">تاریخ</th><th className="p-2 font-semibold">شرح</th><th className="p-2 font-semibold">خرید (بدهکار)</th><th className="p-2 font-semibold">بازگشت/پرداخت (بستانکار)</th><th className="p-2 font-semibold">مانده</th></tr></thead>
                            <tbody>
                                {customerLedgerData.map((line, index) => <tr key={index} className="border-b"><td className="p-2 whitespace-nowrap">{new Date(line.date).toLocaleDateString('fa-IR')}</td><td className="p-2">{line.description}</td><td className="p-2 font-mono">{formatCurrency(line.debit, true)}</td><td className="p-2 font-mono">{formatCurrency(line.credit, true)}</td><td className="p-2 font-mono">{formatCurrency(line.balance, false)}</td></tr>)}
                                {customerLedgerData.length === 0 && <tr><td colSpan={5} className="text-center p-8 text-slate-500">هیچ تراکنشی در این بازه زمانی برای این مشتری یافت نشد.</td></tr>}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        </div>
    );
};
