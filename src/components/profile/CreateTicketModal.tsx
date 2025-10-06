
import React, { useState } from 'react';
import type { Booking } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';

// Helper function to parse JSON city names and return appropriate language
const parseCityName = (cityData: string | object | undefined, language: string): string => {
    if (!cityData) return 'نامشخص';
    
    try {
        // If it's already a string (not JSON), return as is
        if (typeof cityData === 'string' && !cityData.startsWith('{')) {
            return cityData;
        }
        
        // Parse JSON and return appropriate language
        const parsed = typeof cityData === 'string' ? JSON.parse(cityData) : cityData;
        
        // Map language codes to our supported languages
        const langMap: { [key: string]: string } = {
            'fa': 'fa',
            'en': 'en', 
            'ar': 'ar'
        };
        
        const targetLang = langMap[language] || 'fa';
        return parsed[targetLang] || parsed.fa || parsed.en || parsed.ar || 'نامشخص';
    } catch (error) {
        // If parsing fails, return the original string or default
        return typeof cityData === 'string' ? cityData : 'نامشخص';
    }
};

interface CreateTicketModalProps {
    userBookings: Booking[];
    onClose: () => void;
    onCreate: (subject: string, message: string, bookingId?: string) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ userBookings, onClose, onCreate }) => {
    const { t, language } = useLocalization();
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [bookingId, setBookingId] = useState<string | undefined>(undefined);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (subject && message) {
            onCreate(subject, message, bookingId);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-primary">{t('profile.myTickets.createTicketModal.title')}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="bookingId" className="block text-sm font-medium text-slate-700">{t('profile.myTickets.createTicketModal.relatedBooking')}</label>
                        <select
                            id="bookingId"
                            value={bookingId || ''}
                            onChange={(e) => setBookingId(e.target.value || undefined)}
                            className="mt-1 w-full p-2 border rounded bg-white"
                        >
                            <option value="">{t('profile.myTickets.createTicketModal.noBooking')}</option>
                            {userBookings.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.id} ({parseCityName(b.flight?.departure?.city, language)} &rarr; {parseCityName(b.flight?.arrival?.city, language)})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-slate-700">{t('profile.myTickets.createTicketModal.subject')}</label>
                        <input
                            type="text"
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 w-full p-2 border rounded"
                            placeholder={t('profile.myTickets.createTicketModal.subjectHint')}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-slate-700">{t('profile.myTickets.createTicketModal.message')}</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="mt-1 w-full p-2 border rounded"
                            placeholder={t('profile.myTickets.createTicketModal.messageHint')}
                            rows={5}
                            required
                        />
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('profile.myTickets.createTicketModal.submit')}</button>
                </div>
            </form>
        </div>
    );
};
