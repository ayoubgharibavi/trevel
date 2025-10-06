import React from 'react';
import SubTenantsPanel from './SubTenantsPanel';

interface TenantsDashboardProps {
    tenants: any[];
    users: any[];
    bookings: any[];
}

export const TenantsDashboard: React.FC<TenantsDashboardProps> = ({ tenants, users, bookings }) => {
    return <SubTenantsPanel />;
};