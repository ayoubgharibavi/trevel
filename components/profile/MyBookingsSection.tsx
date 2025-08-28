

import React, { useState, useMemo } from 'react';
import type { Booking, RefundPolicy } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { BookingCard } from './BookingCard';
import { ETicketModal } from './ETicketModal';
import { CancelBookingModal } from './CancelBookingModal';

interface MyBookingsSectionProps {
    bookings: Booking[];
    refundPolicies: RefundPolicy[];
    onCancelBooking: (bookingId: string) => void;
}

const TabButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
            isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
    >
        {label}
    </button>
);

export const MyBookingsSection: React.FC<MyBookingsSectionProps> = ({ bookings, refundPolicies, onCancelBooking }) => {
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedBookingForTicket, setSelectedBookingForTicket] = useState<Booking | null>(null);
    const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
    const { t } = useLocalization();

    const { upcomingBookings, pastBookings } = useMemo(() => {
        const now = new Date();
        const upcoming = bookings.filter(b => new Date(b.flight.departure.dateTime) >= now);
        const past = bookings.filter(b => new Date(b.flight.departure.dateTime) < now);
        return {
            upcomingBookings: upcoming.sort((a, b) => new Date(a.flight.departure.dateTime).getTime() - new Date(b.flight.departure.dateTime).getTime()),
            pastBookings: past.sort((a, b) => new Date(b.flight.departure.dateTime).getTime() - new Date(a.flight.departure.dateTime).getTime()),
        };
    }, [bookings]);

    const bookingsToShow = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
    const noBookingsMessage = activeTab === 'upcoming' ? t('profile.myBookings.noUpcoming') : t('profile.myBookings.noPast');

    const handleConfirmCancellation = () => {
        if (bookingToCancel) {
            onCancelBooking(bookingToCancel.id);
            setBookingToCancel(null);
        }
    };
    
    const policyForCancellation = bookingToCancel ? refundPolicies.find(p => p.id === bookingToCancel.flight.refundPolicyId) : undefined;

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{t('profile.myBookings.title')}</h2>
            <div className="flex items-center gap-2 mb-6">
                <TabButton label={t('profile.myBookings.upcoming')} isActive={activeTab === 'upcoming'} onClick={() => setActiveTab('upcoming')} />
                <TabButton label={t('profile.myBookings.past')} isActive={activeTab === 'past'} onClick={() => setActiveTab('past')} />
            </div>

            <div className="space-y-4">
                {bookingsToShow.length > 0 ? (
                    bookingsToShow.map(booking => (
                        <BookingCard 
                            key={booking.id}
                            booking={booking}
                            onViewTicket={() => setSelectedBookingForTicket(booking)}
                            onCancelBooking={() => setBookingToCancel(booking)}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>{noBookingsMessage}</p>
                    </div>
                )}
            </div>

            {selectedBookingForTicket && (
                <ETicketModal 
                    booking={selectedBookingForTicket}
                    onClose={() => setSelectedBookingForTicket(null)}
                />
            )}
            
            {bookingToCancel && policyForCancellation && (
                <CancelBookingModal
                    booking={bookingToCancel}
                    policy={policyForCancellation}
                    onClose={() => setBookingToCancel(null)}
                    onConfirm={handleConfirmCancellation}
                />
            )}
        </div>
    );
};