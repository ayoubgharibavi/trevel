import React, { useState, useEffect } from 'react';
import type { RolePermissions } from '@/types';
import { UserRole, Permission } from '@/types';
import { permissionDescriptions } from '@/utils/permissions';
import { useLocalization } from '@/hooks/useLocalization';
import { CheckIcon } from '../icons/CheckIcon';
import { AlertTriangleIcon } from '../icons/AlertTriangleIcon';

interface PermissionsDashboardProps {
    rolePermissions: RolePermissions;
    onUpdate: (newPermissions: RolePermissions) => void;
}

const editableRoles: UserRole[] = ['EDITOR', 'SUPPORT', 'AFFILIATE', 'ACCOUNTANT'];
const allPermissions = Object.values(Permission);

export const PermissionsDashboard: React.FC<PermissionsDashboardProps> = ({ rolePermissions, onUpdate }) => {
    const { t, language } = useLocalization();
    const [localPermissions, setLocalPermissions] = useState<RolePermissions>(rolePermissions);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        setLocalPermissions(rolePermissions);
    }, [rolePermissions]);

    const handlePermissionChange = (role: UserRole, permission: Permission, checked: boolean) => {
        setLocalPermissions(prev => {
            const currentPermissions = prev[role] || [];
            const newPermissions = checked
                ? [...currentPermissions, permission]
                : currentPermissions.filter(p => p !== permission);
            return { ...prev, [role]: [...new Set(newPermissions)] };
        });
    };

    const handleSave = () => {
        onUpdate(localPermissions);
        setFeedback(t('dashboard.permissions.saveSuccess'));
        setTimeout(() => setFeedback(''), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.permissions.title')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('dashboard.permissions.subtitle')}</p>
                </div>
                <button onClick={handleSave} className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition">
                    {t('dashboard.general.save')}
                </button>
            </div>

            {feedback && (
                <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm flex items-center gap-2">
                    <CheckIcon className="w-5 h-5" />
                    <span>{feedback}</span>
                </div>
            )}
            
             <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm flex items-center gap-2 border border-blue-200">
                <AlertTriangleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{t('dashboard.permissions.superAdminNote')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {editableRoles.map(role => (
                    <div key={role} className="border rounded-lg">
                        <h3 className="text-lg font-bold text-primary p-4 border-b bg-slate-50">
                            {t('dashboard.permissions.role')}: {t(`dashboard.users.roleValues.${role}`)}
                        </h3>
                        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                            {allPermissions.map(permission => (
                                <label key={permission} className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-slate-100">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-primary focus:ring-accent rounded"
                                        checked={localPermissions[role]?.includes(permission) || false}
                                        onChange={e => handlePermissionChange(role, permission, e.target.checked)}
                                    />
                                    <span className="text-sm text-slate-700">{permissionDescriptions[permission][language]}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
