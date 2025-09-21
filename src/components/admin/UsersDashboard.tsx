

import React, { useState } from 'react';
import type { User, CurrencyInfo, RolePermissions, Tenant } from '@/types';
import { UserStatus, UserRole, Currency } from '@/types';
import { UserDetailsModal } from './UserDetailsModal';
import { AddUserModal } from './AddUserModal';
import { ResetPasswordModal } from './ResetPasswordModal';
import { useLocalization } from '@/hooks/useLocalization';
import { EditIcon } from '@/components/icons/EditIcon';
import { KeyIcon } from '@/components/icons/KeyIcon';
import { ChargeWalletModal } from './ChargeWalletModal';
import { CreditCardIcon } from '@/components/icons/CreditCardIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';

interface UsersDashboardProps {
    users: User[];
    currentUser: User;
    currencies: CurrencyInfo[];
    tenants: Tenant[];
    rolePermissions: RolePermissions;
    onUpdateUser: (userId: string, name: string, role: UserRole, status: UserStatus, canBypassRateLimit: boolean, displayCurrencies: Currency[], tenantId?: string) => void;
    onCreateUser: (newUser: Omit<User, 'id' | 'wallet' | 'createdAt' | 'canBypassRateLimit'>) => void;
    onResetUserPassword: (userId: string, newPassword: string) => void;
    onChargeUserWallet: (userId: string, amount: number, currency: Currency, description: string) => void;
}

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const text = t(`dashboard.users.statusValues.${status}`) || t('dashboard.users.statusValues.UNKNOWN');
    const colorClasses: Record<UserStatus, string> = {
        ACTIVE: 'bg-green-100 text-green-800',
        SUSPENDED: 'bg-yellow-100 text-yellow-800',
    };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colorClasses[status] || 'bg-gray-100 text-gray-800'}`}>{text}</span>;
};

export const UsersDashboard: React.FC<UsersDashboardProps> = ({ users, currentUser, currencies, tenants, rolePermissions, onUpdateUser, onCreateUser, onResetUserPassword, onChargeUserWallet }) => {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [resettingUser, setResettingUser] = useState<User | null>(null);
    const [chargingUser, setChargingUser] = useState<User | null>(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const { t } = useLocalization();

    const handleUpdateAndClose = (userId: string, name: string, role: UserRole, status: UserStatus, canBypassRateLimit: boolean, displayCurrencies: Currency[], tenantId?: string) => {
        onUpdateUser(userId, name, role, status, canBypassRateLimit, displayCurrencies, tenantId);
        setEditingUser(null);
    }
    
    const handleResetAndClose = (userId: string, newPassword: string) => {
        onResetUserPassword(userId, newPassword);
        setResettingUser(null);
    };

    const handleChargeAndClose = (userId: string, amount: number, currency: Currency, description: string) => {
        onChargeUserWallet(userId, amount, currency, description);
        setChargingUser(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.users.title')}</h2>
                <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                    <PlusIcon className="w-5 h-5" />
                    <span>{t('dashboard.users.addUser')}</span>
                </button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.users.fullName')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.users.username')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.tenants.name')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.users.role')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.users.status')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('dashboard.general.actions')}</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => {
                            const userTenant = user.tenantId ? tenants.find(t => t.id === user.tenantId) : null;
                            return (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userTenant?.name || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t(`dashboard.users.roleValues.${user.role}`)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={user.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium space-x-2 space-x-reverse">
                                        <button onClick={() => setChargingUser(user)} className="p-2 text-slate-500 hover:text-green-600 rounded-full hover:bg-slate-100 transition" title={t('dashboard.users.chargeWallet')}>
                                            <CreditCardIcon className="w-5 h-5" />
                                        </button>
                                         <button 
                                            onClick={() => setResettingUser(user)} 
                                            disabled={user.id === currentUser.id}
                                            className="p-2 text-slate-500 hover:text-yellow-600 rounded-full hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                                            title={t('dashboard.users.resetPassword')}
                                        >
                                            <KeyIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setEditingUser(user)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100 transition" title={t('dashboard.users.manage')}>
                                            <EditIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            {editingUser && <UserDetailsModal user={editingUser} currentUser={currentUser} currencies={currencies} rolePermissions={rolePermissions} tenants={tenants} onClose={() => setEditingUser(null)} onUpdate={handleUpdateAndClose} />}
            {resettingUser && <ResetPasswordModal user={resettingUser} onClose={() => setResettingUser(null)} onSave={handleResetAndClose} />}
            {chargingUser && <ChargeWalletModal user={chargingUser} currencies={currencies} onClose={() => setChargingUser(null)} onSave={handleChargeAndClose} />}
            {isAddUserModalOpen && <AddUserModal tenants={tenants} onClose={() => setIsAddUserModalOpen(false)} onCreate={(newUser) => { onCreateUser(newUser); setIsAddUserModalOpen(false); }} />}
        </div>
    );
};