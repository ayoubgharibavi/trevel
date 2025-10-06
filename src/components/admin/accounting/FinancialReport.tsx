

import React, { useState, useMemo, useRef } from 'react';
import type { JournalEntry, Account, User } from '@/types';
import { AccountType } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { DownloadIcon } from '@/components/icons/DownloadIcon';
import { SearchIcon } from '@/components/icons/SearchIcon';
// PDF functionality will use browser print

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

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs font-medium rounded-full ${isActive ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
    >
        {label}
    </button>
);

export const FinancialReport: React.FC<FinancialReportProps> = ({ journalEntries, accounts, users }) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const { language, t, formatDate } = useLocalization();
    const reportContentRef = useRef<HTMLDivElement>(null);

    const [activeReport, setActiveReport] = useState<ReportType>('pnl');
    const [startDate, setStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
    
    const [selectedAccountId, setSelectedAccountId] = useState<string>('1020'); // Default to Accounts Receivable
    const [selectedUserId, setSelectedUserId] = useState<string>(users.find(u => u.role === 'USER')?.id || '');

    const formatCurrency = (amount: number, forLedger = false) => {
        if (!forLedger && amount === 0) return '0';
        if (forLedger && amount === 0) return '-';
        return `${Math.abs(amount).toLocaleString('fa-IR')}`;
    };
    
    const handleDownloadPDF = () => {
        // Open print dialog for PDF generation
        const printWindow = window.open('', '_blank');
        if (printWindow && reportContentRef.current) {
            const content = reportContentRef.current.innerHTML;
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>گزارش مالی - ${activeReport}</title>
                    <style>
                        body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .text-center { text-align: center; }
                        .font-bold { font-weight: bold; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1 style="text-align: center;">گزارش مالی - ${activeReport}</h1>
                    <p style="text-align: center;">تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
                    ${content}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    };
    
    const filteredEntries = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return journalEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= start && entryDate <= end;
        });
    }, [journalEntries, startDate, endDate]);

    const pnlReportData = useMemo(() => {
        const lines: ReportLine[] = [];
        let totalRevenue = 0;
        let totalExpenses = 0;

        const accountBalances: { [key: string]: number } = {};
        accounts.forEach(acc => accountBalances[acc.id] = 0);

        filteredEntries.forEach(entry => {
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

        // Revenues
        lines.push({ name: t('accounting.reports.pnl.revenues'), amount: 0, isTotal: true, level: 0 });
        accounts.filter(a => a.type === AccountType.Revenue && !a.isParent).forEach(acc => {
            if (accountBalances[acc.id] !== 0) {
                lines.push({ name: acc.name[language], amount: accountBalances[acc.id], isTotal: false, level: 1 });
                totalRevenue += accountBalances[acc.id];
            }
        });
        lines.push({ name: t('accounting.reports.pnl.totalRevenues'), amount: totalRevenue, isTotal: true, level: 0 });

        // Expenses
        lines.push({ name: t('accounting.reports.pnl.expenses'), amount: 0, isTotal: true, level: 0 });
        accounts.filter(a => a.type === AccountType.Expense && !a.isParent).forEach(acc => {
            if (accountBalances[acc.id] !== 0) {
                lines.push({ name: acc.name[language], amount: accountBalances[acc.id], isTotal: false, level: 1 });
                totalExpenses += accountBalances[acc.id];
            }
        });
        lines.push({ name: t('accounting.reports.pnl.totalExpenses'), amount: totalExpenses, isTotal: true, level: 0 });
        
        const netIncome = totalRevenue - totalExpenses;
        lines.push({ name: t('accounting.reports.pnl.netIncome'), amount: netIncome, isTotal: true, level: 0 });

        return lines;
    }, [filteredEntries, accounts, language, t]);

    const accountLedgerData = useMemo(() => {
        if (!selectedAccountId) return [];
        
        const lines: LedgerLine[] = [];
        let balance = 0; // Simplified: No opening balance calculation for now

        filteredEntries.forEach(entry => {
            entry.transactions.forEach(t => {
                if (t.accountId === selectedAccountId) {
                    balance += t.debit - t.credit;
                    lines.push({
                        date: formatDate(entry.date),
                        description: entry.description,
                        debit: t.debit,
                        credit: t.credit,
                        balance,
                    });
                }
            });
        });
        return lines;
    }, [selectedAccountId, filteredEntries, accounts, formatDate]);

    const customerLedgerData = useMemo(() => {
        if (!selectedUserId) return [];

        const lines: LedgerLine[] = [];
        let balance = 0;

        filteredEntries.forEach(entry => {
            if (entry.userId === selectedUserId) {
                const receivableTx = entry.transactions.find(t => t.accountId === '1020');

                if (receivableTx) {
                    if (receivableTx.debit > 0) { // Customer bought something
                        balance += receivableTx.debit;
                        lines.push({ date: formatDate(entry.date), description: entry.description, debit: receivableTx.debit, credit: 0, balance });
                    } else if (receivableTx.credit > 0) { // Customer got a refund/paid
                        balance -= receivableTx.credit;
                        lines.push({ date: formatDate(entry.date), description: entry.description, debit: 0, credit: receivableTx.credit, balance });
                    }
                }
            }
        });
        return lines;
    }, [selectedUserId, filteredEntries, formatDate]);

    const renderReport = () => {
        switch (activeReport) {
            case 'pnl':
                return (
                    <div className="text-right">
                        <h4 className="text-center font-bold text-lg mb-1">{t('accounting.reports.pnl.title')}</h4>
                        <p className="text-center text-sm text-slate-500 mb-4">{t('accounting.reports.pnl.period', formatDate(startDate), formatDate(endDate))}</p>
                        <table className="w-full text-sm">
                            <tbody>
                                {pnlReportData.map((line, index) => (
                                    <tr key={index} className={line.isTotal ? 'font-bold border-t' : ''}>
                                        <td className="p-2" style={{ paddingRight: `${line.level * 20}px` }}>{line.name}</td>
                                        <td className={`p-2 text-left font-mono ${line.amount < 0 ? 'text-red-600' : ''}`}>
                                            {line.amount < 0 ? `(${formatCurrency(line.amount)})` : formatCurrency(line.amount)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'accountLedger':
                const selectedAccount = accounts.find(a => a.id === selectedAccountId);
                return (
                    <div className="text-right">
                        <h4 className="text-center font-bold text-lg mb-1">{t('accounting.reports.accountLedger.title', selectedAccount?.name[language] || '')}</h4>
                        <p className="text-center text-sm text-slate-500 mb-4">{t('accounting.reports.pnl.period', formatDate(startDate), formatDate(endDate))}</p>
                        {accountLedgerData.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="p-2 text-right font-medium">{t('accounting.journal.date')}</th>
                                        <th className="p-2 text-right font-medium">{t('accounting.journal.description')}</th>
                                        <th className="p-2 text-left font-medium">{t('accounting.journal.debit')}</th>
                                        <th className="p-2 text-left font-medium">{t('accounting.journal.credit')}</th>
                                        <th className="p-2 text-left font-medium">{t('accounting.reports.accountLedger.balance')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {accountLedgerData.map((line, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-2">{line.date}</td>
                                            <td className="p-2">{line.description}</td>
                                            <td className="p-2 text-left font-mono">{formatCurrency(line.debit, true)}</td>
                                            <td className="p-2 text-left font-mono">{formatCurrency(line.credit, true)}</td>
                                            <td className="p-2 text-left font-mono">{formatCurrency(line.balance)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="text-center text-slate-500 py-8">{t('accounting.reports.noTransactions')}</p>}
                    </div>
                );
            case 'customerLedger':
                const selectedUser = users.find(u => u.id === selectedUserId);
                return (
                    <div className="text-right">
                       <h4 className="text-center font-bold text-lg mb-1">{t('accounting.reports.customerLedger.title', selectedUser?.name || '')}</h4>
                       <p className="text-center text-sm text-slate-500 mb-4">{t('accounting.reports.pnl.period', formatDate(startDate), formatDate(endDate))}</p>
                       {customerLedgerData.length > 0 ? (
                           <table className="w-full text-sm">
                               <thead>
                                   <tr className="bg-slate-50">
                                       <th className="p-2 text-right font-medium">{t('accounting.journal.date')}</th>
                                       <th className="p-2 text-right font-medium">{t('accounting.journal.description')}</th>
                                       <th className="p-2 text-left font-medium">{t('accounting.reports.customerLedger.purchaseDebit')}</th>
                                       <th className="p-2 text-left font-medium">{t('accounting.reports.customerLedger.refundCredit')}</th>
                                       <th className="p-2 text-left font-medium">{t('accounting.reports.accountLedger.balance')}</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   {customerLedgerData.map((line, index) => (
                                       <tr key={index} className="border-t">
                                           <td className="p-2">{line.date}</td>
                                           <td className="p-2">{line.description}</td>
                                           <td className="p-2 text-left font-mono">{formatCurrency(line.debit, true)}</td>
                                           <td className="p-2 text-left font-mono">{formatCurrency(line.credit, true)}</td>
                                           <td className="p-2 text-left font-mono">{formatCurrency(line.balance)}</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                       ) : <p className="text-center text-slate-500 py-8">{t('accounting.reports.noTransactions')}</p>}
                   </div>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-slate-800">{t('accounting.reports.title')}</h3>
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-3 rounded-lg transition">
                    <DownloadIcon className="w-4 h-4" />
                    <span>{t('accounting.reports.exportPDF')}</span>
                </button>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <TabButton label={t('accounting.reports.tabs.pnl')} isActive={activeReport === 'pnl'} onClick={() => setActiveReport('pnl')} />
                    <TabButton label={t('accounting.reports.tabs.accountLedger')} isActive={activeReport === 'accountLedger'} onClick={() => setActiveReport('accountLedger')} />
                    <TabButton label={t('accounting.reports.tabs.customerLedger')} isActive={activeReport === 'customerLedger'} onClick={() => setActiveReport('customerLedger')} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs text-slate-500">{t('accounting.reports.from')}</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded text-sm"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500">{t('accounting.reports.to')}</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded text-sm"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 invisible">{t('accounting.reports.search')}</label>
                        <button 
                            onClick={() => {
                                // Trigger report refresh with new date range
                                console.log('Searching reports from', startDate, 'to', endDate);
                            }}
                            className="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            <SearchIcon className="w-4 h-4" />
                            {t('accounting.reports.search')}
                        </button>
                    </div>
                    {activeReport === 'accountLedger' && (
                        <div>
                           <label className="text-xs text-slate-500">{t('accounting.reports.selectAccount')}</label>
                           <select value={selectedAccountId} onChange={e => setSelectedAccountId(e.target.value)} className="w-full p-2 border rounded text-sm bg-white">
                               {accounts.filter(a => !a.isParent).map(acc => (
                                   <option key={acc.id} value={acc.id}>{acc.name[language]} ({acc.id})</option>
                               ))}
                           </select>
                       </div>
                   )}
                    {activeReport === 'customerLedger' && (
                        <div>
                           <label className="text-xs text-slate-500">{t('accounting.reports.selectCustomer')}</label>
                           <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-2 border rounded text-sm bg-white">
                               {users.filter(u => u.role === 'USER').map(user => (
                                   <option key={user.id} value={user.id}>{user.name}</option>
                               ))}
                           </select>
                       </div>
                   )}
                </div>
            </div>
            <div ref={reportContentRef} className="p-4 border rounded-lg">
                {renderReport()}
            </div>
        </div>
    );
};
