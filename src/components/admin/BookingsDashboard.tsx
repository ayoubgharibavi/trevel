
import React, { useState, useMemo } from 'react';
import type { Booking, AirportInfo, AirlineInfo, AircraftInfo, FlightClassInfo } from '@/types';
import { BookingStatus } from '@/types';
import { BookingDetailsModal } from './BookingDetailsModal';
import { useLocalization } from '@/hooks/useLocalization';

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

interface BookingsDashboardProps {
    bookings: Booking[];
    onUpdateBooking: (booking: Booking) => void;
    airports: AirportInfo[];
    airlines: AirlineInfo[];
    aircrafts: AircraftInfo[];
    flightClasses: FlightClassInfo[];
}

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

export const BookingsDashboard: React.FC<BookingsDashboardProps> = ({ bookings, onUpdateBooking, airports, airlines, aircrafts, flightClasses }) => {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState<string>('all');
    const { t, formatDate, language } = useLocalization();

    const handleUpdateAndClose = (booking: Booking) => {
        onUpdateBooking(booking);
        setSelectedBooking(booking);
    };
    
    const handleModalClose = () => {
        setSelectedBooking(null);
    }

    const filteredBookings = useMemo(() => {
        let filtered = bookings;
        
        // Filter by source
        if (sourceFilter !== 'all') {
            filtered = filtered.filter(booking => booking.source === sourceFilter);
        }
        
        // Filter by search term
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(booking => 
                booking.id.toLowerCase().includes(lowerCaseSearchTerm) ||
                booking.user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                booking.user.username.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }
        
        return filtered;
    }, [bookings, searchTerm, sourceFilter]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.bookings.title')}</h2>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        🔄 بروزرسانی
                    </button>
                    <select
                        value={sourceFilter}
                        onChange={e => setSourceFilter(e.target.value)}
                        className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                    >
                        <option value="all">{t('dashboard.bookings.allSources')}</option>
                        <option value="manual">{t('dashboard.bookings.manualBooking')}</option>
                        <option value="charter118">{t('dashboard.bookings.charter118')}</option>
                        <option value="sepehr">{t('dashboard.bookings.sepehr')}</option>
                    </select>
                    <input
                        type="text"
                        placeholder={t('dashboard.bookings.searchHint')}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.bookings.refNumber')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.bookings.user')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.bookings.flight')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.bookings.source')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.bookings.date')}</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.bookings.status')}</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('dashboard.general.actions')}</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                            <tr key={booking.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{booking.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {parseCityName(booking.flight.departureAirport?.city || booking.flight.departure?.city, language)} 
                                    &rarr; 
                                    {parseCityName(booking.flight.arrivalAirport?.city || booking.flight.arrival?.city, language)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        booking.source === 'manual' ? 'bg-blue-100 text-blue-800' :
                                        booking.source === 'charter118' ? 'bg-green-100 text-green-800' :
                                        booking.source === 'sepehr' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {booking.source === 'manual' ? t('dashboard.bookings.manualBooking') :
                                         booking.source === 'charter118' ? t('dashboard.bookings.charter118') :
                                         booking.source === 'sepehr' ? t('dashboard.bookings.sepehr') :
                                         booking.source || t('dashboard.bookings.unknown')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {booking.bookingDate && typeof booking.bookingDate === 'string' ? formatDate(booking.bookingDate) : 'نامشخص'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={booking.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                    <button onClick={() => setSelectedBooking(booking)} className="text-primary hover:text-purple-800">{t('dashboard.general.viewDetails')}</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                    {searchTerm ? t('dashboard.general.notFoundWithSearch') : t('dashboard.general.notFound')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedBooking && (
                <BookingDetailsModal 
                    booking={selectedBooking} 
                    onClose={handleModalClose} 
                    onUpdateBooking={handleUpdateAndClose}
                    airports={airports}
                    airlines={airlines}
                    aircrafts={aircrafts}
                    flightClasses={flightClasses}
                />
            )}
        </div>
    );
};
