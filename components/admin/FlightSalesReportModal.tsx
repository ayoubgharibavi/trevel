
import React, { useMemo } from 'react';
import type { Flight, Booking, User } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface FlightSalesReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    flight: Flight | null;
    bookings: Booking[];
    users: User[];
}

export const FlightSalesReportModal: React.FC<FlightSalesReportModalProps> = ({ isOpen, onClose, flight, bookings, users }) => {
    const { t, formatNumber } = useLocalization();

    const salesData = useMemo(() => {
        if (!flight) return [];

        const relevantBookings = bookings.filter(b => b.flight.id === flight.id && b.status === 'CONFIRMED');
        
        const salesByUser: Record<string, { user: User; seatsSold: number }> = {};

        relevantBookings.forEach(booking => {
            const user = booking.user;
            if (user) {
                if (!salesByUser[user.id]) {
                    salesByUser[user.id] = { user, seatsSold: 0 };
                }
                salesByUser[user.id].seatsSold += booking.passengers.adults.length + booking.passengers.children.length + booking.passengers.infants.length;
            }
        });

        return Object.values(salesByUser).sort((a, b) => b.seatsSold - a.seatsSold);

    }, [flight, bookings]);

    if (!isOpen || !flight) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-primary">{t('dashboard.flights.salesReport.title')}</h3>
                    <p className="text-sm text-slate-500">{flight.flightNumber} ({flight.departure.city} &rarr; {flight.arrival.city})</p>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {salesData.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">{t('dashboard.flights.salesReport.agency')}</th>
                                    <th className="px-4 py-2 text-right font-medium text-gray-500 uppercase">{t('dashboard.flights.salesReport.seatsSold')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {salesData.map(({ user, seatsSold }) => (
                                    <tr key={user.id}>
                                        <td className="px-4 py-2 font-medium">{user.name} ({t(`dashboard.users.roleValues.${user.role}`)})</td>
                                        <td className="px-4 py-2 font-semibold">{formatNumber(seatsSold)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-slate-500 py-8">{t('dashboard.flights.salesReport.noSales')}</p>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                </div>
            </div>
        </div>
    );
};
