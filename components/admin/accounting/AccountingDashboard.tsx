

import React, { useState } from 'react';
import type { Account, JournalEntry, Expense, User } from '../../../types';
import { AccountingOverview } from './AccountingOverview';
import { ChartOfAccountsList } from './ChartOfAccountsList';
import { JournalLedger } from './JournalLedger';
import { ExpenseManager } from './ExpenseManager';
import { FinancialReport } from './FinancialReport';

interface AccountingDashboardProps {
    chartOfAccounts: Account[];
    journalEntries: JournalEntry[];
    expenses: Expense[];
    users: User[];
    onCreateExpense: (expenseData: Omit<Expense, 'id'>) => void;
}

type ActiveTab = 'overview' | 'journal' | 'coa' | 'expenses' | 'reports';

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            {label}
        </button>
    );
};

export const AccountingDashboard: React.FC<AccountingDashboardProps> = ({
    chartOfAccounts,
    journalEntries,
    expenses,
    users,
    onCreateExpense,
}) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AccountingOverview journalEntries={journalEntries} accounts={chartOfAccounts} />;
            case 'journal':
                return <JournalLedger entries={journalEntries} accounts={chartOfAccounts} />;
            case 'coa':
                return <ChartOfAccountsList accounts={chartOfAccounts} />;
            case 'expenses':
                return <ExpenseManager expenses={expenses} onCreateExpense={onCreateExpense} accounts={chartOfAccounts} />;
            case 'reports':
                return <FinancialReport journalEntries={journalEntries} accounts={chartOfAccounts} users={users} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between border-b pb-4 mb-4">
                     <div>
                        <h2 className="text-2xl font-bold text-slate-800">داشبورد حسابداری</h2>
                        <p className="text-sm text-slate-500 mt-1">مدیریت جامع امور مالی شرکت</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <TabButton label="نمای کلی" isActive={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <TabButton label="دفتر روزنامه" isActive={activeTab === 'journal'} onClick={() => setActiveTab('journal')} />
                    <TabButton label="سرفصل حساب‌ها" isActive={activeTab === 'coa'} onClick={() => setActiveTab('coa')} />
                    <TabButton label="مدیریت هزینه‌ها" isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
                    <TabButton label="گزارشات مالی" isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
                {renderContent()}
            </div>
        </div>
    );
};