

import React, { useState } from 'react';
import type { User, Booking, Ticket, CurrencyInfo, SavedPassenger, RefundPolicy } from '../types';
import { ProfileSidebar } from './ProfileSidebar';
import { WalletSection } from './profile/WalletSection';
import { MyBookingsSection } from './profile/MyBookingsSection';
import { MyProfileSection } from './profile/MyProfileSection';
import { MyTicketsSection } from './profile/MyTicketsSection';
import { SavedPassengersSection } from './profile/SavedPassengersSection';

interface ProfilePageProps {
    user: User;
    bookings: Booking[];
    tickets: Ticket[];
    currencies: CurrencyInfo[];
    refundPolicies: RefundPolicy[];
    onLogout: () => void;
    onCancelBooking: (bookingId: string) => void;
    onUpdateProfile: (updates: { name?: string; currentPassword?: string; newPassword?: string; }) => { success: boolean; message: string; };
    onCreateTicket: (subject: string, message: string, bookingId?: string) => void;
    onUserAddMessageToTicket: (ticketId: string, messageText: string) => void;
    onAddSavedPassenger: (passenger: Omit<SavedPassenger, 'id'>) => void;
    onUpdateSavedPassenger: (passenger: SavedPassenger) => void;
    onDeleteSavedPassenger: (passengerId: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
    user, bookings, tickets, currencies, refundPolicies, onLogout, onCancelBooking, 
    onUpdateProfile, onCreateTicket, onUserAddMessageToTicket,
    onAddSavedPassenger, onUpdateSavedPassenger, onDeleteSavedPassenger
}) => {
    const [activeSection, setActiveSection] = useState('profile');

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return <MyProfileSection user={user} onUpdateProfile={onUpdateProfile} />;
            case 'wallet':
                return <WalletSection wallet={user.wallet} currencies={currencies} />;
            case 'bookings':
                return <MyBookingsSection bookings={bookings} onCancelBooking={onCancelBooking} refundPolicies={refundPolicies} />;
            case 'tickets':
                return <MyTicketsSection tickets={tickets} userBookings={bookings} onCreateTicket={onCreateTicket} onAddMessage={onUserAddMessageToTicket} />;
            case 'savedPassengers':
                return <SavedPassengersSection 
                    passengers={user.savedPassengers || []}
                    onAdd={onAddSavedPassenger}
                    onUpdate={onUpdateSavedPassenger}
                    onDelete={onDeleteSavedPassenger}
                />;
            default:
                return <MyProfileSection user={user} onUpdateProfile={onUpdateProfile} />;
        }
    };

    return (
        <div className="bg-secondary">
            <div className="container mx-auto px-4 py-12">
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="lg:col-span-1 lg:sticky top-8">
                        <ProfileSidebar 
                            activeSection={activeSection}
                            onSelectSection={setActiveSection}
                            onLogout={onLogout}
                        />
                    </aside>
                    <main className="lg:col-span-3">
                        {renderSection()}
                    </main>
                </div>
            </div>
        </div>
    );
};