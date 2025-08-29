
import React, { useState } from 'react';
import type { Flight, AirlineInfo, AircraftInfo, FlightClassInfo, AirportInfo, CommissionModel, RefundPolicy, Booking, User, RolePermissions } from '@/types';
import { FlightsDashboard } from '@/components/admin/FlightsDashboard'; // Reusing the existing powerful component
import { useLocalization } from '@/hooks/useLocalization';

interface AffiliateFlightsProps {
    flights: Flight[];
    bookings: Booking[];
    users: User[];
    currentUser: User;
    rolePermissions: RolePermissions;
    airlines: AirlineInfo[];
    aircrafts: AircraftInfo[];
    flightClasses: FlightClassInfo[];
    airports: AirportInfo[];
    commissionModels: CommissionModel[];
    refundPolicies: RefundPolicy[];
    onCreateFlight: (flightData: Omit<Flight, 'id' | 'creatorId'>) => void;
    onUpdateFlight: (flight: Flight) => void;
    onDeleteFlight: (flightId: string) => void;
}

export const AffiliateFlights: React.FC<AffiliateFlightsProps> = (props) => {
    const { t } = useLocalization();

    return (
        <div>
            <div className="mb-4">
                <h2 className="text-2xl font-bold text-slate-800">{t('affiliate.sidebar.myFlights')}</h2>
            </div>
            {/* We can reuse the existing FlightsDashboard component as it has all the complex logic for creating/editing flights */}
            <FlightsDashboard
                flights={props.flights}
                bookings={props.bookings}
                users={props.users}
                currentUser={props.currentUser}
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
            />
        </div>
    );
};
