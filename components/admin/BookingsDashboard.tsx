
import React, { useState, useMemo } from 'react';
import type { Booking, BookingStatus, AirportInfo, AirlineInfo, AircraftInfo, FlightClassInfo } from '../../types';
import { BookingDetailsModal } from './BookingDetailsModal';
import { useLocalization } from '../../hooks/useLocalization';

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
    const { t, formatDate } = useLocalization();

    const handleUpdateAndClose = (booking: Booking) => {
        onUpdateBooking(booking);
        setSelectedBooking(booking);
    };
    
    const handleModalClose = () => {
        setSelectedBooking(null);
    }

    const filteredBookings = useMemo(() => {
        if (!searchTerm) return bookings;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return bookings.filter(booking => 
            booking.id.toLowerCase().includes(lowerCaseSearchTerm) ||
            booking.user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            booking.user.username.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [bookings, searchTerm]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.bookings.title')}</h2>
                <div className="w-full sm:w-auto">
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.flight.departure.city} &rarr; {booking.flight.arrival.city}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(booking.bookingDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={booking.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                    <button onClick={() => setSelectedBooking(booking)} className="text-primary hover:text-purple-800">{t('dashboard.general.viewDetails')}</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
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
