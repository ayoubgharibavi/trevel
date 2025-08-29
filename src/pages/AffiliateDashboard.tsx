

import React, { useState, useMemo } from 'react';
import type { User, Flight, Booking, AirlineInfo, AircraftInfo, FlightClassInfo, AirportInfo, CommissionModel, RefundPolicy, RolePermissions } from '../types';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AffiliateStats } from '../components/affiliate/AffiliateStats';
import { AffiliateFlights } from '../components/affiliate/AffiliateFlights';
import { AffiliateBookings } from '../components/affiliate/AffiliateBookings';
import { AffiliateAccounting } from '../components/affiliate/AffiliateAccounting';

interface AffiliateDashboardProps {
    user: User;
    allFlights: Flight[];
    bookings: Booking[];
    users: User[];
    airlines: AirlineInfo[];
    aircrafts: AircraftInfo[];
    flightClasses: FlightClassInfo[];
    airports: AirportInfo[];
    commissionModels: CommissionModel[];
    refundPolicies: RefundPolicy[];
    rolePermissions: RolePermissions;
    onCreateFlight: (flightData: Omit<Flight, 'id' | 'creatorId'>) => void;
    onUpdateFlight: (flight: Flight) => void;
    onDeleteFlight: (flightId: string) => void;
    onExitAdmin: () => void;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = (props) => {
    const [activeSection, setActiveSection] = useState('stats');

    const affiliateFlights = useMemo(() => {
        return props.allFlights.filter(f => f.creatorId === props.user.id);
    }, [props.allFlights, props.user.id]);
    
    const affiliateBookings = useMemo(() => {
        const affiliateFlightIds = new Set(affiliateFlights.map(f => f.id));
        return props.bookings.filter(b => affiliateFlightIds.has(b.flight.id));
    }, [props.bookings, affiliateFlights]);

    const renderContent = () => {
        switch (activeSection) {
            case 'flights':
                return <AffiliateFlights 
                    flights={affiliateFlights}
                    bookings={affiliateBookings}
                    users={props.users}
                    currentUser={props.user}
                    rolePermissions={props.rolePermissions}
                    airlines={props.airlines}
                    aircrafts={props.aircrafts}
                    flightClasses={props.flightClasses}
                    airports={props.airports}
                    commissionModels={props.commissionModels}
                    refundPolicies={props.refundPolicies}
                    onCreateFlight={props.onCreateFlight}
                    onUpdateFlight={props.onUpdateFlight}
                    onDeleteFlight={props.onDeleteFlight}
                />;
            case 'bookings':
                return <AffiliateBookings bookings={affiliateBookings} />;
            case 'accounting':
                return <AffiliateAccounting user={props.user} />;
            case 'stats':
            default:
                return <AffiliateStats user={props.user} bookings={affiliateBookings} />;
        }
    };

    return (
        <div className="bg-secondary">
            <div className="container mx-auto px-4 py-12">
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    <aside className="lg:col-span-1 lg:sticky top-8">
                        <AdminSidebar
                            activeSection={activeSection}
                            user={props.user}
                            rolePermissions={props.rolePermissions}
                            onSelectSection={setActiveSection}
                            onExitAdmin={props.onExitAdmin}
                        />
                    </aside>
                    <main className="lg:col-span-3 space-y-8">
                         {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};