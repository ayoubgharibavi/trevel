
import React, { useState } from 'react';
import type { User, UserRole, UserStatus, Currency, CurrencyInfo, RolePermissions, Tenant } from '../../types';
import { Permission } from '../../types';
import { hasPermission, getPermissionsForRole, permissionDescriptions } from '../../utils/permissions';
import { useLocalization } from '../../hooks/useLocalization';


interface UserDetailsModalProps {
    user: User;
    currentUser: User;
    currencies: CurrencyInfo[];
    tenants: Tenant[];
    rolePermissions: RolePermissions;
    onClose: () => void;
    onUpdate: (userId: string, name: string, role: UserRole, status: UserStatus, canBypassRateLimit: boolean, displayCurrencies: Currency[], tenantId?: string) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, currentUser, currencies, tenants, rolePermissions, onClose, onUpdate }) => {
    const { t, language } = useLocalization();
    const [name, setName] = useState<string>(user.name);
    const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);
    const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user.status);
    const [selectedBypass, setSelectedBypass] = useState<boolean>(user.canBypassRateLimit);
    const [selectedCurrencies, setSelectedCurrencies] = useState<Currency[]>(user.displayCurrencies || []);
    const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(user.tenantId);

    const isSelfSuperAdmin = user.id === currentUser.id && user.role === 'SUPER_ADMIN';
    const canEditRole = hasPermission(currentUser.role, Permission.EDIT_USER_ROLE, rolePermissions);
    const canEditTenant = currentUser.role === 'SUPER_ADMIN';
    const canEditBypass = currentUser.role === 'SUPER_ADMIN';
    const displayedPermissions = getPermissionsForRole(selectedRole, rolePermissions);

    const handleCurrencyToggle = (currencyCode: Currency) => {
        setSelectedCurrencies(prev => 
            prev.includes(currencyCode)
                ? prev.filter(c => c !== currencyCode)
                : [...prev, currencyCode]
        );
    };

    const handleSave = () => {
        onUpdate(user.id, name, selectedRole, selectedStatus, selectedBypass, selectedCurrencies, selectedTenantId);
    };

    const userRoles: UserRole[] = ['USER', 'SUPPORT', 'EDITOR', 'SUPER_ADMIN', 'AFFILIATE', 'ACCOUNTANT'];
    const roleOptions = userRoles.map(role => ({
        value: role,
        label: t(`dashboard.users.roleValues.${role}`),
    }));

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:max-w-lg w-full"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-4 pt-5 pb-4 sm:p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl leading-6 font-bold text-primary">{t('dashboard.users.detailsModal.title')}</h3>
                            <p className="text-sm text-slate-500 mt-1">{user.name} (<span className="font-mono">{user.username}</span>)</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="bg-slate-50 p-3 rounded-md border text-sm">
                            <p><span className="font-semibold">{t('dashboard.users.detailsModal.email')}</span> {user.email}</p>
                        </div>
                        <div>
                           <label htmlFor="full-name" className="block text-sm font-medium text-slate-700">
                               {t('dashboard.users.fullName')}
                           </label>
                           <input
                               type="text"
                               id="full-name"
                               value={name}
                               onChange={(e) => setName(e.target.value)}
                               className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                               required
                           />
                       </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="role-select" className="block text-sm font-medium text-slate-700">
                                    {t('dashboard.users.detailsModal.role')}
                                </label>
                                <select
                                    id="role-select"
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                                    disabled={isSelfSuperAdmin || !canEditRole}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-white disabled:bg-gray-100"
                                >
                                    {roleOptions.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                                {isSelfSuperAdmin && <p className="mt-1 text-xs text-yellow-600">{t('dashboard.users.detailsModal.errors.cantChangeSelfRole')}</p>}
                                {!canEditRole && <p className="mt-1 text-xs text-yellow-600">{t('dashboard.users.detailsModal.errors.noAccessToChangeRole')}</p>}
                            </div>
                             <div>
                                <label htmlFor="tenant-select" className="block text-sm font-medium text-slate-700">
                                    {t('dashboard.tenants.name')}
                                </label>
                                <select
                                    id="tenant-select"
                                    value={selectedTenantId || ''}
                                    onChange={(e) => setSelectedTenantId(e.target.value)}
                                    disabled={!canEditTenant || user.role === 'SUPER_ADMIN'}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md bg-white disabled:bg-gray-100"
                                >
                                    <option value="">{t('dashboard.tenants.noTenant')}</option>
                                    {tenants.map(tenant => (
                                        <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                         <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded-md border">
                            <p className="font-semibold mb-1">{t('dashboard.users.detailsModal.permissionsForRole', t(`dashboard.users.roleValues.${selectedRole}` as any))}</p>
                            {displayedPermissions.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1">
                                    {displayedPermissions.map(p => (
                                        <li key={p}>{permissionDescriptions[p][language]}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{t('dashboard.users.detailsModal.noPermissions')}</p>
                            )}
                        </div>
                        
                        <div>
                            <span className="block text-sm font-medium text-slate-700">{t('dashboard.users.detailsModal.status')}</span>
                            <div className="mt-2 flex items-center space-x-4 space-x-reverse">
                                <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        value="ACTIVE" 
                                        checked={selectedStatus === 'ACTIVE'}
                                        onChange={(e) => setSelectedStatus(e.target.value as UserStatus)}
                                        disabled={isSelfSuperAdmin}
                                        className="form-radio text-primary focus:ring-accent"
                                    />
                                    <span className="mr-2">{t('dashboard.users.statusValues.ACTIVE')}</span>
                                </label>
                                 <label className="flex items-center">
                                    <input 
                                        type="radio" 
                                        value="SUSPENDED" 
                                        checked={selectedStatus === 'SUSPENDED'}
                                        onChange={(e) => setSelectedStatus(e.target.value as UserStatus)}
                                        disabled={isSelfSuperAdmin}
                                        className="form-radio text-primary focus:ring-accent"
                                    />
                                    <span className="mr-2">{t('dashboard.users.statusValues.SUSPENDED')}</span>
                                </label>
                            </div>
                            {isSelfSuperAdmin && <p className="mt-1 text-xs text-yellow-600">{t('dashboard.users.detailsModal.errors.cantChangeSelfStatus')}</p>}
                        </div>

                         <div>
                            <span className="block text-sm font-medium text-slate-700">{t('dashboard.users.detailsModal.specialAccess')}</span>
                            <div className="mt-2 p-3 border rounded-md bg-slate-50">
                                <label className="flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedBypass}
                                        onChange={(e) => setSelectedBypass(e.target.checked)}
                                        disabled={!canEditBypass}
                                        className="form-checkbox h-5 w-5 text-primary focus:ring-accent rounded disabled:opacity-50"
                                    />
                                    <span className="mr-3 text-sm text-slate-800">{t('dashboard.users.detailsModal.bypassRateLimit')}</span>
                                </label>
                                <p className="mt-1 text-xs text-slate-500 pr-8">
                                    {t('dashboard.users.detailsModal.bypassRateLimitDesc')}
                                </p>
                                {!canEditBypass && <p className="mt-1 text-xs text-yellow-600">{t('dashboard.users.detailsModal.errors.noAccessToChangeBypass')}</p>}
                            </div>
                        </div>
                        
                        <div>
                            <span className="block text-sm font-medium text-slate-700">{t('dashboard.users.detailsModal.displayCurrencies')}</span>
                             <p className="mt-1 text-xs text-slate-500">{t('dashboard.users.detailsModal.displayCurrenciesHelp')}</p>
                            <div className="mt-2 p-3 border rounded-md bg-slate-50 grid grid-cols-2 md:grid-cols-3 gap-2">
                                {currencies.filter(c => c.isActive).map(currency => (
                                    <label key={currency.id} className="flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedCurrencies.includes(currency.code)}
                                            onChange={() => handleCurrencyToggle(currency.code)}
                                            className="form-checkbox h-4 w-4 text-primary focus:ring-accent rounded"
                                        />
                                        <span className="mr-2 text-sm text-slate-800">
                                            {currency.name[language]} ({currency.code})
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                        type="button" 
                        onClick={handleSave}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {t('dashboard.users.detailsModal.saveChanges')}
                    </button>
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                        {t('dashboard.general.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};