import React, { useState } from 'react';
import type { User } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon';

interface MyProfileSectionProps {
    user: User;
    onUpdateProfile: (updates: { name?: string; currentPassword?: string; newPassword?: string; }) => { success: boolean; message: string; };
}

const InfoRow: React.FC<{ label: string; value: string; isMono?: boolean }> = ({ label, value, isMono = false }) => (
    <div>
        <label className="text-sm font-medium text-slate-500">{label}</label>
        <p className={`text-lg text-slate-800 ${isMono ? 'font-mono' : ''}`}>{value}</p>
    </div>
);

const FeedbackMessage: React.FC<{ message: string; type: 'success' | 'error' }> = ({ message, type }) => {
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-50' : 'bg-red-50';
    const textColor = isSuccess ? 'text-green-700' : 'text-red-700';
    const icon = isSuccess ? <CheckIcon className="w-5 h-5" /> : <AlertTriangleIcon className="w-5 h-5" />;

    return (
        <div className={`p-3 rounded-md flex items-center gap-3 text-sm ${bgColor} ${textColor}`}>
            {icon}
            <span>{message}</span>
        </div>
    );
};

export const MyProfileSection: React.FC<MyProfileSectionProps> = ({ user, onUpdateProfile }) => {
    const { t } = useLocalization();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setFeedback({ message: t('profile.myProfile.passwordMismatch'), type: 'error' });
            return;
        }

        const result = onUpdateProfile({
            name: formData.name,
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        });

        setFeedback({
            message: result.message,
            type: result.success ? 'success' : 'error',
        });
        
        if (result.success) {
            setIsEditing(false);
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        }
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        setFormData({
            name: user.name,
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setFeedback(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{isEditing ? t('profile.myProfile.editTitle') : t('profile.myProfile.title')}</h2>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-800 transition">
                        {t('profile.myProfile.edit')}
                    </button>
                )}
            </div>

            {feedback && !isEditing && <div className="mb-4"><FeedbackMessage {...feedback} /></div>}

            {!isEditing ? (
                <div className="space-y-4">
                    <InfoRow label={t('profile.myProfile.fullName')} value={user.name} />
                    <InfoRow label={t('profile.myProfile.username')} value={user.username} isMono />
                    <InfoRow label={t('profile.myProfile.email')} value={user.email} />
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6">
                    {feedback && <FeedbackMessage {...feedback} />}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">{t('profile.myProfile.fullName')}</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" required />
                    </div>
                    
                    <div className="border-t pt-6 space-y-4">
                        <p className="text-sm text-slate-500">{t('profile.myProfile.changePasswordHelp', 'en', 'To change your password, fill in the fields below. Otherwise, leave them blank.')}</p>
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">{t('profile.myProfile.currentPassword')}</label>
                            <input type="password" id="currentPassword" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">{t('profile.myProfile.newPassword')}</label>
                            <input type="password" id="newPassword" name="newPassword" value={formData.newPassword} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">{t('profile.myProfile.confirmPassword')}</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md" />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={handleCancel} className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition">
                            {t('dashboard.general.cancel')}
                        </button>
                        <button type="submit" className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition">
                            {t('profile.myProfile.saveChanges')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};