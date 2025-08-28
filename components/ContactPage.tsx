

import React from 'react';
import type { SiteContent } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { MapPinIcon } from './icons/MapPinIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { AtSignIcon } from './icons/AtSignIcon';


interface ContactPageProps {
    siteContent: SiteContent['contact'];
}

const ContactInfoItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-slate-800">{label}</h3>
            <p className="text-slate-600">{value}</p>
        </div>
    </div>
);

export const ContactPage: React.FC<ContactPageProps> = ({ siteContent }) => {
    const { t, language } = useLocalization();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert(t('contact.form.submitSuccess'));
        (e.target as HTMLFormElement).reset();
    };

    return (
        <div className="bg-secondary py-16">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold text-primary mb-4">{siteContent.title[language]}</h1>
                    <p className="text-lg text-slate-600">{siteContent.body[language]}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    <div className="bg-white p-8 rounded-lg shadow-md border space-y-8">
                        <ContactInfoItem icon={<MapPinIcon className="w-6 h-6" />} label={t('contact.address')} value={siteContent.address[language]} />
                        <ContactInfoItem icon={<PhoneIcon className="w-6 h-6" />} label={t('contact.phone')} value={siteContent.phone} />
                        <ContactInfoItem icon={<AtSignIcon className="w-6 h-6" />} label={t('contact.email')} value={siteContent.email} />
                    </div>
                    <div className="bg-white p-8 rounded-lg shadow-md border">
                         <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('contact.form.title')}</h2>
                         <form className="space-y-4" onSubmit={handleSubmit}>
                             <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">{t('signup.fullName')}</label>
                                <input type="text" id="name" className="w-full p-2 border rounded-md" required />
                             </div>
                             <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">{t('signup.email')}</label>
                                <input type="email" id="email" className="w-full p-2 border rounded-md" required />
                             </div>
                              <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">{t('profile.myTickets.createTicketModal.message')}</label>
                                <textarea id="message" rows={4} className="w-full p-2 border rounded-md" required />
                             </div>
                             <button type="submit" className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-hover transition">
                                {t('contact.form.submit')}
                             </button>
                         </form>
                    </div>
                </div>
                 <div className="mt-12">
                    <img src={siteContent.mapImageUrl} alt={t('contact.mapAlt')} className="w-full h-80 object-cover rounded-lg shadow-md border" />
                </div>
            </div>
        </div>
    );
};