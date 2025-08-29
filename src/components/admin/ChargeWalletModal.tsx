
import React, { useState } from 'react';
import type { User, CurrencyInfo } from '@/types';
import { Currency } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

interface ChargeWalletModalProps {
    user: User;
    currencies: CurrencyInfo[];
    onClose: () => void;
    onSave: (userId: string, amount: number, currency: Currency, description: string) => void;
}

export const ChargeWalletModal: React.FC<ChargeWalletModalProps> = ({ user, currencies, onClose, onSave }) => {
    const { t, language } = useLocalization();
    const [amount, setAmount] = useState<number | ''>('');
    const [currency, setCurrency] = useState<Currency>('IRR');
    const [description, setDescription] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount === '' || amount <= 0) return;
        const finalDescription = description.trim() || t('dashboard.users.chargeWalletModal.defaultDescription', user.name);
        onSave(user.id, amount, currency, finalDescription);
    };

    const activeCurrencies = currencies.filter(c => c.isActive);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <form 
                className="bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full"
                onClick={e => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <div className="px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl leading-6 font-bold text-primary">{t('dashboard.users.chargeWalletModal.title')}</h3>
                            <p className="text-sm text-slate-500 mt-1">{t('dashboard.users.chargeWalletModal.subtitle', user.name)}</p>
                        </div>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-700">{t('dashboard.users.chargeWalletModal.amount')}</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                    required
                                    min="1"
                                />
                            </div>
                             <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-slate-700">{t('dashboard.users.chargeWalletModal.currency')}</label>
                                <select
                                    id="currency"
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value as Currency)}
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent bg-white"
                                >
                                    {activeCurrencies.map(opt => <option key={opt.code} value={opt.code}>{opt.name[language]}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                                {t('dashboard.users.chargeWalletModal.description')}
                                <span className="text-xs text-slate-400 mr-1">({t('dashboard.users.chargeWalletModal.optional')})</span>
                            </label>
                            <input
                                type="text"
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                placeholder={t('dashboard.users.chargeWalletModal.descriptionHint')}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                        type="submit" 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {t('dashboard.users.chargeWalletModal.save')}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        {t('dashboard.general.cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
};
