
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
    const { language } = useLocalization();
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
            <h3 className="text-xl font-bold text-slate-800 mb-4">مدیریت هزینه‌ها</h3>

            {/* Form to add a new expense */}
            <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-slate-50 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-600 mb-1">شرح هزینه</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="مثال: خرید ملزومات اداری"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">مبلغ (تومان)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-2 border rounded"
                        placeholder="500,000"
                        required
                    />
                </div>
                <div>
                    <button type="submit" className="w-full bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-accent-hover transition">
                        ثبت هزینه
                    </button>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">تاریخ</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                 <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1">حساب هزینه</label>
                    <select
                        value={expenseAccountId}
                        onChange={e => setExpenseAccountId(e.target.value)}
                        className="w-full p-2 border rounded bg-white"
                        required
                    >
                        <option value="" disabled>یک حساب انتخاب کنید...</option>
                        {expenseAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name[language]}</option>)}
                    </select>
                </div>
            </form>

            {/* List of existing expenses */}
            <h4 className="text-lg font-semibold text-slate-700 mb-3">هزینه‌های ثبت شده</h4>
             <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">شرح</th>
                             <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">حساب هزینه</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">مبلغ</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {expenses.length > 0 ? expenses.map(expense => (
                            <tr key={expense.id}>
                                <td className="px-4 py-3 whitespace-nowrap">{new Date(expense.date).toLocaleDateString('fa-IR')}</td>
                                <td className="px-4 py-3 text-slate-800 font-medium">{expense.description}</td>
                                <td className="px-4 py-3 text-slate-600">{getAccountName(expense.expenseAccountId)}</td>
                                <td className="px-4 py-3 whitespace-nowrap font-mono">{expense.amount.toLocaleString('fa-IR')} تومان</td>
                            </tr>
                        )) : (
                             <tr>
                                <td colSpan={4} className="text-center py-10 text-slate-500">
                                    هیچ هزینه‌ای ثبت نشده است.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
