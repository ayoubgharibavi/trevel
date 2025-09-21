import React, { useState, useEffect } from 'react';
import type { CommissionModel, Language, LocalizedName } from '@/types';
import { CommissionCalculationType } from '@/types';
import { EditIcon } from '@/components/icons/EditIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { useLocalization } from '@/hooks/useLocalization';

interface CommissionModelsManagerProps {
    models: CommissionModel[];
    onCreate: (data: Omit<CommissionModel, 'id'>) => void;
    onUpdate: (data: CommissionModel) => void;
    onDelete: (id: string) => void;
}

const DataModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CommissionModel | Omit<CommissionModel, 'id'>) => void;
    item: Partial<CommissionModel> | null;
}> = ({ isOpen, onClose, onSave, item }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Partial<CommissionModel>>({});

    useEffect(() => {
        if (!item) {
            setFormData({ calculationType: CommissionCalculationType.Percentage });
            return;
        }
        
        // Parse JSON strings back to objects for form editing
        const parsedItem = { ...item };
        if (typeof parsedItem.name === 'string') {
            try {
                parsedItem.name = JSON.parse(parsedItem.name);
            } catch {
                // If parsing fails, keep as string
            }
        }
        
        setFormData(parsedItem);
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as CommissionModel | Omit<CommissionModel, 'id'>);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleLocalizedChange = (lang: Language, value: string) => {
        setFormData(prev => ({
            ...prev,
            name: {
                ...(prev.name || { fa: '', ar: '', en: '' }),
                [lang]: value,
            }
        }));
    };

    const isNew = !formData.id;
    const isPercentage = formData.calculationType === CommissionCalculationType.Percentage;
    const amountLabel = isPercentage ? t('dashboard.commissionModels.modals.percentLabel') : t('dashboard.commissionModels.modals.amountLabel', t('placeholders.toman'));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <form className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-primary">{isNew ? t('dashboard.commissionModels.modals.addTitle') : t('dashboard.commissionModels.modals.editTitle')}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">نام مدل (فارسی)</label>
                        <input type="text" value={formData.name?.fa || ''} onChange={e => handleLocalizedChange('fa', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">نام مدل (عربی)</label>
                        <input type="text" value={formData.name?.ar || ''} onChange={e => handleLocalizedChange('ar', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Model Name (English)</label>
                        <input type="text" value={formData.name?.en || ''} onChange={e => handleLocalizedChange('en', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">نوع محاسبه</label>
                        <select name="calculationType" value={formData.calculationType} onChange={handleChange} className="mt-1 w-full p-2 border rounded bg-white">
                            <option value={CommissionCalculationType.Percentage}>{t('dashboard.commissionModels.calcTypes.PERCENTAGE')}</option>
                            <option value={CommissionCalculationType.FixedAmount}>{t('dashboard.commissionModels.calcTypes.FIXED_AMOUNT')}</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">کمیسیون چارترکننده ({amountLabel})</label>
                        <input type="number" step="0.1" name="charterCommission" value={formData.charterCommission || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">کمیسیون ایجادکننده ({amountLabel})</label>
                        <input type="number" step="0.1" name="creatorCommission" value={formData.creatorCommission || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">کمیسیون وب‌سرویس ({amountLabel})</label>
                        <input type="number" step="0.1" name="webServiceCommission" value={formData.webServiceCommission || 0} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('dashboard.general.save')}</button>
                </div>
            </form>
        </div>
    );
};

export const CommissionModelsManager: React.FC<CommissionModelsManagerProps> = ({ models, onCreate, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<CommissionModel | null>(null);
    const { language, t } = useLocalization();

    const handleOpenModal = (item: CommissionModel | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: CommissionModel | Omit<CommissionModel, 'id'>) => {
        if ('id' in data && data.id) {
            await onUpdate(data);
        } else {
            await onCreate(data as Omit<CommissionModel, 'id'>);
        }
        // Wait a bit for state to update before closing modal
        setTimeout(() => {
            handleCloseModal();
        }, 100);
    };
    
    const formatValue = (value: number, type: CommissionCalculationType) => {
        const currency = t('placeholders.toman');
        return type === CommissionCalculationType.Percentage ? `${value}%` : `${value.toLocaleString('fa-IR')} ${currency}`;
    };

    return (
        <div className="mt-4">
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('dashboard.commissionModels.addNew')}</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.commissionModels.name')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.commissionModels.calcType')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.commissionModels.charter')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.commissionModels.creator')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.commissionModels.webservice')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.general.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {models.map(model => {
                            // Parse name if it's a JSON string
                            const parsedName = typeof model.name === 'string' ? JSON.parse(model.name) : model.name;
                            return (
                            <tr key={model.id}>
                                <td className="px-6 py-4 font-medium">{parsedName[language] || parsedName['fa'] || parsedName['en'] || 'نامشخص'}</td>
                                <td className="px-6 py-4">{t(`dashboard.commissionModels.calcTypes.${model.calculationType.toUpperCase()}`)}</td>
                                <td className="px-6 py-4">{formatValue(model.charterCommission, model.calculationType)}</td>
                                <td className="px-6 py-4">{formatValue(model.creatorCommission, model.calculationType)}</td>
                                <td className="px-6 py-4">{formatValue(model.webServiceCommission, model.calculationType)}</td>
                                <td className="px-6 py-4 text-left space-x-2 space-x-reverse">
                                    <button onClick={() => handleOpenModal(model)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100"><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => onDelete(model.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><TrashIcon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                 </table>
            </div>
            <DataModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                item={editingItem}
            />
        </div>
    );
};