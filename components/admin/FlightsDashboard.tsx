
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Flight, AirlineInfo, AircraftInfo, FlightClassInfo, FlightStatus, AirportInfo, CommissionModel, FlightSourcingType, Language, RefundPolicy, Booking, User, SeatAllotment, RolePermissions } from '../../types';
import { Permission, FlightSourcingType as FSTEnum, PolicyType } from '../../types';
import { hasPermission } from '../../utils/permissions';
import { EditIcon } from '../icons/EditIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { ToggleOnIcon } from '../icons/ToggleOnIcon';
import { ToggleOffIcon } from '../icons/ToggleOffIcon';
import { useLocalization } from '../../hooks/useLocalization';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { FlightSalesReportModal } from './FlightSalesReportModal';
import { SearchableSelect } from '../SearchableSelect';
import { UsersIcon } from '../icons/UsersIcon';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CurrencyTomanIcon } from '../icons/CurrencyTomanIcon';
import { PlaneIcon } from '../icons/PlaneIcon';
import { SeatIcon } from '../icons/SeatIcon';
import { ChartBarIcon } from '../icons/ChartBarIcon';
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
        const upcomingFlights = flights.filter(f => new Date(f.departure.dateTime) >= new Date() && f.status === 'SCHEDULED');
        
        let totalSeats = 0;
        let totalSold = 0;
        let totalRevenue = 0;

        upcomingFlights.forEach(flight => {
            const aircraft = aircrafts.find(a => a.name['en'] === flight.aircraft || a.name['fa'] === flight.aircraft || a.name['ar'] === flight.aircraft);
            const capacity = flight.totalCapacity || (aircraft ? aircraft.capacity : 0);
            const sold = bookings
                .filter(b => b.flight.id === flight.id && b.status === 'CONFIRMED')
                .reduce((sum, b) => sum + b.passengers.adults.length + b.passengers.children.length + b.passengers.infants.length, 0);
            
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
    };
    return <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[status]}`}>{t(`dashboard.flights.statusValues.${status}`)}</span>;
};

const FlightsList: React.FC<FlightsListProps> = ({ flights, bookings, aircrafts, currentUser, rolePermissions, onAddNew, onEdit, onDelete, onUpdateFlight, onShowReport, onShowCapacity }) => {
    const { t, formatNumber, formatDate, language } = useLocalization();
    const handleToggleStatus = (flight: Flight) => {
        const newStatus = flight.status === 'SCHEDULED' ? 'CANCELLED' : 'SCHEDULED';
        onUpdateFlight({ ...flight, status: newStatus });
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
                        {flights.length > 0 ? flights.map(flight => {
                            const aircraft = aircrafts.find(a => a.name[language] === flight.aircraft);
                            const totalCapacity = flight.totalCapacity || (aircraft ? aircraft.capacity : 0);
                            const soldSeats = bookings
                                .filter(b => b.flight.id === flight.id && b.status === 'CONFIRMED')
                                .reduce((sum, b) => sum + b.passengers.adults.length + b.passengers.children.length + b.passengers.infants.length, 0);
                            const loadFactor = totalCapacity > 0 ? (soldSeats / totalCapacity) * 100 : 0;
                            const revenue = soldSeats * (flight.price + flight.taxes);

                            return (
                                <tr key={flight.id}>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="font-semibold text-slate-800">{flight.airline}</div>
                                        <div className="font-mono text-slate-500 text-xs">{flight.flightNumber}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap font-medium text-slate-700">{flight.departure.city} &rarr; {flight.arrival.city}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <button type="button" onClick={() => onShowCapacity(flight)} className="text-right hover:bg-slate-50 p-1 rounded-md transition-colors w-full">
                                            <div className="flex items-center">
                                                <div className="w-24 bg-slate-200 rounded-full h-2.5">
                                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${loadFactor}%` }}></div>
                                                </div>
                                                <span className="mr-2 font-semibold">{loadFactor.toFixed(1)}%</span>
                                            </div>
                                            <span className="text-xs text-slate-500">({formatNumber(soldSeats)}/{formatNumber(totalCapacity)})</span>
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
        availableSeats: 0, totalCapacity: 0, baggageAllowance: '', status: 'SCHEDULED' as FlightStatus,
        bookingClosesBeforeDepartureHours: 3,
        sourcingType: FSTEnum.Charter,
        commissionModelId: undefined,
        refundPolicyId: undefined,
        allotments: [],
    };

    const [formData, setFormData] = useState<Omit<Flight, 'id'> | Flight>(initialFormState);

    useEffect(() => {
        const initialData = flightToEdit ? { ...flightToEdit, allotments: flightToEdit.allotments || [] } : { ...initialFormState, allotments: [] };
        setFormData(initialData);
    }, [flightToEdit]);
    
    const toDateTimeLocal = (isoString: string | undefined) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    };

    const fromDateTimeLocal = (localString: string) => {
        if (!localString) return new Date().toISOString();
        return new Date(localString).toISOString();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'number' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleEndpointChange = (endpoint: 'departure' | 'arrival', field: string, value: string) => {
        setFormData(prev => ({ ...prev, [endpoint]: { ...prev[endpoint], [field]: value } }));
    };

    const handleAirportChange = (endpoint: 'departure' | 'arrival', iata: string) => {
        const airport = airports.find(a => a.iata === iata);
        if (airport) {
            setFormData(prev => ({ ...prev, [endpoint]: { ...(prev[endpoint] as object), city: airport.city[language], airportCode: airport.iata, airportName: airport.name[language] } }));
        }
    };
    
    const handleAirlineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const airlineName = e.target.value;
        const selectedAirline = airlines.find(a => a.name[language] === airlineName);
        if (selectedAirline) {
            setFormData(prev => ({...prev, airline: selectedAirline.name[language], airlineLogoUrl: selectedAirline.logoUrl, refundPolicyId: '' }));
        }
    };
    
    const handleAircraftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const aircraftName = e.target.value;
        const selectedAircraft = aircrafts.find(a => a.name[language] === aircraftName);
        setFormData(prev => ({
            ...prev,
            aircraft: aircraftName,
            totalCapacity: selectedAircraft ? selectedAircraft.capacity : 0,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Flight);
    };
    
    const selectedAirline = airlines.find(a => a.name[language] === formData.airline);
    
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
            id: `allot-${Date.now()}`,
            agencyId: '',
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
                        {airlines.map(a => <option key={a.id} value={a.name[language]}>{a.name[language]}</option>)}
                    </select>
                    <input type="text" name="flightNumber" placeholder={t('dashboard.flights.flightNumber')} value={formData.flightNumber || ''} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <select name="aircraft" value={formData.aircraft} onChange={handleAircraftChange} className="w-full p-2 border rounded bg-white" required>
                        <option value="" disabled>{t('dashboard.flights.form.aircraft')}</option>
                        {aircrafts.map(a => <option key={a.id} value={a.name[language]}>{a.name[language]}</option>)}
                    </select>
                    <select name="flightClass" value={formData.flightClass} onChange={handleChange} className="w-full p-2 border rounded bg-white" required>
                        <option value="" disabled>{t('dashboard.flights.form.flightClass')}</option>
                        {flightClasses.map(fc => <option key={fc.id} value={fc.name[language]}>{fc.name[language]}</option>)}
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
                            {selectedPolicy.rules.length > 0 ? (
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
                                    value={allotment.agencyId}
                                    onChange={value => handleAllotmentChange(allotment.id, 'agencyId', value)}
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
    const [view, setView] = useState<'list' | 'form'>('list');
    const [flightToEdit, setFlightToEdit] = useState<Flight | null>(null);
    const [reportFlight, setReportFlight] = useState<Flight | null>(null);
    const [capacityModalFlight, setCapacityModalFlight] = useState<Flight | null>(null);
    const { t, language } = useLocalization();
    
    const handleAddNew = () => {
        setFlightToEdit(null);
        setView('form');
    };

    const handleEdit = (flight: Flight) => {
        setFlightToEdit(flight);
        setView('form');
    };

    const handleSave = (flightData: Omit<Flight, 'id'> | Flight) => {
        if ('id' in flightData && flightData.id) {
            onUpdateFlight(flightData);
        } else {
            onCreateFlight(flightData as Omit<Flight, 'id' | 'creatorId'>);
        }
        setView('list');
        setFlightToEdit(null);
    };

    const handleCancel = () => {
        setView('list');
        setFlightToEdit(null);
    };

    const canCreate = hasPermission(currentUser.role, Permission.CREATE_FLIGHTS, rolePermissions) ||
                      (currentUser.role === 'AFFILIATE' && hasPermission(currentUser.role, Permission.CREATE_OWN_FLIGHTS, rolePermissions));
    
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
