
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Flight, AirlineInfo, AircraftInfo, FlightClassInfo, AirportInfo, Language, SeatAllotment } from '@/types';
import { Permission, FlightSourcingType as FSTEnum, PolicyType, FlightStatus, CommissionModel, RefundPolicy, Booking, User, RolePermissions } from '@/types';
import { hasPermission } from '@/utils/permissions';
import { EditIcon } from '@/components/icons/EditIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { ToggleOnIcon } from '@/components/icons/ToggleOnIcon';
import { ToggleOffIcon } from '@/components/icons/ToggleOffIcon';
import { useLocalization } from '@/hooks/useLocalization';
import { ClipboardListIcon } from '@/components/icons/ClipboardListIcon';
import { FlightSalesReportModal } from './FlightSalesReportModal';
import { SearchableSelect } from '@/components/SearchableSelect';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { ChevronDownIcon } from '@/components/icons/ChevronDownIcon';
import { CurrencyTomanIcon } from '@/components/icons/CurrencyTomanIcon';
import { PlaneIcon } from '@/components/icons/PlaneIcon';
import { SeatIcon } from '@/components/icons/SeatIcon';
import { ChartBarIcon } from '@/components/icons/ChartBarIcon';
import { FlightCapacityModal } from './FlightCapacityModal';


interface FlightsDashboardProps {
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

const ActionsDropdown: React.FC<{
    flight: Flight;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onToggleStatus: () => void;
    onShowReport: () => void;
}> = ({ flight, canEdit, canDelete, onEdit, onDelete, onToggleStatus, onShowReport }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useLocalization();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        { label: t('dashboard.flights.actionsMenu.salesReport'), icon: <ClipboardListIcon className="w-4 h-4" />, action: onShowReport, condition: true },
        { label: t('dashboard.flights.actionsMenu.edit'), icon: <EditIcon className="w-4 h-4" />, action: onEdit, condition: canEdit },
        { label: t('dashboard.flights.actionsMenu.toggleStatus'), icon: flight.status === 'SCHEDULED' ? <ToggleOnIcon className="w-5 h-5 text-green-500" /> : <ToggleOffIcon className="w-5 h-5 text-slate-400" />, action: onToggleStatus, condition: canEdit },
        { label: t('dashboard.flights.actionsMenu.delete'), icon: <TrashIcon className="w-4 h-4" />, action: onDelete, condition: canDelete, isDestructive: true },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
            </button>
            {isOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        {menuItems.filter(item => item.condition).map(item => (
                            <button
                                key={item.label}
                                onClick={() => { item.action(); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-right ${item.isDestructive ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-100'}`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const FlightStats: React.FC<{ flights: Flight[], bookings: Booking[], aircrafts: AircraftInfo[] }> = ({ flights, bookings, aircrafts }) => {
    const { t, formatNumber } = useLocalization();
    const stats = useMemo(() => {
        const upcomingFlights = flights.filter(f => f && f.departure && f.departure.dateTime && new Date(f.departure.dateTime) >= new Date() && f.status === 'SCHEDULED');
        
        let totalSeats = 0;
        let totalSold = 0;
        let totalRevenue = 0;

        upcomingFlights.forEach(flight => {
            const aircraft = aircrafts.find(a => a.id === flight.aircraft);
            const capacity = flight.availableSeats || (aircraft ? aircraft.capacity : 0);
            const sold = bookings
                .filter(b => b.flight.id === flight.id && b.status === 'CONFIRMED')
                .reduce((sum, b) => {
                    if (!b.passengers) return sum;
                    return sum + (b.passengers.adults?.length || 0) + (b.passengers.children?.length || 0) + (b.passengers.infants?.length || 0);
                }, 0);
            
            totalSeats += capacity;
            totalSold += sold;
            totalRevenue += sold * (flight.price + flight.taxes);
        });

        const avgLoadFactor = totalSeats > 0 ? (totalSold / totalSeats) * 100 : 0;

        return {
            totalFlights: upcomingFlights.length,
            totalSeats,
            avgLoadFactor,
            totalRevenue,
        };
    }, [flights, bookings, aircrafts]);

    const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border flex items-center gap-4">
            <div className="bg-blue-100 text-primary p-3 rounded-full">{icon}</div>
            <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="text-xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title={t('dashboard.flights.stats.totalFlights')} value={formatNumber(stats.totalFlights)} icon={<PlaneIcon className="w-6 h-6"/>} />
            <StatCard title={t('dashboard.flights.stats.totalSeats')} value={formatNumber(stats.totalSeats)} icon={<SeatIcon className="w-6 h-6"/>} />
            <StatCard title={t('dashboard.flights.stats.avgLoadFactor')} value={`${stats.avgLoadFactor.toFixed(1)}%`} icon={<ChartBarIcon className="w-6 h-6"/>} />
            <StatCard title={t('dashboard.flights.stats.totalRevenue')} value={`${formatNumber(stats.totalRevenue / 10)} ${t('placeholders.toman')}`} icon={<CurrencyTomanIcon className="w-6 h-6"/>} />
        </div>
    );
};


interface FlightsListProps {
    flights: Flight[];
    bookings: Booking[];
    aircrafts: AircraftInfo[];
    airlines: AirlineInfo[];
    airports: AirportInfo[];
    currentUser: User;
    rolePermissions: RolePermissions;
    onAddNew: () => void;
    onEdit: (flight: Flight) => void;
    onDelete: (id: string) => void;
    onUpdateFlight: (flight: Flight) => void;
    onShowReport: (flight: Flight) => void;
    onShowCapacity: (flight: Flight) => void;
}

interface CreateFlightFormProps {
    flightToEdit: Flight | null;
    airlines: AirlineInfo[];
    aircrafts: AircraftInfo[];
    flightClasses: FlightClassInfo[];
    airports: AirportInfo[];
    commissionModels: CommissionModel[];
    refundPolicies: RefundPolicy[];
    users: User[];
    onSave: (flightData: Omit<Flight, 'id'> | Flight) => void;
    onCancel: () => void;
    language: Language;
}

const StatusBadge: React.FC<{ status: FlightStatus }> = ({ status }) => {
    const { t } = useLocalization();
    const styles: Record<FlightStatus, string> = {
        SCHEDULED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800',
        DELAYED: 'bg-yellow-100 text-yellow-800',
        DEPARTED: 'bg-blue-100 text-blue-800',
        ARRIVED: 'bg-gray-100 text-gray-800',
    };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[status]}`}>{t(`dashboard.flights.statusValues.${status}`)}</span>;
};


const FlightsList: React.FC<FlightsListProps> = ({ flights, bookings, aircrafts, airlines, airports, currentUser, rolePermissions, onAddNew, onEdit, onDelete, onUpdateFlight, onShowReport, onShowCapacity }) => {
    const { t, formatNumber, formatDate, language } = useLocalization();
    const handleToggleStatus = async (flight: Flight) => {
        try {
            const newStatus = flight.status === 'SCHEDULED' ? 'CANCELLED' : 'SCHEDULED';
            const updatedFlight = { ...flight, status: newStatus };
            
            // Call the update function
            await onUpdateFlight(updatedFlight);
            
            // Show success message
            console.log(`✅ Flight ${flight.flightNumber} status updated to ${newStatus}`);
        } catch (error) {
            console.error('❌ Error updating flight status:', error);
            // You could add a toast notification here
        }
    };

    const canCreate = hasPermission(currentUser.role, Permission.CREATE_FLIGHTS, rolePermissions) ||
                      (currentUser.role === 'AFFILIATE' && hasPermission(currentUser.role, Permission.CREATE_OWN_FLIGHTS, rolePermissions));

    const canEdit = (flight: Flight) => 
        hasPermission(currentUser.role, Permission.EDIT_FLIGHTS, rolePermissions) ||
        (currentUser.role === 'AFFILIATE' && hasPermission(currentUser.role, Permission.EDIT_OWN_FLIGHTS, rolePermissions) && flight.creatorId === currentUser.id);

    const canDelete = (flight: Flight) =>
        hasPermission(currentUser.role, Permission.DELETE_FLIGHTS, rolePermissions) ||
        (currentUser.role === 'AFFILIATE' && hasPermission(currentUser.role, Permission.DELETE_OWN_FLIGHTS, rolePermissions) && flight.creatorId === currentUser.id);

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.flights.flightNumber')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.flights.route')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.flights.headers.loadFactor')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.flights.headers.revenue')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('dashboard.flights.status')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.general.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {flights.length > 0 ? flights.filter((flight, index, self) => 
                            flight && flight.id && index === self.findIndex(f => f && f.id && f.id === flight.id)
                        ).map(flight => {
                            const aircraft = aircrafts.find(a => a.id === flight.aircraft);
                            const availableCapacity = flight.availableSeats || (aircraft ? aircraft.capacity : 0);
                            const soldSeats = bookings
                                .filter(b => b.flight.id === flight.id && b.status === 'CONFIRMED')
                                .reduce((sum, b) => {
                                    if (!b.passengers) return sum;
                                    return sum + (b.passengers.adults?.length || 0) + (b.passengers.children?.length || 0) + (b.passengers.infants?.length || 0);
                                }, 0);
                            const loadFactor = availableCapacity > 0 ? (soldSeats / availableCapacity) * 100 : 0;
                            const revenue = soldSeats * (flight.price + flight.taxes);

                            return (
                                <tr key={flight.id}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-slate-800">
                                            {airlines.find(a => a.id === flight.airline)?.name[language] || flight.airline}
                                        </div>
                                        <div className="font-mono text-slate-500 text-xs">{flight.flightNumber}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-700">
                                        {(() => {
                                            const departureAirport = airports.find(a => a.iata === flight.departure?.airportCode);
                                            const arrivalAirport = airports.find(a => a.iata === flight.arrival?.airportCode);
                                            const departureCity = departureAirport?.city[language] || flight.departure?.city || 'نامشخص';
                                            const arrivalCity = arrivalAirport?.city[language] || flight.arrival?.city || 'نامشخص';
                                            return `${departureCity} ← ${arrivalCity}`;
                                        })()}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <button type="button" onClick={() => onShowCapacity(flight)} className="text-right hover:bg-slate-50 p-1 rounded-md transition-colors w-full">
                                            <div className="flex items-center">
                                                <div className="w-24 bg-slate-200 rounded-full h-2.5">
                                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${loadFactor}%` }}></div>
                                                </div>
                                                <span className="mr-2 font-semibold">{loadFactor.toFixed(1)}%</span>
                                            </div>
                                            <span className="text-xs text-slate-500">({formatNumber(soldSeats)}/{formatNumber(availableCapacity)})</span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap font-semibold font-mono text-slate-800">{formatNumber(revenue / 10)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap"><StatusBadge status={flight.status} /></td>
                                    <td className="px-4 py-4 whitespace-nowrap text-left">
                                         <ActionsDropdown
                                            flight={flight}
                                            canEdit={canEdit(flight)}
                                            canDelete={canDelete(flight)}
                                            onEdit={() => onEdit(flight)}
                                            onDelete={() => onDelete(flight.id)}
                                            onToggleStatus={() => handleToggleStatus(flight)}
                                            onShowReport={() => onShowReport(flight)}
                                        />
                                    </td>
                                </tr>
                            )
                        }) : (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-slate-500">{t('dashboard.flights.noFlights')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

const CreateFlightForm: React.FC<CreateFlightFormProps> = ({ flightToEdit, airlines, aircrafts, flightClasses, airports, commissionModels, refundPolicies, users, onSave, onCancel, language }) => {
    const { t } = useLocalization();
    const initialFormState: Omit<Flight, 'id'> = {
        airline: '', airlineLogoUrl: '', flightNumber: '',
        departure: { airportCode: '', airportName: '', city: '', dateTime: '' },
        arrival: { airportCode: '', airportName: '', city: '', dateTime: '' },
        duration: '', stops: 0, price: 0, taxes: 0, flightClass: '', aircraft: '',
        availableSeats: 100, totalCapacity: 100, baggageAllowance: '', status: 'SCHEDULED' as FlightStatus,
        bookingClosesBeforeDepartureHours: 3,
        sourcingType: FSTEnum.Charter,
        commissionModelId: undefined,
        refundPolicyId: undefined,
        allotments: [],
        tenantId: '',
    };

    const [formData, setFormData] = useState<Omit<Flight, 'id'> | Flight>(initialFormState);

    useEffect(() => {
        const initialData = flightToEdit ? { ...flightToEdit, allotments: flightToEdit.allotments || [] } : { ...initialFormState, allotments: [] };
        setFormData(initialData);
    }, [flightToEdit]);
    
    const toDateTimeLocal = (isoString: string | undefined) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Convert to local time by adding timezone offset
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return localDate.toISOString().slice(0, 16);
    };

    const fromDateTimeLocal = (localString: string) => {
        if (!localString) return new Date().toISOString();
        // Convert from local time to UTC
        const localDate = new Date(localString);
        const utcDate = new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000));
        return utcDate.toISOString();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let finalValue = value;
        
        if (type === 'number') {
            finalValue = parseFloat(value) || 0;
        } else if (name === 'duration') {
            // Keep duration as string for frontend display, will be converted to number in transformFlightDataForBackend
            finalValue = value;
        }
        
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleEndpointChange = (endpoint: 'departure' | 'arrival', field: string, value: string) => {
        setFormData(prev => ({ ...prev, [endpoint]: { ...prev[endpoint], [field]: value } }));
    };

    const handleAirportChange = (endpoint: 'departure' | 'arrival', iata: string) => {
        const airport = airports.find(a => a.iata === iata);
        if (airport) {
            setFormData(prev => ({ 
                ...prev, 
                [endpoint]: { 
                    ...(prev[endpoint] as object), 
                    city: airport.city[language], 
                    airportCode: airport.iata, 
                    airportName: airport.name[language] 
                } 
            }));
            console.log(`✅ ${endpoint} airport selected:`, { iata, city: airport.city[language] });
        } else {
            console.error(`❌ Airport not found for IATA: ${iata}`);
        }
    };
    
    const handleAirlineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const airlineId = e.target.value;
        const selectedAirline = airlines.find(a => a.id === airlineId);
        if (selectedAirline) {
            setFormData(prev => ({...prev, airline: selectedAirline.id, airlineLogoUrl: selectedAirline.logoUrl, refundPolicyId: '' }));
        }
    };
    
    const handleAircraftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const aircraftId = e.target.value;
        const selectedAircraft = aircrafts.find(a => a.id === aircraftId);
        setFormData(prev => ({
            ...prev,
            aircraft: aircraftId,
            totalCapacity: selectedAircraft ? selectedAircraft.capacity : 0,
            availableSeats: selectedAircraft ? selectedAircraft.capacity : 0,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📝 Form submitted with data:', formData);
        onSave(formData as Flight);
    };
    
    const selectedAirline = airlines.find(a => a.id === formData.airline);
    
    const isDomestic = useMemo(() => {
        const fromAirport = airports.find(a => a.iata === formData.departure?.airportCode);
        const toAirport = airports.find(a => a.iata === formData.arrival?.airportCode);
        if (!fromAirport || !toAirport) return undefined;
        return fromAirport.country.en === toAirport.country.en;
    }, [formData.departure?.airportCode, formData.arrival?.airportCode, airports]);

    const availablePolicies = useMemo(() => {
        return refundPolicies.filter(p => {
            const airlineMatch = !p.airlineId || p.airlineId === selectedAirline?.id;
            const typeMatch = isDomestic === undefined || !p.policyType || (isDomestic && p.policyType === PolicyType.Domestic) || (!isDomestic && p.policyType === PolicyType.International);
            return airlineMatch && typeMatch;
        });
    }, [refundPolicies, selectedAirline, isDomestic]);

    useEffect(() => {
        if (formData.refundPolicyId && !availablePolicies.some(p => p.id === formData.refundPolicyId)) {
            setFormData(prev => ({ ...prev, refundPolicyId: '' }));
        }
    }, [availablePolicies, formData.refundPolicyId]);
    
    const selectedPolicy = availablePolicies.find(p => p.id === formData.refundPolicyId);

    const affiliates = useMemo(() => users.filter(u => u.role === 'AFFILIATE'), [users]);

    const handleAddAllotment = () => {
        const newAllotment: SeatAllotment = {
            id: `allot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            agentId: '',
            seats: 0,
            expiresAt: '',
        };
        setFormData(prev => ({ ...prev, allotments: [...(prev.allotments || []), newAllotment] }));
    };

    const handleAllotmentChange = (id: string, field: keyof Omit<SeatAllotment, 'id'>, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            allotments: (prev.allotments || []).map(a => a.id === id ? { ...a, [field]: value } : a)
        }));
    };

    const handleRemoveAllotment = (id: string) => {
        setFormData(prev => ({ ...prev, allotments: (prev.allotments || []).filter(a => a.id !== id) }));
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">{flightToEdit ? t('dashboard.flights.form.editTitle', flightToEdit.flightNumber) : t('dashboard.flights.form.createTitle')}</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border p-4 rounded-lg">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.flights.form.mainInfo')}</legend>
                    <select name="airline" value={formData.airline} onChange={handleAirlineChange} className="w-full p-2 border rounded bg-white" required>
                        <option value="" disabled>{t('dashboard.flights.form.airline')}</option>
                        {airlines.map(a => <option key={a.id} value={a.id}>{a.name[language]}</option>)}
                    </select>
                    <input type="text" name="flightNumber" placeholder={t('dashboard.flights.flightNumber')} value={formData.flightNumber || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <select name="aircraft" value={formData.aircraft} onChange={handleAircraftChange} className="w-full p-2 border rounded bg-white" required>
                        <option value="" disabled>{t('dashboard.flights.form.aircraft')}</option>
                        {aircrafts.map(a => <option key={a.id} value={a.id}>{a.name[language]}</option>)}
                    </select>
                    <select name="flightClass" value={formData.flightClass} onChange={handleChange} className="w-full p-2 border rounded bg-white" required>
                        <option value="" disabled>{t('dashboard.flights.form.flightClass')}</option>
                        {flightClasses.map(fc => <option key={fc.id} value={fc.id}>{fc.name[language]}</option>)}
                    </select>
                </fieldset>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <fieldset className="space-y-4 border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-primary">{t('dashboard.flights.form.departure')}</legend>
                        <select value={formData.departure?.airportCode || ''} onChange={e => handleAirportChange('departure', e.target.value)} className="w-full p-2 border rounded bg-white" required>
                            <option value="" disabled>{t('dashboard.flights.form.select')}</option>
                            {airports.map(a => <option key={a.id} value={a.iata}>{a.city[language]} ({a.iata})</option>)}
                        </select>
                        <input type="datetime-local" value={toDateTimeLocal(formData.departure?.dateTime)} onChange={e => handleEndpointChange('departure', 'dateTime', fromDateTimeLocal(e.target.value))} className="w-full p-2 border rounded" required />
                    </fieldset>

                    <fieldset className="space-y-4 border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-primary">{t('dashboard.flights.form.arrival')}</legend>
                        <select value={formData.arrival?.airportCode || ''} onChange={e => handleAirportChange('arrival', e.target.value)} className="w-full p-2 border rounded bg-white" required>
                            <option value="" disabled>{t('dashboard.flights.form.select')}</option>
                            {airports.map(a => <option key={a.id} value={a.iata}>{a.city[language]} ({a.iata})</option>)}
                        </select>
                        <input type="datetime-local" value={toDateTimeLocal(formData.arrival?.dateTime)} onChange={e => handleEndpointChange('arrival', 'dateTime', fromDateTimeLocal(e.target.value))} className="w-full p-2 border rounded" required />
                    </fieldset>
                </div>

                <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.flights.form.priceAndCapacity')}</legend>
                     <div>
                        <label className="text-xs">{t('dashboard.flights.form.totalCapacity')}</label>
                        <input type="number" name="totalCapacity" placeholder={t('dashboard.flights.form.totalCapacity')} value={formData.totalCapacity || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="text-xs">{t('dashboard.manualBooking.seatsForSale')}</label>
                        <input type="number" name="availableSeats" placeholder={t('dashboard.manualBooking.seatsForSale')} value={formData.availableSeats || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="text-xs">{t('dashboard.flights.form.basePrice')}</label>
                        <input type="number" name="price" placeholder={t('dashboard.flights.form.basePrice')} value={formData.price || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="text-xs">{t('dashboard.flights.form.taxes')}</label>
                        <input type="number" name="taxes" placeholder={t('dashboard.flights.form.taxes')} value={formData.taxes || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="text-xs">{t('dashboard.flights.form.duration')}</label>
                        <input type="text" name="duration" placeholder={t('dashboard.flights.form.durationHint')} value={formData.duration || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="text-xs">{t('flightCard.baggageAllowance')}</label>
                        <input type="text" name="baggageAllowance" placeholder={t('dashboard.flights.form.baggageHint')} value={formData.baggageAllowance || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    </div>
                </fieldset>

                 <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg">
                    <legend className="px-2 font-semibold text-primary">تنظیمات</legend>
                    <select name="sourcingType" value={formData.sourcingType} onChange={handleChange} className="w-full p-2 border rounded bg-white" required>
                        {Object.values(FSTEnum).map(type => <option key={type} value={type}>{t(`dashboard.flights.form.sourcingTypes.${type}`)}</option>)}
                    </select>
                    <select name="commissionModelId" value={formData.commissionModelId || ''} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                        <option value="">{t('dashboard.flights.form.commissionModel')}</option>
                        {commissionModels.map(m => <option key={m.id} value={m.id}>{m.name[language]}</option>)}
                    </select>
                     <select name="refundPolicyId" value={formData.refundPolicyId || ''} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                        <option value="">{t('dashboard.flights.form.refundPolicy')}</option>
                        {availablePolicies.map(p => <option key={p.id} value={p.id}>{p.name[language]}</option>)}
                    </select>
                    {selectedPolicy && (
                        <div className="lg:col-span-3 text-xs bg-slate-50 p-2 rounded-md border text-slate-600">
                            <p className="font-semibold">{t('dashboard.flights.form.selectedPolicyRules')}</p>
                            {selectedPolicy.rules && Array.isArray(selectedPolicy.rules) && selectedPolicy.rules.length > 0 ? (
                                 <ul className="list-disc list-inside space-y-1">
                                    {selectedPolicy.rules.sort((a,b) => b.hoursBeforeDeparture - a.hoursBeforeDeparture).map(rule => (
                                        <li key={rule.id}>{t('profile.myBookings.cancelModal.policyRule', rule.hoursBeforeDeparture, rule.penaltyPercentage)}</li>
                                    ))}
                                </ul>
                            ) : (<p>{t('dashboard.flights.form.noRulesInPolicy')}</p>)}
                        </div>
                    )}
                </fieldset>
                
                 {formData.sourcingType === FSTEnum.Charter && (
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 font-semibold text-primary">{t('dashboard.flights.form.agencyAllotments')}</legend>
                         {(formData.allotments || []).map(allotment => (
                            <div key={allotment.id} className="flex items-end gap-2 p-2 border rounded mb-2">
                                <SearchableSelect
                                    placeholder={t('dashboard.flights.form.agency')}
                                    options={affiliates.map(u => ({ value: u.id, label: u.name }))}
                                    value={allotment.agentId}
                                    onChange={value => handleAllotmentChange(allotment.id, 'agentId', value)}
                                />
                                <input type="number" placeholder={t('dashboard.flights.form.seats')} value={allotment.seats} onChange={e => handleAllotmentChange(allotment.id, 'seats', Number(e.target.value))} className="w-full p-2 border rounded" />
                                <input type="datetime-local" placeholder={t('dashboard.flights.form.deadline')} value={toDateTimeLocal(allotment.expiresAt)} onChange={e => handleAllotmentChange(allotment.id, 'expiresAt', fromDateTimeLocal(e.target.value))} className="w-full p-2 border rounded" />
                                <button type="button" onClick={() => handleRemoveAllotment(allotment.id)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddAllotment} className="mt-2 text-sm font-semibold text-primary flex items-center gap-1"><PlusIcon className="w-4 h-4" /> {t('dashboard.flights.form.addAllotment')}</button>
                    </fieldset>
                )}


                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button type="button" onClick={onCancel} className="bg-slate-100 text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-200 transition">{t('dashboard.flights.form.backToList')}</button>
                    <button type="submit" className="bg-accent text-white font-bold py-2 px-8 rounded-lg hover:bg-accent-hover transition">{t('dashboard.flights.form.saveFlight')}</button>
                </div>
            </form>
        </div>
    );
};

export const FlightsDashboard: React.FC<FlightsDashboardProps> = ({ flights, bookings, users, currentUser, rolePermissions, airlines, aircrafts, flightClasses, airports, commissionModels, refundPolicies, onCreateFlight, onUpdateFlight, onDeleteFlight }) => {
    // Debug logging
    console.log('🔍 FlightsDashboard rendered with:', {
        flightsCount: flights?.length || 0,
        bookingsCount: bookings?.length || 0,
        usersCount: users?.length || 0,
        currentUser: currentUser?.name || 'undefined',
        flights: flights?.slice(0, 2) || [],
        flightsType: typeof flights,
        flightsIsArray: Array.isArray(flights)
    });

    // Monitor flights changes
    React.useEffect(() => {
        console.log('📊 Flights changed:', flights?.length || 0, 'flights');
        if (flights && flights.length > 0) {
            console.log('🛫 Latest flight:', flights[flights.length - 1]);
        }
    }, [flights]);

    const [view, setView] = useState<'list' | 'form'>('list');
    const [flightToEdit, setFlightToEdit] = useState<Flight | null>(null);
    const [reportFlight, setReportFlight] = useState<Flight | null>(null);
    const [capacityModalFlight, setCapacityModalFlight] = useState<Flight | null>(null);
    const { t, language } = useLocalization();

    // Parse duration string like "2h 30m" to minutes
    const parseDurationToMinutes = (duration: string): number => {
        if (!duration) return 0;
        
        const hoursMatch = duration.match(/(\d+)h/);
        const minutesMatch = duration.match(/(\d+)m/);
        
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        
        return hours * 60 + minutes;
    };

    // Transform frontend flight data to backend format
    const transformFlightDataForBackend = (flightData: Omit<Flight, 'id' | 'creatorId'>) => {
        console.log('🔄 Transforming flight data for backend:', {
            departure: flightData.departure,
            arrival: flightData.arrival,
            availableAirports: airports.length
        });
        
        // Validate required fields
        if (!flightData.departure?.airportCode) {
            console.error('❌ Departure airport code is missing');
            throw new Error('فرودگاه مبدأ انتخاب نشده است');
        }
        if (!flightData.arrival?.airportCode) {
            console.error('❌ Arrival airport code is missing');
            throw new Error('فرودگاه مقصد انتخاب نشده است');
        }
        
        // Find airport IDs from airport codes
        const departureAirport = airports.find(a => a.iata === flightData.departure?.airportCode);
        const arrivalAirport = airports.find(a => a.iata === flightData.arrival?.airportCode);
        
        console.log('🔍 Airport search results:', {
            departureAirport: departureAirport ? { id: departureAirport.id, iata: departureAirport.iata } : null,
            arrivalAirport: arrivalAirport ? { id: arrivalAirport.id, iata: arrivalAirport.iata } : null
        });
        
        if (!departureAirport || !arrivalAirport) {
            console.error('❌ Airport not found in database');
            throw new Error('فرودگاه مبدأ یا مقصد یافت نشد');
        }

        console.log('🔍 transformFlightDataForBackend - flightData.departure:', flightData.departure);
        console.log('🔍 transformFlightDataForBackend - flightData.arrival:', flightData.arrival);
        
        return {
            airline: flightData.airline,
            airlineLogoUrl: flightData.airlineLogoUrl,
            flightNumber: flightData.flightNumber,
            departure: {
                airportId: departureAirport.id,
                terminal: '', // Default empty terminal
                scheduledTime: new Date(flightData.departure?.dateTime || '').toISOString(),
                gate: '', // Default empty gate
            },
            arrival: {
                airportId: arrivalAirport.id,
                terminal: '', // Default empty terminal
                scheduledTime: new Date(flightData.arrival?.dateTime || '').toISOString(),
                gate: '', // Default empty gate
            },
            duration: parseDurationToMinutes(flightData.duration || ''),
            stops: flightData.stops || 0,
            price: flightData.price || 0,
            taxes: flightData.taxes || 0,
            flightClass: flightData.flightClass,
            aircraft: flightData.aircraft,
            availableSeats: flightData.availableSeats || 0,
            totalCapacity: flightData.totalCapacity || 0,
            baggageAllowance: flightData.baggageAllowance || '',
            status: flightData.status || 'SCHEDULED',
            bookingClosesBeforeDepartureHours: flightData.bookingClosesBeforeDepartureHours || 3,
            sourcingType: flightData.sourcingType || 'MANUAL',
            commissionModelId: flightData.commissionModelId || null,
            refundPolicyId: flightData.refundPolicyId || null,
            allotments: flightData.allotments?.map(allotment => ({
                class: flightData.flightClass,
                seats: allotment.seats,
                price: flightData.price + flightData.taxes,
            })) || [],
        };
    };
    
    const handleAddNew = () => {
        setFlightToEdit(null);
        setView('form');
    };

    const handleEdit = (flight: Flight) => {
        setFlightToEdit(flight);
        setView('form');
    };

    const handleSave = async (flightData: Omit<Flight, 'id'> | Flight) => {
        try {
            console.log('🔍 Validating flight data:', {
                departure: flightData.departure,
                arrival: flightData.arrival,
                airline: flightData.airline,
                flightNumber: flightData.flightNumber
            });
            
            // Validate required fields before processing
            if (!flightData.departure?.airportCode) {
                console.error('❌ Departure airport not selected');
                alert('لطفاً فرودگاه مبدأ را انتخاب کنید');
                return;
            }
            if (!flightData.arrival?.airportCode) {
                console.error('❌ Arrival airport not selected');
                alert('لطفاً فرودگاه مقصد را انتخاب کنید');
                return;
            }
            if (!flightData.airline) {
                console.error('❌ Airline not selected');
                alert('لطفاً ایرلاین را انتخاب کنید');
                return;
            }
            if (!flightData.flightNumber) {
                console.error('❌ Flight number not entered');
                alert('لطفاً شماره پرواز را وارد کنید');
                return;
            }
            
            console.log('✅ All validations passed, transforming data...');
            
            if ('id' in flightData && flightData.id) {
                // For updates, also transform the data to ensure duration is converted to number
                const transformedData = transformFlightDataForBackend(flightData as Omit<Flight, 'id' | 'creatorId'>);
                console.log('🔄 Updating flight with transformed data:', transformedData);
                onUpdateFlight({ ...flightData, ...transformedData });
            } else {
                // Transform frontend data to backend format
                const transformedData = transformFlightDataForBackend(flightData as Omit<Flight, 'id' | 'creatorId'>);
                console.log('🆕 Creating flight with transformed data:', transformedData);
                await onCreateFlight(transformedData);
                // Wait a bit for state to update
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            setView('list');
            setFlightToEdit(null);
        } catch (error) {
            console.error('❌ Error saving flight:', error);
            alert(error instanceof Error ? error.message : 'خطا در ذخیره پرواز');
        }
    };

    const handleCancel = () => {
        setView('list');
        setFlightToEdit(null);
    };

    const canCreate = hasPermission(currentUser.role, Permission.CREATE_FLIGHTS, rolePermissions) ||
                      (currentUser.role === 'AFFILIATE' && hasPermission(currentUser.role, Permission.CREATE_OWN_FLIGHTS, rolePermissions));
    
    // Error boundary check
    if (!flights) {
        return (
            <div className="bg-white p-6 rounded-lg shadow border">
                <div className="text-center py-10">
                    <div className="text-red-600 text-lg font-semibold">خطا در بارگذاری پروازها</div>
                    <div className="text-slate-500 mt-2">لطفاً صفحه را تازه‌سازی کنید</div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            {view === 'list' ? (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.flights.title')}</h2>
                        {canCreate && (
                             <button onClick={handleAddNew} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                                <PlusIcon className="w-5 h-5" />
                                <span>{t('dashboard.flights.addNew')}</span>
                            </button>
                        )}
                    </div>
                    <FlightStats flights={flights} bookings={bookings} aircrafts={aircrafts} />
                    <FlightsList 
                        flights={flights} 
                        bookings={bookings}
                        aircrafts={aircrafts}
                        airlines={airlines}
                        airports={airports}
                        currentUser={currentUser}
                        rolePermissions={rolePermissions}
                        onAddNew={handleAddNew}
                        onEdit={handleEdit}
                        onDelete={onDeleteFlight}
                        onUpdateFlight={onUpdateFlight}
                        onShowReport={setReportFlight}
                        onShowCapacity={setCapacityModalFlight}
                    />
                </>
            ) : (
                <CreateFlightForm
                    flightToEdit={flightToEdit}
                    airlines={airlines}
                    aircrafts={aircrafts}
                    flightClasses={flightClasses}
                    airports={airports}
                    commissionModels={commissionModels}
                    refundPolicies={refundPolicies}
                    users={users}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    language={language}
                />
            )}
            {reportFlight && (
                <FlightSalesReportModal
                    isOpen={!!reportFlight}
                    onClose={() => setReportFlight(null)}
                    flight={reportFlight}
                    bookings={bookings}
                    users={users}
                />
            )}
            {capacityModalFlight && (
                <FlightCapacityModal
                    isOpen={!!capacityModalFlight}
                    onClose={() => setCapacityModalFlight(null)}
                    flight={capacityModalFlight}
                    bookings={bookings}
                    aircrafts={aircrafts}
                />
            )}
        </div>
    );
};
