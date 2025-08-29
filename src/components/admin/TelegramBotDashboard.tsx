import React, { useState } from 'react';
import type { TelegramBotConfig } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { sendTelegramMessage } from '@/services/telegramService';

interface TelegramBotDashboardProps {
    config: TelegramBotConfig;
    onSave: (config: TelegramBotConfig) => void;
}

const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border cursor-pointer">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
                type="checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
        </div>
        <style>{`.toggle-checkbox:checked { right: 0; border-color: #003366; } .toggle-checkbox:checked + .toggle-label { background-color: #003366; }`}</style>
    </label>
);

export const TelegramBotDashboard: React.FC<TelegramBotDashboardProps> = ({ config, onSave }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<TelegramBotConfig>(config);
    const [feedback, setFeedback] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleToggle = (key: keyof TelegramBotConfig['notifyOn'], value: boolean) => {
        setFormData(prev => ({ ...prev, notifyOn: { ...prev.notifyOn, [key]: value } }));
    };

    const handleSave = () => {
        onSave(formData);
        setFeedback(t('dashboard.telegram.saveSuccess'));
        setTimeout(() => setFeedback(''), 3000);
    };

    const handleTestMessage = async () => {
        const success = await sendTelegramMessage(formData, "✅ This is a test message from Smart Flight!");
        if (success) {
            alert(t('dashboard.telegram.testSuccess'));
        } else {
            alert(t('dashboard.telegram.testError'));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.telegram.title')}</h2>
                <p className="text-sm text-slate-500 mt-1">{t('dashboard.telegram.subtitle')}</p>
            </div>
            
            {feedback && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{feedback}</div>}

            <div className="space-y-6">
                <fieldset className="p-4 border rounded-lg space-y-4">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.telegram.config.title')}</legend>
                    <ToggleSwitch label={t('dashboard.telegram.config.enable')} checked={formData.isEnabled} onChange={c => setFormData(prev => ({ ...prev, isEnabled: c }))} />
                    <div>
                        <label htmlFor="botToken" className="block text-sm font-medium text-slate-700">{t('dashboard.telegram.config.token')}</label>
                        <input type="password" id="botToken" name="botToken" value={formData.botToken} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        <p className="text-xs text-slate-500 mt-1">{t('dashboard.telegram.config.tokenHelp')}</p>
                    </div>
                     <div>
                        <label htmlFor="chatId" className="block text-sm font-medium text-slate-700">{t('dashboard.telegram.config.chatId')}</label>
                        <input type="text" id="chatId" name="chatId" value={formData.chatId} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        <p className="text-xs text-slate-500 mt-1">{t('dashboard.telegram.config.chatIdHelp')}</p>
                    </div>
                </fieldset>

                <fieldset className="p-4 border rounded-lg space-y-3">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.telegram.events.title')}</legend>
                    <ToggleSwitch label={t('dashboard.telegram.events.newBooking')} checked={formData.notifyOn.newBooking} onChange={c => handleToggle('newBooking', c)} />
                    <ToggleSwitch label={t('dashboard.telegram.events.bookingCancellation')} checked={formData.notifyOn.bookingCancellation} onChange={c => handleToggle('bookingCancellation', c)} />
                    <ToggleSwitch label={t('dashboard.telegram.events.refundUpdate')} checked={formData.notifyOn.refundUpdate} onChange={c => handleToggle('refundUpdate', c)} />
                    <ToggleSwitch label={t('dashboard.telegram.events.newUser')} checked={formData.notifyOn.newUser} onChange={c => handleToggle('newUser', c)} />
                    <ToggleSwitch label={t('dashboard.telegram.events.newTicket')} checked={formData.notifyOn.newTicket} onChange={c => handleToggle('newTicket', c)} />
                </fieldset>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <button onClick={handleTestMessage} type="button" className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition">{t('dashboard.telegram.config.test')}</button>
                <button onClick={handleSave} type="button" className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition">{t('dashboard.telegram.config.save')}</button>
            </div>
        </div>
    );
};
