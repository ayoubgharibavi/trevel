
import React, { useState } from 'react';
import type { User, AirlineInfo, AircraftInfo, FlightClassInfo, AirportInfo, Flight, PassengerDetails, Booking } from '../../types';
import { Gender, Nationality, FlightSourcingType } from '../../types';
import { useLocalization } from '../../hooks/useLocalization';
import { PlusIcon } from '../icons/PlusIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { ETicketModal } from '../profile/ETicketModal';
import { SearchableSelect } from '../SearchableSelect';

interface ManualBookingDashboardProps {
    users: User[];
    airlines: AirlineInfo[];
    aircrafts: AircraftInfo[];
    flightClasses: FlightClassInfo[];
    airports: AirportInfo[];
    allFlights: Flight[];
    onManualBookingCreate: (data: { flightData: Omit<Flight, 'id' | 'creatorId'>, passengers: { adults: PassengerDetails[], children: PassengerDetails[], infants: PassengerDetails[] }, customerId: string, purchasePrice: number, contactEmail: string, contactPhone: string, buyerReference?: string, notes?: string }) => Promise<Booking | null>;
}

const countries = [
  "أفغانستان", "ألبانيا", "الجزائر", "أندورا", "أنغولا", "أنتيغوا وبربودا", "الأرجنتين", "أرمينيا", "أستراليا", "النمسا",
  "أذربيجان", "جزر البهاما", "البحرين", "بنغلاديش", "بربادوس", "بيلاروسيا", "بلجيكا", "بليز", "بنين", "بوتان", "بوليفيا",
  "البوسنة والهرسك", "بوتسوانا", "البرازيل", "بروناي", "بلغاريا", "بوركينا فاسو", "بوروندي", "الرأس الأخضر", "كمبوديا",
  "الكاميرون", "كندا", "جمهورية أفريقيا الوسطى", "تشاد", "تشيلي", "الصين", "كولumbia", "جزر القمر", "الكونغو، جمهورية الديمقراطية",
  "الكونغو، جمهورية", "كوستاريكا", "ساحل العاج", "كرواتيا", "كوبا", "قبرص", "جمهورية التشيك", "الدنمارك", "جيبوتي",
  "دومينيكا", "جمهورية الدومينيكان", "الإكوادور", "مصر", "السلفادور", "غينيا الاستوائية", "إريتريا", "إستونيا", "إسواتيني",
  "إثيوبيا", "فيجي", "فنلندا", "فرنسا", "الغابون", "غامبيا", "جورجيا", "ألمانيا", "غانا", "اليونان", "غرينادا", "غواتيمالا",
  "غينيا", "غينيا بيساو", "غيانا", "هايتي", "هندوراس", "المجر", "آيسلندا", "الهند", "إندونيسيا", "إيران", "العراق", "أيرلندا",
  "إيطاليا", "جامايكا", "اليابان", "الأردن", "كازاخستان", "كينيا", "كيريباتي", "كوسوفو", "الكويت", "قيرغيزستان", "لاوس",
  "لاتفيا", "لبنان", "ليسوتو", "ليبيريا", "ليبيا", "ليختنشتاين", "ليتوانيا", "لوكسمبورغ", "مدغشقر", "ملاوي",
  "ماليزيا", "جزر المالديف", "مالي", "مالطا", "جزر مارشال", "موريتانيا", "موريشيوس", "المكسيك", "ميكرونيزيا", "مولدوفا",
  "موناكو", "منغوليا", "الجبل الأسود", "المغرب", "موزمبيق", "ميانمار", "ناميبيا", "ناورو", "نيبال", "هولندا",
  "نيوزيلندا", "نيكاراغوا", "النيجر", "نيجيريا", "كوريا الشمالية", "مقدونيا الشمالية", "النرويج", "عمان", "باكستان", "بالاو",
  "دولة فلسطين", "بنما", "بابوا غينيا الجديدة", "باراغواي", "بيرو", "الفلبين", "بولندا", "البرتغال", "قطر", "رومانيا",
  "روسيا", "رواندا", "سانت كيتس ونيفيس", "سانت لوسيا", "سانت فنسنت والجرينادين", "ساموا", "سان مارينو",
  "ساو تومي وبرينسيب", "المملكة العربية السعودية", "السنغال", "صربيا", "سيشيل", "سيراليون", "سنغافورة", "سلوفاكيا",
  "سلوفينيا", "جزر سليمان", "الصومال", "جنوب أفريقيا", "كوريا الجنوبية", "جنوب السودان", "إسبانيا", "سريلانكا", "السودان",
  "سورينام", "السويد", "سويسرا", "سوريا", "تايوان", "طاجيكستان", "تنزانيا", "تايلاند", "تيمور الشرقية", "توغو",
  "تونغا", "ترينيداد وتوباغو", "تونس", "تركيا", "تركمانستان", "توفالو", "أوغندا", "أوكرانيا", "الإمارات العربية المتحدة",
  "المملكة المتحدة", "الولايات المتحدة الأمريكية", "أوروغواي", "أوزبكستان", "فانواتو", "الفاتيكان", "فنزويلا", "فيتنام",
  "اليمن", "زامبيا", "زيمبابوي"
].filter(c => c !== 'Israel');


const PassengerForm: React.FC<{ passenger: PassengerDetails, onChange: (field: keyof PassengerDetails, value: any) => void }> = ({ passenger, onChange }) => {
    const { t } = useLocalization();
    return (
        <div className="p-3 border rounded-md bg-slate-50 space-y-3 flex-grow">
             <div className="p-1 bg-slate-200 rounded-lg flex items-center w-min">
                <button type="button" onClick={() => onChange('nationality', Nationality.Iranian)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${passenger.nationality === Nationality.Iranian ? 'bg-white shadow-sm text-primary' : 'text-slate-600'}`}>{t('passengerDetails.iranian')}</button>
                <button type="button" onClick={() => onChange('nationality', Nationality.Foreign)} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${passenger.nationality === Nationality.Foreign ? 'bg-white shadow-sm text-primary' : 'text-slate-600'}`}>{t('passengerDetails.foreign')}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" placeholder={t('passengerDetails.firstName')} value={passenger.firstName} onChange={e => onChange('firstName', e.target.value)} className="p-2 border rounded text-sm" required />
                <input type="text" placeholder={t('passengerDetails.lastName')} value={passenger.lastName} onChange={e => onChange('lastName', e.target.value)} className="p-2 border rounded text-sm" required />
                <select name="gender" value={passenger.gender} onChange={e => onChange('gender', e.target.value)} className="p-2 border rounded bg-white text-sm" required>
                    <option value="" disabled>{t('passengerDetails.gender')}</option>
                    <option value={Gender.Male}>{t('passengerDetails.male')}</option>
                    <option value={Gender.Female}>{t('passengerDetails.female')}</option>
                </select>
            </div>
            {passenger.nationality === Nationality.Iranian ? (
                <div>
                    <input type="text" placeholder={t('passengerDetails.nationalId')} value={passenger.nationalId || ''} onChange={e => onChange('nationalId', e.target.value)} className="p-2 border rounded text-sm w-full md:w-1/3" required />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" placeholder={t('passengerDetails.passportNumber')} value={passenger.passportNumber || ''} onChange={e => onChange('passportNumber', e.target.value)} className="p-2 border rounded text-sm" required />
                    <select value={passenger.passportIssuingCountry || ''} onChange={(e) => onChange('passportIssuingCountry', e.target.value)} className="p-2 border rounded bg-white text-sm" required>
                        <option value="" disabled>{t('passengerDetails.issuingCountry')}</option>
                        {countries.map(country => (<option key={country} value={country}>{country}</option>))}
                    </select>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">{t('passengerDetails.dob')}</label>
                        <input type="date" value={passenger.dateOfBirth || ''} onChange={e => onChange('dateOfBirth', e.target.value)} className="w-full p-2 border rounded text-sm" required />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-500 mb-1">{t('passengerDetails.passportExpiry')}</label>
                        <input type="date" value={passenger.passportExpiryDate || ''} onChange={e => onChange('passportExpiryDate', e.target.value)} className="w-full p-2 border rounded text-sm" required />
                    </div>
                </div>
            )}
        </div>
    );
};


export const ManualBookingDashboard: React.FC<ManualBookingDashboardProps> = ({ users, airlines, aircrafts, flightClasses, airports, allFlights, onManualBookingCreate }) => {
    const { t, language } = useLocalization();

    const initialFlightState: Omit<Flight, 'id' | 'creatorId' | 'commissionModelId' | 'refundPolicyId'> = {
        airline: '', airlineLogoUrl: '', flightNumber: '', aircraft: '', flightClass: '',
        departure: { airportCode: '', city: '', airportName: '', dateTime: '' },
        arrival: { airportCode: '', city: '', airportName: '', dateTime: '' },
        duration: '', stops: 0, baggageAllowance: '', status: 'SCHEDULED', availableSeats: 1, bookingClosesBeforeDepartureHours: 3, sourcingType: FlightSourcingType.Manual,
        price: 0, taxes: 0,
    };

    const [flightData, setFlightData] = useState(initialFlightState);
    const [passengers, setPassengers] = useState<{ adults: PassengerDetails[], children: PassengerDetails[], infants: PassengerDetails[] }>({ adults: [{ nationality: Nationality.Iranian, firstName: '', lastName: '', gender: '' }], children: [], infants: [] });
    const [customerId, setCustomerId] = useState('');
    const [purchasePrice, setPurchasePrice] = useState(0);
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [buyerReference, setBuyerReference] = useState('');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
    
    const toDateTimeLocal = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    };

    const fromDateTimeLocal = (localString: string) => new Date(localString).toISOString();

    const handleFlightChange = (field: string, value: any) => {
        setFlightData(prev => ({...prev, [field]: value}));
    };

    const handleFlightNumberBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const flightNum = e.target.value.trim();
        if (!flightNum) return;

        const existingFlight = allFlights.find(f => f.flightNumber.toLowerCase() === flightNum.toLowerCase());
        if (existingFlight) {
            const { id, creatorId, commissionModelId, refundPolicyId, price, taxes, availableSeats, ...detailsToCopy } = existingFlight;
             setFlightData(prev => ({
                ...prev,
                ...detailsToCopy,
            }));
        }
    };
    
    const handleAirlineChange = (airlineId: string) => {
        const selectedAirline = airlines.find(a => a.id === airlineId);
        if (selectedAirline) {
            setFlightData(prev => ({
                ...prev,
                airline: selectedAirline.name[language],
                airlineLogoUrl: selectedAirline.logoUrl,
            }));
        }
    };

    const handleAircraftChange = (aircraftId: string) => {
        const selectedAircraft = aircrafts.find(a => a.id === aircraftId);
        if(selectedAircraft) {
            handleFlightChange('aircraft', selectedAircraft.name[language]);
        }
    };

    const handleFlightClassChange = (classId: string) => {
        const selectedClass = flightClasses.find(fc => fc.id === classId);
        if(selectedClass) {
            handleFlightChange('flightClass', selectedClass.name[language]);
        }
    };
    
     const handleEndpointChange = (endpoint: 'departure' | 'arrival', field: string, value: string) => {
        setFlightData(prev => ({ ...prev, [endpoint]: { ...prev[endpoint], [field]: value }}));
    };

    const handleAirportChange = (endpoint: 'departure' | 'arrival', airportIata: string) => {
        const airport = airports.find(a => a.iata === airportIata);
        if (airport) {
            setFlightData(prev => ({ ...prev, [endpoint]: { ...prev[endpoint], airportCode: airportIata, city: airport.city[language], airportName: airport.name[language] }}));
        }
    };

    const handleCustomerChange = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) {
            setCustomerId(user.id);
            setContactEmail(user.email);
        }
    };
    
    const handlePassengerChange = (type: 'adults' | 'children' | 'infants', index: number, field: keyof PassengerDetails, value: any) => {
        setPassengers(prev => {
            const newPassengersOfType = [...prev[type]];
            const updatedPassenger = { ...newPassengersOfType[index], [field]: value };

            if (field === 'nationality') {
                if (value === Nationality.Iranian) {
                    updatedPassenger.passportNumber = '';
                    updatedPassenger.passportIssuingCountry = '';
                    updatedPassenger.dateOfBirth = '';
                    updatedPassenger.passportExpiryDate = '';
                } else {
                    updatedPassenger.nationalId = '';
                }
            }
            newPassengersOfType[index] = updatedPassenger;
            return { ...prev, [type]: newPassengersOfType };
        });
    };

    const addPassenger = (type: 'adults' | 'children' | 'infants') => {
        setPassengers(prev => ({...prev, [type]: [...prev[type], { nationality: Nationality.Iranian, firstName: '', lastName: '', gender: '' }]}));
    };
    
    const removePassenger = (type: 'adults' | 'children' | 'infants', index: number) => {
        setPassengers(prev => {
            const newPassengers = [...prev[type]];
            newPassengers.splice(index, 1);
            return {...prev, [type]: newPassengers};
        });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const bookingData = {
            flightData,
            passengers,
            customerId,
            purchasePrice,
            contactEmail,
            contactPhone,
            buyerReference,
            notes,
        };
        const newBooking = await onManualBookingCreate(bookingData as any);
        if(newBooking) {
            setCreatedBooking(newBooking);
            // Optionally reset form
            setFlightData(initialFlightState);
            setPassengers({ adults: [{ nationality: Nationality.Iranian, firstName: '', lastName: '', gender: '' }], children: [], infants: [] });
            setCustomerId('');
            setPurchasePrice(0);
            setContactEmail('');
            setContactPhone('');
            setBuyerReference('');
            setNotes('');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            {createdBooking && <ETicketModal booking={createdBooking} onClose={() => setCreatedBooking(null)} />}
            <h2 className="text-2xl font-bold text-slate-800">{t('dashboard.manualBooking.title')}</h2>
            <p className="text-sm text-slate-500 mt-1 mb-6">{t('dashboard.manualBooking.subtitle')}</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Flight Details */}
                <fieldset className="border p-4 rounded-lg space-y-4">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.manualBooking.flightDetails')}</legend>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <SearchableSelect
                            value={airlines.find(a => a.name[language] === flightData.airline)?.id || ''}
                            onChange={handleAirlineChange}
                            options={airlines.map(a => ({ value: a.id, label: a.name[language] }))}
                            placeholder={t('dashboard.flights.form.airline')}
                        />
                        <input type="text" placeholder={t('dashboard.flights.flightNumber')} value={flightData.flightNumber} onBlur={handleFlightNumberBlur} onChange={e => handleFlightChange('flightNumber', e.target.value)} className="p-2 border rounded text-sm" required />
                        <SearchableSelect
                            value={aircrafts.find(a => a.name[language] === flightData.aircraft)?.id || ''}
                            onChange={handleAircraftChange}
                            options={aircrafts.map(a => ({ value: a.id, label: a.name[language] }))}
                            placeholder={t('dashboard.flights.form.aircraft')}
                        />
                        <SearchableSelect
                            value={flightClasses.find(fc => fc.name[language] === flightData.flightClass)?.id || ''}
                            onChange={handleFlightClassChange}
                            options={flightClasses.map(fc => ({ value: fc.id, label: fc.name[language] }))}
                            placeholder={t('dashboard.flights.form.flightClass')}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder={t('dashboard.flights.form.durationHint')} value={flightData.duration} onChange={e => handleFlightChange('duration', e.target.value)} className="p-2 border rounded text-sm" required />
                        <input type="number" placeholder={t('dashboard.flights.form.stops')} value={flightData.stops} onChange={e => handleFlightChange('stops', Number(e.target.value))} className="p-2 border rounded text-sm" required />
                        <input type="text" placeholder={t('dashboard.flights.form.baggageHint')} value={flightData.baggageAllowance} onChange={e => handleFlightChange('baggageAllowance', e.target.value)} className="p-2 border rounded text-sm" required />
                    </div>
                    {/* Departure & Arrival */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">{t('dashboard.flights.form.departure')}</label>
                           <SearchableSelect
                                value={flightData.departure.airportCode}
                                onChange={(value) => handleAirportChange('departure', value)}
                                options={airports.map(a => ({ value: a.iata, label: `${a.city[language]} (${a.iata})` }))}
                                placeholder={t('dashboard.flights.form.select')}
                           />
                           <input type="datetime-local" value={toDateTimeLocal(flightData.departure.dateTime)} onChange={e => handleEndpointChange('departure', 'dateTime', fromDateTimeLocal(e.target.value))} className="w-full p-2 border rounded text-sm mt-2" required />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-600 mb-1">{t('dashboard.flights.form.arrival')}</label>
                            <SearchableSelect
                                value={flightData.arrival.airportCode}
                                onChange={(value) => handleAirportChange('arrival', value)}
                                options={airports.map(a => ({ value: a.iata, label: `${a.city[language]} (${a.iata})` }))}
                                placeholder={t('dashboard.flights.form.select')}
                           />
                           <input type="datetime-local" value={toDateTimeLocal(flightData.arrival.dateTime)} onChange={e => handleEndpointChange('arrival', 'dateTime', fromDateTimeLocal(e.target.value))} className="w-full p-2 border rounded text-sm mt-2" required />
                        </div>
                    </div>
                </fieldset>

                {/* Passenger Details */}
                <fieldset className="border p-4 rounded-lg space-y-4">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.manualBooking.passengerDetails')}</legend>
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">{t('passengerDetails.adults')}</h4>
                        {passengers.adults.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 mb-2">
                                <PassengerForm passenger={p} onChange={(field, value) => handlePassengerChange('adults', i, field, value)} />
                                <button type="button" onClick={() => removePassenger('adults', i)} disabled={passengers.adults.length <= 1} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 disabled:opacity-50"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        <button type="button" onClick={() => addPassenger('adults')} className="text-sm font-semibold text-primary hover:text-purple-800 flex items-center gap-1"><PlusIcon className="w-4 h-4"/>{t('passengerDetails.adult', passengers.adults.length + 1)}</button>
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700 mb-2">{t('passengerDetails.children')}</h4>
                        {passengers.children.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 mb-2">
                                <PassengerForm passenger={p} onChange={(field, value) => handlePassengerChange('children', i, field, value)} />
                                <button type="button" onClick={() => removePassenger('children', i)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                         <button type="button" onClick={() => addPassenger('children')} className="text-sm font-semibold text-primary hover:text-purple-800 flex items-center gap-1"><PlusIcon className="w-4 h-4"/>{t('passengerDetails.child', passengers.children.length + 1)}</button>
                    </div>
                     <div>
                        <h4 className="font-semibold text-slate-700 mb-2">{t('passengerDetails.infants')}</h4>
                        {passengers.infants.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 mb-2">
                                <PassengerForm passenger={p} onChange={(field, value) => handlePassengerChange('infants', i, field, value)} />
                                <button type="button" onClick={() => removePassenger('infants', i)} className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                         <button type="button" onClick={() => addPassenger('infants')} className="text-sm font-semibold text-primary hover:text-purple-800 flex items-center gap-1"><PlusIcon className="w-4 h-4"/>{t('passengerDetails.infant', passengers.infants.length + 1)}</button>
                    </div>
                </fieldset>

                {/* Customer & Financials */}
                <fieldset className="border p-4 rounded-lg space-y-4">
                    <legend className="px-2 font-semibold text-primary">{t('dashboard.manualBooking.customerAndFinancials')}</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('dashboard.manualBooking.customer')}</label>
                            <SearchableSelect
                                value={customerId}
                                onChange={handleCustomerChange}
                                options={users.map(u => ({ value: u.id, label: `${u.name} (${u.username})`}))}
                                placeholder={t('dashboard.flights.form.select')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('dashboard.manualBooking.purchasePrice')} ({t('placeholders.rial')})</label>
                            <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} className="p-2 border rounded text-sm w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('passengerDetails.contactInfo')}</label>
                            <input type="email" placeholder={t('signup.email')} value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="p-2 border rounded text-sm w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('passengerDetails.phoneNumber')}</label>
                            <input type="tel" placeholder="09123456789" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="p-2 border rounded text-sm w-full" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('dashboard.manualBooking.buyerReference')}</label>
                            <input type="text" value={buyerReference} onChange={e => setBuyerReference(e.target.value)} className="p-2 border rounded text-sm w-full" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('dashboard.manualBooking.notes')}</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="p-2 border rounded text-sm w-full" rows={3}></textarea>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('dashboard.manualBooking.sellingPrice')} ({t('placeholders.rial')})</label>
                            <input type="number" value={flightData.price} onChange={e => handleFlightChange('price', Number(e.target.value))} className="p-2 border rounded text-sm w-full" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('dashboard.flights.form.taxes')} ({t('placeholders.rial')})</label>
                            <input type="number" value={flightData.taxes} onChange={e => handleFlightChange('taxes', Number(e.target.value))} className="p-2 border rounded text-sm w-full" required />
                        </div>
                    </div>
                </fieldset>
                
                <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-hover transition disabled:opacity-50">
                        {isLoading ? '...' : t('dashboard.manualBooking.createBooking')}
                    </button>
                </div>
            </form>
        </div>
    );
};