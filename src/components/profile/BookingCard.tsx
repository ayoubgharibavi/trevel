

import React from 'react';
import type { Booking } from '@/types';
import { BookingStatus } from '@/types';
import { useLocalization } from '@/hooks/useLocalization';
import { PlaneTakeoffIcon } from '@/components/icons/PlaneTakeoffIcon';
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon';

// Helper function to parse JSON city names and return appropriate language
const parseCityName = (cityData: string | undefined, language: string): string => {
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

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const baseClasses = "text-xs font-medium px-2.5 py-0.5 rounded-full";
    if (status === 'CONFIRMED') {
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{t('dashboard.bookings.statusValues.CONFIRMED')}</span>;
    }
    if (status === 'CANCELLED') {
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{t('dashboard.bookings.statusValues.CANCELLED')}</span>;
    }
     if (status === 'REFUNDED') {
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{t('dashboard.bookings.statusValues.REFUNDED')}</span>;
    }
    return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{t('dashboard.bookings.statusValues.UNKNOWN')}</span>;
};


interface BookingCardProps {
    booking: Booking;
    onViewTicket: () => void;
    onCancelBooking: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onViewTicket, onCancelBooking }) => {
    const { t, formatDate, language } = useLocalization();
    const isUpcoming = booking.flight?.departure?.dateTime ? new Date(booking.flight.departure.dateTime) >= new Date() : false;
    const isCancellable = isUpcoming && booking.status === 'CONFIRMED';
    
    return (
        <div className="border rounded-lg p-4 transition-shadow hover:shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <div className="flex items-center mb-2">
                        <span className="font-bold text-lg text-primary">{parseCityName(booking.flight?.departure?.city, language)}</span>
                        <ArrowLeftIcon className="w-5 h-5 mx-2 text-slate-400" />
                        <span className="font-bold text-lg text-primary">{parseCityName(booking.flight?.arrival?.city, language)}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                        <PlaneTakeoffIcon className="w-4 h-4 ml-2" />
                        <span>{booking.flight?.airline || 'نامشخص'} - {t('flightCard.flightNumber')} {booking.flight?.flightNumber || 'نامشخص'}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                        {t('flightSearch.departureDate')}: {booking.flight?.departure?.dateTime ? formatDate(booking.flight.departure.dateTime, { dateStyle: 'full' }) : 'نامشخص'}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <StatusBadge status={booking.status} />
                    <span className="text-xs text-slate-400 font-mono">{booking.id}</span>
                    {/* Source Badge */}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.source === 'manual' ? 'bg-blue-100 text-blue-800' :
                        booking.source === 'charter118' ? 'bg-green-100 text-green-800' :
                        booking.source === 'sepehr' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {booking.source === 'manual' ? 'ثبت دستی' :
                         booking.source === 'charter118' ? 'Charter118' :
                         booking.source === 'sepehr' ? 'سپهر' :
                         booking.source || 'نامشخص'}
                    </span>
                </div>
            </div>

            <div className="border-t mt-4 pt-3 flex flex-wrap items-center justify-end gap-2">
                 <button onClick={onViewTicket} className="bg-slate-100 text-slate-700 font-semibold py-1.5 px-3 rounded-md hover:bg-slate-200 transition text-sm">
                    {t('profile.myBookings.viewETicket')}
                </button>
                {isCancellable && (
                    <button onClick={onCancelBooking} className="bg-red-50 text-red-600 font-semibold py-1.5 px-3 rounded-md hover:bg-red-100 transition text-sm">
                        {t('profile.myBookings.cancelBooking')}
                    </button>
                )}
            </div>
        </div>
    );
};
