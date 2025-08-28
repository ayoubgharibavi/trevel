
import React, { useState } from 'react';
import type { User } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface ResetPasswordModalProps {
    user: User;
    onClose: () => void;
    onSave: (userId: string, newPassword: string) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ user, onClose, onSave }) => {
    const { t } = useLocalization();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!newPassword) {
            setError(t('dashboard.users.resetPasswordModal.errors.passwordRequired'));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t('dashboard.users.resetPasswordModal.errors.passwordMismatch'));
            return;
        }
        
        onSave(user.id, newPassword);
    };

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
                            <h3 className="text-xl leading-6 font-bold text-primary">{t('dashboard.users.resetPasswordModal.title')}</h3>
                            <p className="text-sm text-slate-500 mt-1">{t('dashboard.users.resetPasswordModal.subtitle', user.name)}</p>
                        </div>
                        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">{t('dashboard.users.resetPasswordModal.newPassword')}</label>
                            <input
                                type="password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                required
                                minLength={8}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">{t('dashboard.users.resetPasswordModal.confirmPassword')}</label>
                            <input
                                type="password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                         {error && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm" role="alert">
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button 
                        type="submit" 
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-white hover:bg-accent-hover sm:ml-3 sm:w-auto sm:text-sm"
                    >
                        {t('dashboard.users.resetPasswordModal.save')}
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
