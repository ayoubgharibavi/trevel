import React, { useMemo } from 'react';
import type { Flight, Booking, AircraftInfo } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';

interface FlightCapacityModalProps {
    isOpen: boolean;
    onClose: () => void;
    flight: Flight;
    bookings: Booking[];
    aircrafts: AircraftInfo[];
}

const InfoRow: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
        <span className="text-sm text-slate-600">{label}:</span>
        <span className="text-md font-bold text-slate-800">{value}</span>
    </div>
);

export const FlightCapacityModal: React.FC<FlightCapacityModalProps> = ({ isOpen, onClose, flight, bookings, aircrafts }) => {
    const { t, formatNumber, language } = useLocalization();

    const capacityData = useMemo(() => {
        const aircraft = aircrafts.find(a => a.name[language] === flight.aircraft || a.name['en'] === flight.aircraft || a.name['fa'] === flight.aircraft || a.name['ar'] === flight.aircraft);
        const totalCapacity = flight.totalCapacity || (aircraft ? aircraft.capacity : 0);
        
        const soldSeats = bookings
            .filter(b => b.flight.id === flight.id && b.status === 'CONFIRMED')
            .reduce((sum, b) => sum + b.passengers.adults.length + b.passengers.children.length + b.passengers.infants.length, 0);

        // In the form, `availableSeats` is set as "seats for sale".
        // The mock data doesn't update this value after booking.
        // So, `flight.availableSeats` effectively represents the initial number of seats for sale.
        const salesCapacity = flight.availableSeats;
        const remainingCapacity = salesCapacity - soldSeats;
        
        return { totalCapacity, salesCapacity, soldSeats, remainingCapacity };
    }, [flight, bookings, aircrafts, language]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="text-lg font-bold text-primary">{t('dashboard.flights.capacityReport.title')}</h3>
                    <p className="text-sm text-slate-500">{flight.flightNumber} ({flight.departure.city} &rarr; {flight.arrival.city})</p>
                </div>
                <div className="p-4 space-y-2">
                    <InfoRow label={t('dashboard.flights.capacityReport.totalCapacity')} value={formatNumber(capacityData.totalCapacity)} />
                    <InfoRow label={t('dashboard.flights.capacityReport.salesCapacity')} value={formatNumber(capacityData.salesCapacity)} />
                    <InfoRow label={t('dashboard.flights.capacityReport.soldCapacity')} value={formatNumber(capacityData.soldSeats)} />
                    <InfoRow label={t('dashboard.flights.capacityReport.remainingCapacity')} value={formatNumber(capacityData.remainingCapacity)} />
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-300">{t('dashboard.general.cancel')}</button>
                </div>
            </div>
        </div>
    );
};
