

import React, { useState } from 'react';
import type { Account } from '../../../types';
import { AccountType } from '../../../types';
import { useLocalization } from '../../../hooks/useLocalization';
import { PlusIcon } from '../../icons/PlusIcon';
import { AddAccountModal } from './AddAccountModal';

interface ChartOfAccountsListProps {
    accounts: Account[];
    onCreateAccount: (newAccount: Account) => boolean;
    onUpdateAccount: (updatedAccount: Account) => void;
}

export const ChartOfAccountsList: React.FC<ChartOfAccountsListProps> = ({ accounts, onCreateAccount, onUpdateAccount }) => {
    const { language, t } = useLocalization();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [parentAccount, setParentAccount] = useState<Account | null>(null);
    const [editingCell, setEditingCell] = useState<{ id: string, field: 'name' | 'type' } | null>(null);

    const handleOpenModal = (parent: Account | null) => {
        setParentAccount(parent);
        setIsModalOpen(true);
    };

    const handleUpdate = (account: Account, field: 'name' | 'type', value: any) => {
        if (field === 'name') {
            onUpdateAccount({ ...account, name: { ...account.name, [language]: value } });
        } else {
            onUpdateAccount({ ...account, type: value });
        }
        setEditingCell(null);
    };

    const renderAccountRow = (account: Account, level: number) => {
        const isParent = account.isParent;
        const padding = level * 20;

        const isEditingName = editingCell?.id === account.id && editingCell?.field === 'name';
        const isEditingType = editingCell?.id === account.id && editingCell?.field === 'type';
        const accountTypes = Object.values(AccountType);

        return (
            <tr key={account.id} className={isParent ? 'bg-slate-50' : 'hover:bg-slate-50/50'}>
                <td className="border p-2 whitespace-nowrap" style={{ paddingRight: `${padding + 12}px` }}>
                    <div className="flex items-center gap-2">
                         <span className={`font-mono ${isParent ? 'font-bold' : ''}`}>{account.id}</span>
                         {isParent && (
                            <button onClick={() => handleOpenModal(account)} className="p-1 rounded-full hover:bg-slate-200" title={`افزودن زیرمجموعه به ${account.name[language]}`}>
                                <PlusIcon className="w-4 h-4 text-slate-600"/>
                            </button>
                         )}
                    </div>
                </td>
                <td className="border p-0 whitespace-nowrap" onDoubleClick={() => !isParent && handleEditingCell(account, 'name')}>
                    {isEditingName ? (
                         <input 
                            type="text" 
                            defaultValue={account.name[language]} 
                            onBlur={(e) => handleUpdate(account, 'name', e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate(account, 'name', e.currentTarget.value);
                                if (e.key === 'Escape') setEditingCell(null);
                            }}
                            autoFocus
                            className="w-full h-full p-2 bg-yellow-100 outline-none"
                         />
                    ) : (
                         <div className={`p-2 ${isParent ? 'font-bold text-slate-800' : 'text-slate-700'}`}>{account.name[language]}</div>
                    )}
                </td>
                <td className="border p-0 whitespace-nowrap text-slate-600" onDoubleClick={() => !isParent && handleEditingCell(account, 'type')}>
                    {isEditingType ? (
                        <select
                            defaultValue={account.type}
                            onBlur={(e) => handleUpdate(account, 'type', e.target.value)}
                             onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdate(account, 'type', e.currentTarget.value);
                                if (e.key === 'Escape') setEditingCell(null);
                            }}
                            autoFocus
                            className="w-full h-full p-2 border-0 bg-yellow-100 outline-none"
                        >
                            {accountTypes.map(type => (
                                <option key={type} value={type}>{t(`accounting.coa.types.${type}`)}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="p-2">{t(`accounting.coa.types.${account.type}`)}</div>
                    )}
                </td>
            </tr>
        );
    };

    const handleEditingCell = (account: Account, field: 'name' | 'type') => {
        if (account.isParent) return; // Prevent editing parent accounts for simplicity
        setEditingCell({ id: account.id, field });
    };

    const renderAccounts = (parentId: string | null = null, level = 0) => {
        const children = accounts.filter(acc => acc.parent === parentId).sort((a, b) => a.id.localeCompare(b.id));
        return children.flatMap(acc => [
            renderAccountRow(acc, level),
            ...(acc.isParent ? renderAccounts(acc.id, level + 1) : [])
        ]);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-800">{t('accounting.coa.title')}</h3>
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('accounting.coa.addAccount')}</span>
                </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full border-collapse border border-slate-300 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2 text-right text-xs font-medium text-gray-500 uppercase">{t('accounting.coa.code')}</th>
                            <th className="border p-2 text-right text-xs font-medium text-gray-500 uppercase">{t('accounting.coa.name')}</th>
                            <th className="border p-2 text-right text-xs font-medium text-gray-500 uppercase">{t('accounting.coa.type')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {renderAccounts()}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3} className="p-2 text-xs text-slate-500 italic text-center border-t">
                                {t('accounting.coa.editHint')}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <AddAccountModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={onCreateAccount}
                accounts={accounts}
                parentAccount={parentAccount}
            />
        </div>
    );
};