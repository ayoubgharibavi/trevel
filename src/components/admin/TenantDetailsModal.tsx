import React, { useState, useEffect, useMemo } from 'react';
import type { Tenant, TenantStatus, User } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

interface TenantDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (tenant: Tenant | Omit<Tenant, 'id'>) => void;
    tenant: Tenant | null;
    users: User[];
}

const UserRow: React.FC<{ user: User }> = ({ user }) => {
    const { t } = useLocalization();
    return (
        <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-slate-100">
            <div>
                <span className="font-semibold text-slate-700">{user.name}</span>
                <span className="text-slate-500 font-mono text-xs mr-2">({user.username})</span>
            </div>
            <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                {t(`dashboard.users.roleValues.${user.role}`)}
            </span>
        </div>
    );
};


export const TenantDetailsModal: React.FC<TenantDetailsModalProps> = ({ isOpen, onClose, onSave, tenant, users }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Partial<Tenant>>({});

    useEffect(() => {
        if (tenant) {
            setFormData(tenant);
        } else {
            setFormData({ name: '', logoUrl: '', primaryColor: '#003366', status: 'ACTIVE' });
        }
    }, [tenant]);

    const tenantUsers = useMemo(() => {
        if (!tenant) return [];
        return users.filter(u => u.tenantId === tenant.id);
    }, [users, tenant]);


    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Tenant);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value }));
    };

    const isNew = !formData.id;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                 <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-primary">{isNew ? t('dashboard.tenants.modal.addTitle') : t('dashboard.tenants.modal.editTitle')}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">{t('dashboard.tenants.name')}</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">{t('dashboard.tenants.logoUrl')}</label>
                        <input type="text" name="logoUrl" value={formData.logoUrl || ''} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="https://..." />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">{t('dashboard.tenants.primaryColor')}</label>
                        <div className="flex items-center gap-2">
                           <input type="color" name="primaryColor" value={formData.primaryColor || '#003366'} onChange={handleChange} className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none" />
                           <input type="text" value={formData.primaryColor || '#003366'} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('dashboard.tenants.status')}</label>
                        <select name="status" value={formData.status || 'ACTIVE'} onChange={handleChange} className="mt-1 w-full p-2 border rounded bg-white">
                            <option value="ACTIVE">{t('dashboard.tenants.statusValues.ACTIVE')}</option>
                            <option value="INACTIVE">{t('dashboard.tenants.statusValues.INACTIVE')}</option>
                        </select>
                    </div>

                    {!isNew && tenantUsers.length > 0 && (
                        <div className="pt-4 border-t">
                            <h4 className="font-semibold text-slate-700 mb-2">{t('dashboard.tenants.modal.tenantUsers')}</h4>
                            <div className="space-y-1 p-2 bg-slate-50 rounded-md border">
                                {tenantUsers.map(user => <UserRow key={user.id} user={user} />)}
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('dashboard.general.save')}</button>
                </div>
            </form>
        </div>
    );
};