
import React, { useState } from 'react';
import type { AirlineInfo, AircraftInfo, FlightClassInfo, AirportInfo, CommissionModel, RateLimit, Language, LocalizedName, CurrencyInfo, RefundPolicy, CountryInfo } from '@/types';
import { EditIcon } from '@/components/icons/EditIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { CommissionModelsManager } from './CommissionModelsManager';
import { RateLimitsManager } from './RateLimitsManager';
import { useLocalization } from '@/hooks/useLocalization';
import { ToggleOnIcon } from '@/components/icons/ToggleOnIcon';
import { ToggleOffIcon } from '@/components/icons/ToggleOffIcon';
import { RefundPoliciesManager } from './RefundPoliciesManager';

type DataType = 'airline' | 'aircraft' | 'flightClass' | 'airport' | 'commissionModel' | 'rateLimit' | 'currency' | 'refundPolicy' | 'country';
type Item = AirlineInfo | AircraftInfo | FlightClassInfo | AirportInfo | CommissionModel | RateLimit | CurrencyInfo | RefundPolicy | CountryInfo;

interface BasicDataDashboardProps {
    airlines: AirlineInfo[];
    aircrafts: AircraftInfo[];
    flightClasses: FlightClassInfo[];
    airports: AirportInfo[];
    commissionModels: CommissionModel[];
    rateLimits: RateLimit[];
    currencies: CurrencyInfo[];
    refundPolicies: RefundPolicy[];
    countries: CountryInfo[];
    onCreate: (type: DataType, data: Omit<Item, 'id'>) => void;
    onUpdate: (type: DataType, data: Item) => void;
    onDelete: (type: DataType, id: string) => void;
    onCreateRateLimit: (data: Omit<RateLimit, 'id'>) => void;
    onUpdateRateLimit: (data: RateLimit) => void;
    onDeleteRateLimit: (id: string) => void;
}

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}
    >
        {children}
    </button>
);

const DataModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    item: Partial<Item> | null;
    type: DataType;
}> = ({ isOpen, onClose, onSave, item, type }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<any>(() => {
        if (!item) return {};
        
        // Parse JSON strings back to objects for form editing
        const parsedItem = { ...item };
        if (typeof parsedItem.name === 'string') {
            try {
                parsedItem.name = JSON.parse(parsedItem.name);
            } catch {
                // If parsing fails, keep as string
            }
        }
        if (typeof parsedItem.city === 'string') {
            try {
                parsedItem.city = JSON.parse(parsedItem.city);
            } catch {
                // If parsing fails, keep as string
            }
        }
        if (typeof parsedItem.country === 'string') {
            try {
                parsedItem.country = JSON.parse(parsedItem.country);
            } catch {
                // If parsing fails, keep as string
            }
        }
        if (typeof parsedItem.symbol === 'string') {
            try {
                parsedItem.symbol = JSON.parse(parsedItem.symbol);
            } catch {
                // If parsing fails, keep as string
            }
        }
        
        return parsedItem;
    });

    React.useEffect(() => {
        if (!item) {
            setFormData({});
            return;
        }
        
        // Parse JSON strings back to objects for form editing
        const parsedItem = { ...item };
        if (typeof parsedItem.name === 'string') {
            try {
                parsedItem.name = JSON.parse(parsedItem.name);
            } catch {
                // If parsing fails, keep as string
            }
        }
        if (typeof parsedItem.city === 'string') {
            try {
                parsedItem.city = JSON.parse(parsedItem.city);
            } catch {
                // If parsing fails, keep as string
            }
        }
        if (typeof parsedItem.country === 'string') {
            try {
                parsedItem.country = JSON.parse(parsedItem.country);
            } catch {
                // If parsing fails, keep as string
            }
        }
        if (typeof parsedItem.symbol === 'string') {
            try {
                parsedItem.symbol = JSON.parse(parsedItem.symbol);
            } catch {
                // If parsing fails, keep as string
            }
        }
        
        setFormData(parsedItem);
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleLocalizedChange = (field: string, lang: Language, value: string) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: {
                ...(prev[field] as object),
                [lang]: value,
            },
        }));
    };
    
    const isNew = !formData.id;
    let title = '';
    let fields: React.ReactNode = null;

    switch (type) {
        case 'airline':
            title = isNew ? t('dashboard.basicData.modals.addAirline') : t('dashboard.basicData.modals.editAirline');
            fields = (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">نام ایرلاین (فارسی)</label>
                        <input type="text" value={formData.name?.fa || ''} onChange={e => handleLocalizedChange('name', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">نام ایرلاین (عربی)</label>
                        <input type="text" value={formData.name?.ar || ''} onChange={e => handleLocalizedChange('name', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Airline Name (English)</label>
                        <input type="text" value={formData.name?.en || ''} onChange={e => handleLocalizedChange('name', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">URL لوگو</label>
                        <input type="text" value={formData.logoUrl || ''} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                </>
            );
            break;
        case 'aircraft':
            title = isNew ? t('dashboard.basicData.modals.addAircraft') : t('dashboard.basicData.modals.editAircraft');
            fields = (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">نام هواپیما (فارسی)</label>
                        <input type="text" value={formData.name?.fa || ''} onChange={e => handleLocalizedChange('name', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">نام هواپیما (عربی)</label>
                        <input type="text" value={formData.name?.ar || ''} onChange={e => handleLocalizedChange('name', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Aircraft Name (English)</label>
                        <input type="text" value={formData.name?.en || ''} onChange={e => handleLocalizedChange('name', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">ظرفیت</label>
                        <input type="number" value={formData.capacity || ''} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 0 })} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                </>
            );
            break;
        case 'flightClass':
            title = isNew ? t('dashboard.basicData.modals.addFlightClass') : t('dashboard.basicData.modals.editFlightClass');
            fields = (
                 <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">نام کلاس پروازی (فارسی)</label>
                        <input type="text" value={formData.name?.fa || ''} onChange={e => handleLocalizedChange('name', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">نام کلاس پروازی (عربی)</label>
                        <input type="text" value={formData.name?.ar || ''} onChange={e => handleLocalizedChange('name', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Flight Class Name (English)</label>
                        <input type="text" value={formData.name?.en || ''} onChange={e => handleLocalizedChange('name', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                </>
            );
            break;
        case 'airport':
            title = isNew ? t('dashboard.basicData.modals.addAirport') : t('dashboard.basicData.modals.editAirport');
            fields = (
                 <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">کد یاتا (IATA)</label>
                        <input type="text" value={formData.iata || ''} onChange={e => setFormData({ ...formData, iata: e.target.value.toUpperCase() })} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required maxLength={3} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">نام فرودگاه (فارسی)</label>
                        <input type="text" value={formData.name?.fa || ''} onChange={e => handleLocalizedChange('name', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">نام فرودگاه (عربی)</label>
                        <input type="text" value={formData.name?.ar || ''} onChange={e => handleLocalizedChange('name', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Airport Name (English)</label>
                        <input type="text" value={formData.name?.en || ''} onChange={e => handleLocalizedChange('name', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">شهر (فارسی)</label>
                        <input type="text" value={formData.city?.fa || ''} onChange={e => handleLocalizedChange('city', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">شهر (عربی)</label>
                        <input type="text" value={formData.city?.ar || ''} onChange={e => handleLocalizedChange('city', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">City (English)</label>
                        <input type="text" value={formData.city?.en || ''} onChange={e => handleLocalizedChange('city', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">کشور (فارسی)</label>
                        <input type="text" value={formData.country?.fa || ''} onChange={e => handleLocalizedChange('country', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">کشور (عربی)</label>
                        <input type="text" value={formData.country?.ar || ''} onChange={e => handleLocalizedChange('country', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Country (English)</label>
                        <input type="text" value={formData.country?.en || ''} onChange={e => handleLocalizedChange('country', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded focus:ring-accent focus:border-accent" required />
                    </div>
                </>
            );
            break;
        case 'currency':
            title = isNew ? t('dashboard.basicData.modals.addCurrency') : t('dashboard.basicData.modals.editCurrency');
            fields = (
                 <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('dashboard.basicData.modals.currencyName')} (فارسی)</label>
                        <input type="text" value={formData.name?.fa || ''} onChange={e => handleLocalizedChange('name', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('dashboard.basicData.modals.currencyName')} (عربی)</label>
                        <input type="text" value={formData.name?.ar || ''} onChange={e => handleLocalizedChange('name', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('dashboard.basicData.modals.currencyName')} (English)</label>
                        <input type="text" value={formData.name?.en || ''} onChange={e => handleLocalizedChange('name', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">{t('dashboard.basicData.modals.currencyCode')}</label>
                            <input type="text" value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="mt-1 w-full p-2 border rounded" required maxLength={3} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">{t('dashboard.basicData.modals.currencySymbol')} (فارسی)</label>
                           <input type="text" value={formData.symbol?.fa || ''} onChange={e => handleLocalizedChange('symbol', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                        </div>
                         <div>
                           <label className="block text-sm font-medium text-slate-700">{t('dashboard.basicData.modals.currencySymbol')} (عربی)</label>
                           <input type="text" value={formData.symbol?.ar || ''} onChange={e => handleLocalizedChange('symbol', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                        </div>
                         <div>
                           <label className="block text-sm font-medium text-slate-700">{t('dashboard.basicData.modals.currencySymbol')} (English)</label>
                           <input type="text" value={formData.symbol?.en || ''} onChange={e => handleLocalizedChange('symbol', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                        </div>
                     </div>
                 </>
            );
            break;
        case 'country':
            title = isNew ? t('dashboard.basicData.modals.addCountry') : t('dashboard.basicData.modals.editCountry');
            fields = (
                 <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">ISO Code (2 Letters)</label>
                        <input type="text" value={formData.id || ''} onChange={e => setFormData({ ...formData, id: e.target.value.toUpperCase() })} className="mt-1 w-full p-2 border rounded" required maxLength={2} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">نام کشور (فارسی)</label>
                        <input type="text" value={formData.name?.fa || ''} onChange={e => handleLocalizedChange('name', 'fa', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">نام کشور (عربی)</label>
                        <input type="text" value={formData.name?.ar || ''} onChange={e => handleLocalizedChange('name', 'ar', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Country Name (English)</label>
                        <input type="text" value={formData.name?.en || ''} onChange={e => handleLocalizedChange('name', 'en', e.target.value)} className="mt-1 w-full p-2 border rounded" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">{t('dashboard.basicData.headers.dialingCode')}</label>
                        <input type="text" value={formData.dialingCode || ''} onChange={e => setFormData({ ...formData, dialingCode: e.target.value })} className="mt-1 w-full p-2 border rounded" placeholder="+98" required />
                    </div>
                </>
            );
            break;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <form className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-primary">{title}</h3>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {fields}
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border rounded-md text-sm font-medium hover:bg-gray-100">{t('dashboard.general.cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md text-sm font-medium hover:bg-accent-hover">{t('dashboard.general.save')}</button>
                </div>
            </form>
        </div>
    );
};


export const BasicDataDashboard: React.FC<BasicDataDashboardProps> = ({ airlines, aircrafts, flightClasses, airports, commissionModels, rateLimits, currencies, refundPolicies, countries, onCreate, onUpdate, onDelete, onCreateRateLimit, onUpdateRateLimit, onDeleteRateLimit }) => {
    // Debug logging
    console.log('🔍 BasicDataDashboard rendered with:', {
        airlinesCount: airlines?.length || 0,
        aircraftsCount: aircrafts?.length || 0,
        flightClassesCount: flightClasses?.length || 0,
        airportsCount: airports?.length || 0,
        currenciesCount: currencies?.length || 0,
        countriesCount: countries?.length || 0,
    });

    // Monitor airlines changes
    React.useEffect(() => {
        console.log('📊 Airlines changed:', airlines?.length || 0, 'airlines');
        if (airlines && airlines.length > 0) {
            console.log('✈️ Latest airline:', airlines[airlines.length - 1]);
        }
    }, [airlines]);

    const [activeTab, setActiveTab] = useState<DataType>('airline');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const { language, t } = useLocalization();
    const [airportSearchTerm, setAirportSearchTerm] = useState('');

    // Helper function to parse localized name
    const parseLocalizedName = (name: any, lang: Language): string => {
        if (typeof name === 'string') {
            try {
                const parsed = JSON.parse(name);
                return parsed[lang] || parsed['fa'] || parsed['en'] || name;
            } catch {
                return name;
            }
        }
        return name[lang] || name['fa'] || name['en'] || '';
    };

    const handleOpenModal = (item: Item | null = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = async (data: Item) => {
        const isNewItem = !data.id;
        if (data.id && !isNewItem) {
            // For updates, always use the original item ID for the update operation
            const updateData = { ...data };
            // Always use the original editingItem.id for the update operation
            if (editingItem?.id) {
                updateData.id = editingItem.id;
            }
            // Pass the original ID as a separate parameter
            await onUpdate(activeTab, updateData, editingItem?.id);
        } else {
            await onCreate(activeTab, data);
        }
        // Wait a bit for state to update before closing modal
        setTimeout(() => {
            handleCloseModal();
        }, 500);
    };

    const handleToggleCurrencyStatus = (currency: CurrencyInfo) => {
        onUpdate('currency', { ...currency, isActive: !currency.isActive });
    };

    const renderTable = () => {
        let data: Item[] = [];
        let headers: string[] = [];
        let renderRowCells: (item: any) => React.ReactNode;
        let requiresAddButton = true;
        let specialComponent: React.ReactNode = null;

        switch (activeTab) {
            case 'airline':
                data = airlines || [];
                headers = [t('dashboard.basicData.headers.logo'), t('dashboard.basicData.headers.airlineName')];
                renderRowCells = (item: AirlineInfo) => (
                    <>
                        <td className="px-6 py-4"><img src={item.logoUrl} alt={(item.name as LocalizedName)[language]} className="w-10 h-10 rounded-full object-cover" /></td>
                        <td className="px-6 py-4 font-medium text-slate-800">{(item.name as LocalizedName)[language]}</td>
                    </>
                );
                break;
            case 'aircraft':
                data = aircrafts || [];
                headers = [t('dashboard.basicData.headers.aircraftName'), t('dashboard.basicData.headers.capacity')];
                renderRowCells = (item: AircraftInfo) => (
                    <>
                        <td className="px-6 py-4 font-medium text-slate-800">
                            {parseLocalizedName(item.name, language)}
                        </td>
                        <td className="px-6 py-4">{item.capacity}</td>
                    </>
                );
                break;
            case 'flightClass':
                data = flightClasses || [];
                headers = [t('dashboard.basicData.headers.className')];
                renderRowCells = (item: FlightClassInfo) => (
                    <>
                        <td className="px-6 py-4 font-medium text-slate-800">
                            {parseLocalizedName(item.name, language)}
                        </td>
                    </>
                );
                break;
            case 'airport':
                data = (airports || []).filter(a => {
                    const cityName = parseLocalizedName(a.city, language);
                    const airportName = parseLocalizedName(a.name, language);
                    return cityName.toLowerCase().includes(airportSearchTerm.toLowerCase()) ||
                           airportName.toLowerCase().includes(airportSearchTerm.toLowerCase()) ||
                           a.iata.toLowerCase().includes(airportSearchTerm.toLowerCase());
                });
                headers = [t('dashboard.basicData.headers.iata'), t('dashboard.basicData.headers.airportName'), t('dashboard.basicData.headers.city'), t('dashboard.basicData.headers.country')];
                renderRowCells = (item: AirportInfo) => (
                    <>
                        <td className="px-6 py-4 font-mono">{item.iata}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                            {parseLocalizedName(item.name, language)}
                        </td>
                        <td className="px-6 py-4">
                            {parseLocalizedName(item.city, language)}
                        </td>
                        <td className="px-6 py-4">
                            {parseLocalizedName(item.country, language)}
                        </td>
                    </>
                );
                break;
            case 'commissionModel':
                requiresAddButton = false;
                specialComponent = <CommissionModelsManager models={commissionModels || []} onCreate={(d) => onCreate('commissionModel', d)} onUpdate={(d) => onUpdate('commissionModel', d)} onDelete={(id) => onDelete('commissionModel', id)} />;
                break;
            case 'rateLimit':
                requiresAddButton = false;
                specialComponent = <RateLimitsManager rateLimits={rateLimits || []} airports={airports || []} onCreate={onCreateRateLimit} onUpdate={onUpdateRateLimit} onDelete={onDeleteRateLimit} />;
                break;
            case 'currency':
                data = currencies || [];
                headers = [t('dashboard.basicData.headers.currencyName'), t('dashboard.basicData.headers.code'), t('dashboard.basicData.headers.symbol'), t('dashboard.basicData.headers.rateToUsd'), t('dashboard.general.status')];
                renderRowCells = (item: CurrencyInfo) => (
                    <>
                        <td className="px-6 py-4 font-medium">
                            {parseLocalizedName(item.name, language)}
                        </td>
                        <td className="px-6 py-4 font-mono">{item.code}</td>
                        <td className="px-6 py-4">
                            {parseLocalizedName(item.symbol, language)}
                        </td>
                        <td className="px-6 py-4">{item.rateToUsd}</td>
                        <td className="px-6 py-4">
                            <button onClick={() => handleToggleCurrencyStatus(item)} title={item.isActive ? "Deactivate" : "Activate"}>
                                {item.isActive ? <ToggleOnIcon className="w-6 h-6 text-green-500" /> : <ToggleOffIcon className="w-6 h-6 text-slate-400" />}
                            </button>
                        </td>
                    </>
                );
                break;
            case 'refundPolicy':
                requiresAddButton = false;
                specialComponent = <RefundPoliciesManager policies={refundPolicies || []} airlines={airlines || []} onCreate={(d) => onCreate('refundPolicy', d)} onUpdate={(d) => onUpdate('refundPolicy', d)} onDelete={(id) => onDelete('refundPolicy', id)} />;
                break;
            case 'country':
                data = countries || [];
                headers = [t('dashboard.basicData.headers.countryName'), 'ISO Code', t('dashboard.basicData.headers.dialingCode')];
                renderRowCells = (item: CountryInfo) => (
                    <>
                        <td className="px-6 py-4 font-medium">
                            {parseLocalizedName(item.name, language)}
                        </td>
                        <td className="px-6 py-4 font-mono">{item.id}</td>
                        <td className="px-6 py-4">{item.dialingCode}</td>
                    </>
                );
                break;
        }

        if (specialComponent) {
            return specialComponent;
        }

        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    {activeTab === 'airport' && (
                        <input
                            type="text"
                            placeholder={t('dashboard.basicData.searchAirportHint')}
                            value={airportSearchTerm}
                            onChange={e => setAirportSearchTerm(e.target.value)}
                            className="w-full sm:w-64 px-3 py-2 border border-slate-300 rounded-lg focus:ring-accent focus:border-accent text-sm"
                        />
                    )}
                    <div className="flex-grow"></div> {/* Spacer */}
                    {requiresAddButton && (
                        <button onClick={() => handleOpenModal(null)} className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-800 transition text-sm">
                            <PlusIcon className="w-5 h-5" />
                            <span>{t('dashboard.basicData.addNew')}</span>
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {headers.map(h => <th key={h} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.general.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data && Array.isArray(data) && data.length > 0 ? data.filter((item, index, self) => 
                                index === self.findIndex(t => t.id === item.id)
                            ).map(item => (
                                <tr key={item.id}>
                                    {renderRowCells(item)}
                                    <td className="px-6 py-4 text-left space-x-2 space-x-reverse">
                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-500 hover:text-primary rounded-full hover:bg-slate-100"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onDelete(activeTab, item.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={headers.length + 1} className="text-center py-10 text-slate-500">{t('dashboard.basicData.noItems')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.basicData.title')}</h2>
                    <p className="text-sm text-slate-500 mt-1">{t('dashboard.basicData.subtitle')}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-4 border-b pb-4 flex-wrap">
                <TabButton isActive={activeTab === 'airline'} onClick={() => setActiveTab('airline')}>{t('dashboard.basicData.tabs.airlines')}</TabButton>
                <TabButton isActive={activeTab === 'aircraft'} onClick={() => setActiveTab('aircraft')}>{t('dashboard.basicData.tabs.aircrafts')}</TabButton>
                <TabButton isActive={activeTab === 'flightClass'} onClick={() => setActiveTab('flightClass')}>{t('dashboard.basicData.tabs.flightClasses')}</TabButton>
                <TabButton isActive={activeTab === 'airport'} onClick={() => setActiveTab('airport')}>{t('dashboard.basicData.tabs.airports')}</TabButton>
                <TabButton isActive={activeTab === 'commissionModel'} onClick={() => setActiveTab('commissionModel')}>{t('dashboard.basicData.tabs.commissionModels')}</TabButton>
                <TabButton isActive={activeTab === 'rateLimit'} onClick={() => setActiveTab('rateLimit')}>{t('dashboard.basicData.tabs.rateLimits')}</TabButton>
                <TabButton isActive={activeTab === 'currency'} onClick={() => setActiveTab('currency')}>{t('dashboard.basicData.tabs.currencies')}</TabButton>
                <TabButton isActive={activeTab === 'refundPolicy'} onClick={() => setActiveTab('refundPolicy')}>{t('dashboard.basicData.tabs.refundPolicies')}</TabButton>
                <TabButton isActive={activeTab === 'country'} onClick={() => setActiveTab('country')}>{t('dashboard.basicData.tabs.countries')}</TabButton>
            </div>

            {renderTable()}

            <DataModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                item={editingItem}
                type={activeTab}
            />
        </div>
    );
};
