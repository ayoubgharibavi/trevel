
import React, { useState, useEffect } from 'react';
import type { Account, LocalizedName, Language } from '@/types';
import { AccountType } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newAccount: Account) => boolean; // Returns success status
    accounts: Account[];
    parentAccount: Account | null;
}

const initialFormState: Account = {
    id: '',
    name: { fa: '', ar: '', en: '' },
    type: AccountType.Asset,
    parent: null,
    isParent: false,
};

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSave, accounts, parentAccount }) => {
    const { t, language } = useLocalization();
    const [formData, setFormData] = useState<Account>(initialFormState);

    useEffect(() => {
        if (isOpen) {
            if (parentAccount) {
                setFormData({
                    ...initialFormState,
                    parent: parentAccount.id,
                    type: parentAccount.type,
                });
            } else {
                setFormData({ ...initialFormState });
            }
        }
    }, [parentAccount, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onSave(formData);
        if (success) {
            onClose();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLocalizedChange = (lang: Language, value: string) => {
        setFormData(prev => ({
            ...prev,
            name: {
                ...(prev.name as LocalizedName),
                [lang]: value,
            },
        }));
    };

    const accountTypes = Object.values(AccountType);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-primary">{t('accounting.coa.modal.addTitle')}</h3>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('accounting.coa.modal.code')}</label>
                        <input
                            type="text"
                            name="id"
                            value={formData.id}
                            onChange={handleChange}
                            className="mt-1 w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('accounting.coa.modal.nameFa')}</label>
                        <input
                            type="text"
                            value={formData.name.fa}
                            onChange={(e) => handleLocalizedChange('fa', e.target.value)}
                            className="mt-1 w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('accounting.coa.modal.nameAr')}</label>
                        <input
                            type="text"
                            value={formData.name.ar}
                            onChange={(e) => handleLocalizedChange('ar', e.target.value)}
                            className="mt-1 w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('accounting.coa.modal.nameEn')}</label>
                        <input
                            type="text"
                            value={formData.name.en}
                            onChange={(e) => handleLocalizedChange('en', e.target.value)}
                            className="mt-1 w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">{t('accounting.coa.modal.type')}</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded bg-white"
                                disabled={!!parentAccount}
                            >
                                {accountTypes.map(type => (
                                    <option key={type} value={type}>{t(`accounting.coa.types.${type}`)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">{t('accounting.coa.modal.parent')}</label>
                            <select
                                name="parent"
                                value={formData.parent || ''}
                                onChange={handleChange}
                                className="mt-1 w-full p-2 border rounded bg-white"
                                disabled={!!parentAccount}
                            >
                                <option value="">{t('accounting.coa.modal.noParent')}</option>
                                {accounts.filter(acc => acc.isParent).map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.name[language]} ({acc.id})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isParent"
                                checked={formData.isParent}
                                onChange={handleChange}
                                className="form-checkbox h-4 w-4 text-primary"
                            />
                            <span className="ml-2 text-sm text-slate-700">{t('accounting.coa.modal.isParent')}</span>
                        </label>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('accounting.coa.modal.save')}</button>
                </div>
            </form>
        </div>
    );
};
