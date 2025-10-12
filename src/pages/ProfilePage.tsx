

import React, { useState } from 'react';
import type { User, Booking, Ticket, CurrencyInfo, SavedPassenger, RefundPolicy } from '../types';
import { ProfileSidebar } from '../components/ProfileSidebar';
import { WalletSection } from '../components/profile/WalletSection';
import { MyBookingsSection } from '../components/profile/MyBookingsSection';
import { MyProfileSection } from '../components/profile/MyProfileSection';
import { MyTicketsSection } from '../components/profile/MyTicketsSection';
import { SavedPassengersSection } from '../components/profile/SavedPassengersSection';

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
    onRefreshBookings?: () => void;
    onRefreshWallet?: () => void;
    onTestToken?: () => void;
    onForceLogout?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
    user, bookings, tickets, currencies, refundPolicies, onLogout, onCancelBooking, 
    onUpdateProfile, onCreateTicket, onUserAddMessageToTicket,
    onAddSavedPassenger, onUpdateSavedPassenger, onDeleteSavedPassenger, onRefreshBookings, onRefreshWallet, onTestToken, onForceLogout
}) => {
    const [activeSection, setActiveSection] = useState('profile');

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return <MyProfileSection user={user} onUpdateProfile={onUpdateProfile} />;
            case 'wallet':
                return (
                    <div>
                        {onRefreshWallet && (
                            <div className="mb-4">
                                <button
                                    onClick={onRefreshWallet}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    🔄 بروزرسانی کیف پول
                                </button>
                            </div>
                        )}
                        <WalletSection wallet={user.wallet} currencies={currencies} />
                    </div>
                );
            case 'bookings':
                return (
                    <div>
                        {onRefreshBookings && (
                            <div className="mb-4">
                                <button
                                    onClick={onRefreshBookings}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    🔄 بروزرسانی رزروها
                                </button>
                            </div>
                        )}
                        <MyBookingsSection bookings={bookings} onCancelBooking={onCancelBooking} refundPolicies={refundPolicies} />
                    </div>
                );
            case 'tickets':
                return <MyTicketsSection tickets={tickets} userBookings={bookings} onCreateTicket={onCreateTicket} onAddMessage={onUserAddMessageToTicket} />;
            case 'savedPassengers':
                return (
                    <div>
                        {onTestToken && (
                            <div className="mb-4">
                                <button
                                    onClick={onTestToken}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    🔍 تست توکن
                                </button>
                            </div>
                        )}
                        <SavedPassengersSection 
                            passengers={user.savedPassengers || []}
                            onAdd={onAddSavedPassenger}
                            onUpdate={onUpdateSavedPassenger}
                            onDelete={onDeleteSavedPassenger}
                        />
                    </div>
                );
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
