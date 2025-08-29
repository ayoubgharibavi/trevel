import type { Tenant } from '../types';

export const initialTenants: Tenant[] = [
    {
        id: 'tenant-1',
        name: 'Tehran Agency',
        logoUrl: 'https://i.pravatar.cc/40?u=tehranagency',
        primaryColor: '#800000', // Maroon
        status: 'ACTIVE',
    },
    {
        id: 'tenant-2',
        name: 'Shiraz Travels',
        logoUrl: 'https://i.pravatar.cc/40?u=shiraztravels',
        primaryColor: '#008080', // Teal
        status: 'ACTIVE',
    }
];
