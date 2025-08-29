
import React, { useState } from 'react';
import type { User, Tenant } from '@/types';
import { UserRole, UserStatus } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

interface AddUserModalProps {
    tenants: Tenant[];
    onClose: () => void;
    onCreate: (newUser: Omit<User, 'id' | 'wallet' | 'createdAt' | 'canBypassRateLimit'>) => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ tenants, onClose, onCreate }) => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>('USER');
    const [status, setStatus] = useState<UserStatus>('ACTIVE');
    const [tenantId, setTenantId] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && username && email && password && tenantId) {
            onCreate({ name, username, email, password, role, status, tenantId });
        } else if (role === 'SUPER_ADMIN') {
             onCreate({ name, username, email, password, role, status });
        }
    };
    
    const userRoles: UserRole[] = ['USER', 'SUPPORT', 'EDITOR', 'SUPER_ADMIN', 'AFFILIATE', 'ACCOUNTANT'];
    const roleOptions = userRoles.map(r => ({
        value: r,
        label: t(`dashboard.users.roleValues.${r}`)
    }));

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
                            <h3 className="text-xl leading-6 font-bold text-primary">{t('dashboard.users.addModal.title')}</h3>
                            <p className="text-sm text-slate-500 mt-1">{t('dashboard.users.addModal.subtitle')}</p>
                        </div>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">{t('dashboard.users.fullName')}</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-700">{t('dashboard.users.username')}</label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700">{t('signup.email')}</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700">{t('signup.password')}</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                required
                                minLength={8}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="role-select-add" className="block text-sm font-medium text-slate-700">
                                    {t('dashboard.users.role')}
                                </label>
                                <select
                                    id="role-select-add"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-white"
                                >
                                    {roleOptions.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="tenant-select-add" className="block text-sm font-medium text-slate-700">
                                    {t('dashboard.tenants.name')}
                                </label>
                                <select
                                    id="tenant-select-add"
                                    value={tenantId}
                                    onChange={(e) => setTenantId(e.target.value)}
                                    disabled={role === 'SUPER_ADMIN'}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-white disabled:bg-gray-100"
                                    required={role !== 'SUPER_ADMIN'}
                                >
                                    <option value="">{t('dashboard.tenants.selectTenant')}</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <span className="block text-sm font-medium text-slate-700">{t('dashboard.users.status')}</span>
                            <div className="mt-2 flex items-center space-x-4 space-x-reverse">
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        value="ACTIVE" 
                                        checked={status === 'ACTIVE'}
                                        onChange={(e) => setStatus(e.target.value as UserStatus)}
                                        className="form-radio text-primary focus:ring-accent"
                                    />
                                    <span className="mr-2">{t('dashboard.users.statusValues.ACTIVE')}</span>
                                </label>
                                 <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        value="SUSPENDED" 
                                        checked={status === 'SUSPENDED'}
                                        onChange={(e) => setStatus(e.target.value as UserStatus)}
                                        className="form-radio text-primary focus:ring-accent"
                                    />
                                    <span className="mr-2">{t('dashboard.users.statusValues.SUSPENDED')}</span>
                                </label>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                        type="submit" 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {t('dashboard.users.addModal.saveUser')}
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