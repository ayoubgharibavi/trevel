import React, { useState } from 'react';
import type { WhatsAppBotConfig } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { sendWhatsAppMessage } from '../../services/whatsappService';

interface WhatsAppBotDashboardProps {
    config: WhatsAppBotConfig;
    onSave: (config: WhatsAppBotConfig) => void;
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

export const WhatsAppBotDashboard: React.FC<WhatsAppBotDashboardProps> = ({ config, onSave }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<WhatsAppBotConfig>(config);
    const [feedback, setFeedback] = useState('');
    const [testNumber, setTestNumber] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleToggle = (key: keyof WhatsAppBotConfig['notifyOn'], value: boolean) => {
        setFormData(prev => ({ ...prev, notifyOn: { ...prev.notifyOn, [key]: value } }));
    };

    const handleSave = () => {
        onSave(formData);
        setFeedback(t('dashboard.telegram.saveSuccess'));
        setTimeout(() => setFeedback(''), 3000);
    };

    const handleTestMessage = async () => {
        if (!testNumber) {
            alert('لطفا شماره تلفن تست را وارد کنید.');
            return;
        }
        const success = await sendWhatsAppMessage(formData, testNumber, "✅ این یک پیام تست از پرواز هوشمند از طریق واتس‌اپ است!");
        if (success) {
            alert(t('dashboard.telegram.testSuccess'));
        } else {
            alert(t('dashboard.telegram.testError'));
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.sidebar.whatsapp')}</h2>
                <p className="text-sm text-slate-500 mt-1">{t('dashboard.whatsapp.subtitle')}</p>
            </div>
            
            {feedback && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{feedback}</div>}

            <div className="space-y-6">
                <fieldset className="p-4 border rounded-lg space-y-4">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.telegram.config.title')}</legend>
                    <ToggleSwitch label={t('dashboard.whatsapp.config.enable')} checked={formData.isEnabled} onChange={c => setFormData(prev => ({ ...prev, isEnabled: c }))} />
                    <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700">{t('dashboard.whatsapp.config.apiKey')}</label>
                        <input type="password" id="apiKey" name="apiKey" value={formData.apiKey} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        <p className="text-xs text-slate-500 mt-1">{t('dashboard.whatsapp.config.apiKeyHelp')}</p>
                    </div>
                     <div>
                        <label htmlFor="phoneNumberId" className="block text-sm font-medium text-slate-700">{t('dashboard.whatsapp.config.phoneId')}</label>
                        <input type="text" id="phoneNumberId" name="phoneNumberId" value={formData.phoneNumberId} onChange={handleChange} className="mt-1 w-full p-2 border rounded" />
                        <p className="text-xs text-slate-500 mt-1">{t('dashboard.whatsapp.config.phoneIdHelp')}</p>
                    </div>
                </fieldset>

                <fieldset className="p-4 border rounded-lg space-y-3">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.telegram.events.title')}</legend>
                    <ToggleSwitch label={t('dashboard.whatsapp.events.bookingSuccess')} checked={formData.notifyOn.bookingSuccess} onChange={c => handleToggle('bookingSuccess', c)} />
                    <ToggleSwitch label={t('dashboard.whatsapp.events.flightChange')} checked={formData.notifyOn.flightChange} onChange={c => handleToggle('flightChange', c)} />
                </fieldset>
            </div>

            <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t">
                 <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="tel"
                        value={testNumber}
                        onChange={e => setTestNumber(e.target.value)}
                        placeholder="شماره تست با کد کشور (مثال: 98912...)"
                        className="p-2 border rounded text-sm w-full"
                    />
                    <button onClick={handleTestMessage} type="button" className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 transition whitespace-nowrap">{t('dashboard.telegram.config.test')}</button>
                </div>
                <button onClick={handleSave} type="button" className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-accent-hover transition w-full sm:w-auto">{t('dashboard.telegram.config.save')}</button>
            </div>
        </div>
    );
};
