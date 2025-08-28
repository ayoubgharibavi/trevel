import React, { useState, useEffect } from 'react';
import type { RefundPolicy, RefundPolicyRule, Language, AirlineInfo } from '../../types';
import { PolicyType } from '../../types';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { useLocalization } from '../../hooks/useLocalization';

interface RefundPoliciesManagerProps {
    policies: RefundPolicy[];
    airlines: AirlineInfo[];
    onCreate: (data: Omit<RefundPolicy, 'id'>) => void;
    onUpdate: (data: RefundPolicy) => void;
    onDelete: (id: string) => void;
}

const DataModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: RefundPolicy | Omit<RefundPolicy, 'id'>) => void;
    item: Partial<RefundPolicy> | null;
    airlines: AirlineInfo[];
}> = ({ isOpen, onClose, onSave, item, airlines }) => {
    const { t, language } = useLocalization();
    const [formData, setFormData] = useState<Partial<RefundPolicy>>({});

    useEffect(() => {
        setFormData(item || { name: { fa: '', ar: '', en: '' }, rules: [], airlineId: '', policyType: undefined });
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as RefundPolicy);
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

    const handleRuleChange = (ruleId: string, field: 'hoursBeforeDeparture' | 'penaltyPercentage', value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return;

        setFormData(prev => ({
            ...prev,
            rules: prev.rules?.map(rule => 
                rule.id === ruleId ? { ...rule, [field]: numValue } : rule
            )
        }));
    };
    
    const handleAddRule = () => {
        const newRule: RefundPolicyRule = {
            id: `rule-${Date.now()}`,
            hoursBeforeDeparture: 24,
            penaltyPercentage: 10
        };
        setFormData(prev => ({ ...prev, rules: [...(prev.rules || []), newRule] }));
    };

    const handleDeleteRule = (ruleId: string) => {
        setFormData(prev => ({ ...prev, rules: prev.rules?.filter(rule => rule.id !== ruleId) }));
    };

    const isNew = !formData.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <form className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-primary">{isNew ? t('dashboard.refundPolicies.modals.addTitle') : t('dashboard.refundPolicies.modals.editTitle')}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <fieldset className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2">
                            <legend className="font-semibold text-slate-700">{t('dashboard.refundPolicies.modals.nameLabel')}</legend>
                            <input type="text" placeholder="فارسی" value={formData.name?.fa || ''} onChange={e => handleLocalizedChange('fa', e.target.value)} className="w-full p-2 border rounded mt-1" required />
                            <input type="text" placeholder="العربية" value={formData.name?.ar || ''} onChange={e => handleLocalizedChange('ar', e.target.value)} className="w-full p-2 border rounded mt-1" required />
                            <input type="text" placeholder="English" value={formData.name?.en || ''} onChange={e => handleLocalizedChange('en', e.target.value)} className="w-full p-2 border rounded mt-1" required />
                        </div>
                        <div>
                            <label htmlFor="airlineId" className="block text-sm font-medium text-slate-700">{t('dashboard.refundPolicies.modals.airlineLabel')}</label>
                            <select
                                id="airlineId"
                                value={formData.airlineId || ''}
                                onChange={e => setFormData(prev => ({ ...prev, airlineId: e.target.value || undefined }))}
                                className="mt-1 w-full p-2 border rounded bg-white"
                            >
                                <option value="">{t('dashboard.refundPolicies.generalPolicy')}</option>
                                {airlines.map(airline => (
                                    <option key={airline.id} value={airline.id}>{airline.name[language]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="policyType" className="block text-sm font-medium text-slate-700">{t('dashboard.refundPolicies.modals.policyTypeLabel')}</label>
                             <select
                                id="policyType"
                                value={formData.policyType || ''}
                                onChange={e => setFormData(prev => ({ ...prev, policyType: e.target.value ? e.target.value as PolicyType : undefined }))}
                                className="mt-1 w-full p-2 border rounded bg-white"
                            >
                                <option value="">{t('dashboard.refundPolicies.policyTypes.GENERAL')}</option>
                                <option value={PolicyType.Domestic}>{t('dashboard.refundPolicies.policyTypes.DOMESTIC')}</option>
                                <option value={PolicyType.International}>{t('dashboard.refundPolicies.policyTypes.INTERNATIONAL')}</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className="font-semibold text-slate-700 mb-2">{t('dashboard.refundPolicies.modals.rulesLabel')}</legend>
                        <div className="space-y-3">
                            {(formData.rules || []).sort((a,b) => a.hoursBeforeDeparture - b.hoursBeforeDeparture).map(rule => (
                                <div key={rule.id} className="p-3 border rounded-md bg-slate-50 flex items-center gap-4">
                                    <div className="flex-grow grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">{t('dashboard.refundPolicies.modals.hoursBeforeDeparture')}</label>
                                            <input type="number" value={rule.hoursBeforeDeparture} onChange={e => handleRuleChange(rule.id, 'hoursBeforeDeparture', e.target.value)} className="w-full p-1 border rounded text-sm"/>
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">{t('dashboard.refundPolicies.modals.penaltyPercentage')}</label>
                                            <input type="number" value={rule.penaltyPercentage} onChange={e => handleRuleChange(rule.id, 'penaltyPercentage', e.target.value)} className="w-full p-1 border rounded text-sm"/>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => handleDeleteRule(rule.id)} className="p-2 text-slate-500 hover:text-red-700 rounded-full hover:bg-slate-100 flex-shrink-0">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddRule} className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary hover:text-purple-800">
                             <PlusIcon className="w-4 h-4" />
                             <span>{t('dashboard.refundPolicies.modals.addRule')}</span>
                        </button>
                    </fieldset>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('dashboard.general.save')}</button>
                </div>
            </form>
        </div>
    );
};


export const RefundPoliciesManager: React.FC<RefundPoliciesManagerProps> = ({ policies, airlines, onCreate, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<RefundPolicy | null>(null);
    const { language, t } = useLocalization();

    const handleOpenModal = (item: RefundPolicy | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = (data: RefundPolicy | Omit<RefundPolicy, 'id'>) => {
        if ('id' in data && data.id) {
            onUpdate(data);
        } else {
            onCreate(data as Omit<RefundPolicy, 'id'>);
        }
        handleCloseModal();
    };

    return (
        <div className="mt-4">
            <div className="flex justify-end mb-4">
                <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('dashboard.refundPolicies.addNew')}</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.refundPolicies.name')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.refundPolicies.airline')}</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.refundPolicies.type')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.refundPolicies.rulesCount')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.general.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {policies.map(policy => {
                            const airlineName = policy.airlineId
                                ? airlines.find(a => a.id === policy.airlineId)?.name[language]
                                : t('dashboard.refundPolicies.generalPolicy');
                            
                            const policyType = policy.policyType 
                                ? t(`dashboard.refundPolicies.policyTypes.${policy.policyType}` as any)
                                : t('dashboard.refundPolicies.policyTypes.GENERAL');

                            return (
                                <tr key={policy.id}>
                                    <td className="px-6 py-4 font-medium">{policy.name[language]}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${policy.airlineId ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {airlineName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{policyType}</td>
                                    <td className="px-6 py-4">{policy.rules.length}</td>
                                    <td className="px-6 py-4 text-left space-x-2 space-x-reverse">
                                        <button onClick={() => handleOpenModal(policy)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onDelete(policy.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <DataModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    item={editingItem}
                    airlines={airlines}
                />
            )}
        </div>
    );
};