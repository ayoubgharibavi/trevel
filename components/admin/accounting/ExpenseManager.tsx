

import React, { useState, useMemo } from 'react';
import type { Expense, Account } from '../../../types';
import { AccountType } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';

interface ExpenseManagerProps {
    expenses: Expense[];
    accounts: Account[];
    onCreateExpense: (expenseData: Omit<Expense, 'id'>) => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ expenses, accounts, onCreateExpense }) => {
    const { language, t } = useLocalization();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [expenseAccountId, setExpenseAccountId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    const expenseAccounts = useMemo(() => {
        return accounts.filter(a => a.type === AccountType.Expense && !a.isParent);
    }, [accounts]);
    
    const getAccountName = (id: string) => {
        return accounts.find(a => a.id === id)?.name[language] || 'ناشناخته';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description && amount && expenseAccountId && date) {
            onCreateExpense({
                date: new Date(date).toISOString(),
                description,
                amount: Number(amount),
                expenseAccountId,
            });
            // Reset form
            setDescription('');
            setAmount('');
            setExpenseAccountId('');
        }
    };

    return (
        <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('accounting.expenses.title')}</h3>

            {/* Form to add a new expense */}
            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('accounting.expenses.description')}</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder={t('accounting.expenses.descriptionHint')}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('accounting.expenses.amount')} ({t('placeholders.rial')})</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2 border rounded"
                        placeholder="5000000"
                        required
                    />
                </div>
                <div>
                    <button type="submit" className="w-full bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition">
                        {t('accounting.expenses.submit')}
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('accounting.expenses.date')}</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                 <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('accounting.expenses.account')}</label>
                    <select
                        value={expenseAccountId}
                        onChange={e => setExpenseAccountId(e.target.value)}
                        className="w-full p-2 border rounded bg-white"
                        required
                    >
                        <option value="" disabled>{t('accounting.expenses.selectAccount')}</option>
                        {expenseAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name[language]}</option>)}
                    </select>
                </div>
            </form>

            {/* List of existing expenses */}
            <h4 className="text-lg font-semibold text-slate-700 mb-3">{t('accounting.expenses.recordedExpenses')}</h4>
             <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full border-collapse border border-slate-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-right text-xs font-medium text-gray-500 uppercase">{t('accounting.expenses.date')}</th>
                            <th className="border p-2 text-right text-xs font-medium text-gray-500 uppercase">{t('accounting.expenses.description')}</th>
                             <th className="border p-2 text-right text-xs font-medium text-gray-500 uppercase">{t('accounting.expenses.account')}</th>
                            <th className="border p-2 text-right text-xs font-medium text-gray-500 uppercase">{t('accounting.expenses.amount')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {expenses.length > 0 ? expenses.map(expense => (
                            <tr key={expense.id} className="border-t">
                                <td className="border p-2 whitespace-nowrap">{new Date(expense.date).toLocaleDateString('fa-IR')}</td>
                                <td className="border p-2 text-slate-800 font-medium">{expense.description}</td>
                                <td className="border p-2 text-slate-600">{getAccountName(expense.expenseAccountId)}</td>
                                <td className="border p-2 whitespace-nowrap font-mono">{expense.amount.toLocaleString('fa-IR')} {t('placeholders.rial')}</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={4} className="text-center py-10 text-slate-500">
                                    {t('accounting.expenses.noExpenses')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};