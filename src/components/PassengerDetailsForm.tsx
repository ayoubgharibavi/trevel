
import React, { useState } from 'react';
import type { Flight, SearchQuery, PassengerDetails, User, SavedPassenger, CurrencyInfo, PassengerData } from '@/types';
import { Gender, Nationality } from '@/types';
import { UserIcon } from '@/components/icons/UserIcon';
import { PriceSummary } from '@/components/PriceSummary';
import { useLocalization } from '@/hooks/useLocalization';
import { AddressBookIcon } from '@/components/icons/AddressBookIcon';
import { SavedPassengersModal } from '@/components/SavedPassengersModal';
import { Accordion } from '@/components/Accordion';
import { MailIcon } from '@/components/icons/MailIcon';
import { PhoneIcon } from '@/components/icons/PhoneIcon';
import { FlightSummaryCard } from '@/components/FlightSummaryCard';


interface PassengerDetailsFormProps {
    flight: Flight;
    query: SearchQuery;
    user: User;
    currencies: CurrencyInfo[];
    onBack: () => void;
    onSubmit: (data: PassengerData) => void;
}

const countries = [
  "أفغانستان", "ألبانيا", "الجزائر", "أندورا", "أنغولا", "أنتيغوا وبربودا", "الأرجنتين", "أرمينيا", "أستراليا", "النمسا",
  "أذربيجان", "جزر البهاما", "البحرين", "بنغلاديش", "بربادوس", "بيلاروسيا", "بلجيكا", "بليز", "بنين", "بوتان", "بوليفيا",
  "البوسنة والهرسك", "بوتسوانا", "البرازيل", "بروناي", "بلغاريا", "بوركينا فاسو", "بوروندي", "الرأس الأخضر", "كمبوديا",
  "الكاميرون", "كندا", "جمهورية أفريقيا الوسطى", "تشاد", "تشيلي", "الصين", "كولومبيا", "جزر القمر", "الكونغو، جمهورية الديمقراطية",
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


const PassengerInput: React.FC<{
    details: PassengerDetails;
    onChange: (field: keyof PassengerDetails, value: string | Gender | Nationality | boolean) => void;
    onSelectFromSaved: () => void;
}> = ({ details, onChange, onSelectFromSaved }) => {
    const { t } = useLocalization();
    
    return (
        <div className="space-y-6">
             {/* Nationality Toggle */}
             <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                 <div className="p-1 bg-slate-100 rounded-xl flex items-center shadow-inner">
                    <button 
                        type="button" 
                        onClick={() => onChange('nationality', Nationality.Iranian)} 
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                            details.nationality === Nationality.Iranian 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                                : 'text-slate-600 hover:text-slate-800'
                        }`}
                    >
                        {t('passengerDetails.iranian')}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => onChange('nationality', Nationality.Foreign)} 
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                            details.nationality === Nationality.Foreign 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                                : 'text-slate-600 hover:text-slate-800'
                        }`}
                    >
                        {t('passengerDetails.foreign')}
                    </button>
                 </div>
                 <button 
                    type="button" 
                    onClick={onSelectFromSaved} 
                    className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-300"
                >
                    <AddressBookIcon className="w-4 h-4" />
                    <span>{t('passengerDetails.selectFromList')}</span>
                </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        {t('passengerDetails.firstName')}
                    </label>
                    <input 
                        type="text" 
                        value={details.firstName || ''} 
                        onChange={(e) => onChange('firstName', e.target.value)} 
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg" 
                        placeholder={t('passengerDetails.firstNameEngHint')} 
                        required 
                        pattern="[A-Za-z\s]+" 
                        title={t('passengerDetails.englishCharsOnly')} 
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-blue-500" />
                        {t('passengerDetails.lastName')}
                    </label>
                    <input 
                        type="text" 
                        value={details.lastName || ''} 
                        onChange={(e) => onChange('lastName', e.target.value)} 
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg" 
                        placeholder={t('passengerDetails.lastNameEngHint')} 
                        required 
                        pattern="[A-Za-z\s]+" 
                        title={t('passengerDetails.englishCharsOnly')} 
                    />
                </div>
                
                {details.nationality === Nationality.Iranian ? (
                    <>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                </svg>
                                {t('passengerDetails.nationalId')}
                            </label>
                            <input 
                                type="text" 
                                value={details.nationalId || ''} 
                                onChange={(e) => onChange('nationalId', e.target.value)} 
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg font-mono" 
                                placeholder={t('passengerDetails.nationalIdHint')} 
                                required 
                                maxLength={10} 
                                pattern="\d{10}" 
                                title={t('passengerDetails.nationalIdError')} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {t('passengerDetails.gender')}
                            </label>
                            <select 
                                value={details.gender || ''} 
                                onChange={(e) => onChange('gender', e.target.value as Gender)} 
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg bg-white" 
                                required
                            >
                                <option value="" disabled>{t('passengerDetails.select')}</option>
                                <option value={Gender.Male}>{t('passengerDetails.male')}</option>
                                <option value={Gender.Female}>{t('passengerDetails.female')}</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {t('passengerDetails.passportNumber')}
                            </label>
                            <input 
                                type="text" 
                                value={details.passportNumber || ''} 
                                onChange={(e) => onChange('passportNumber', e.target.value)} 
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg font-mono" 
                                placeholder={t('passengerDetails.passportHint')} 
                                required 
                                pattern="[A-Za-z0-9]+" 
                                title={t('passengerDetails.engAndNumbersOnly')} 
                            />
                        </div>
                         <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {t('passengerDetails.issuingCountry')}
                            </label>
                            <select 
                                value={details.passportIssuingCountry || ''} 
                                onChange={(e) => onChange('passportIssuingCountry', e.target.value)} 
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg bg-white" 
                                required
                            >
                                <option value="" disabled>{t('passengerDetails.select')}</option>
                                {countries.map(country => (<option key={country} value={country}>{country}</option>))}
                            </select>
                         </div>
                    </>
                )}
            </div>
            
            {/* Save for Later Checkbox */}
            <div className="pt-6 border-t border-slate-200">
                <label className="flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        checked={!!details.saveForLater} 
                        onChange={(e) => onChange('saveForLater', e.target.checked)} 
                        className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded-lg focus:ring-4 focus:ring-blue-100 transition-all duration-300" 
                    />
                    <span className="group-hover:text-blue-600 transition-colors duration-300">
                        {t('passengerDetails.saveForLater')}
                    </span>
                </label>
            </div>
        </div>
    );
};
export const PassengerDetailsForm: React.FC<PassengerDetailsFormProps> = ({ flight, query, user, currencies, onBack, onSubmit }) => {
    const { t } = useLocalization();

    const createInitialPassengers = (count: number): PassengerDetails[] =>
        Array(count).fill(null).map(() => ({
            nationality: Nationality.Iranian,
            firstName: '',
            lastName: '',
            gender: '',
        }));

    const [adults, setAdults] = useState<PassengerDetails[]>(createInitialPassengers(query.passengers.adults));
    const [children, setChildren] = useState<PassengerDetails[]>(createInitialPassengers(query.passengers.children));
    const [infants, setInfants] = useState<PassengerDetails[]>(createInitialPassengers(query.passengers.infants));

    const [contactEmail, setContactEmail] = useState(user.email);
    const [contactPhone, setContactPhone] = useState('');
    
    const [openAccordion, setOpenAccordion] = useState<string | null>('adults-0');
    const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
    const [passengerToFill, setPassengerToFill] = useState<{ type: 'adults' | 'children' | 'infants'; index: number } | null>(null);

    const isPassengerComplete = (p: PassengerDetails) => {
        if (!p.firstName || !p.lastName || !p.gender) return false;
        if (p.nationality === Nationality.Iranian) return !!p.nationalId;
        return !!p.passportNumber;
    };

    const handlePassengerChange = (
        type: 'adults' | 'children' | 'infants',
        index: number,
        field: keyof PassengerDetails,
        value: string | Gender | Nationality | boolean
    ) => {
        const setters = { adults: setAdults, children: setChildren, infants: setInfants };
        setters[type](prev => {
            const newPassengers = [...prev];
            newPassengers[index] = { ...newPassengers[index], [field]: value };
            return newPassengers;
        });
    };
    
    const handleOpenSavedModal = (type: 'adults' | 'children' | 'infants', index: number) => {
        setPassengerToFill({ type, index });
        setIsSavedModalOpen(true);
    };

    const handleSelectSavedPassenger = (savedPassenger: SavedPassenger) => {
        if (!passengerToFill) return;
        const { type, index } = passengerToFill;
        const setters = { adults: setAdults, children: setChildren, infants: setInfants };
        setters[type](prev => {
            const newPassengers = [...prev];
            newPassengers[index] = { ...newPassengers[index], ...savedPassenger };
            return newPassengers;
        });
        setIsSavedModalOpen(false);
        setPassengerToFill(null);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            adults,
            children,
            infants,
            contactEmail,
            contactPhone,
        });
    };
    
    const renderPassengerForms = (type: 'adults' | 'children' | 'infants', count: number, passengers: PassengerDetails[]) => {
        if (count === 0) return null;
        
        return Array(count).fill(null).map((_, index) => {
            const passenger = passengers[index];
            const passengerName = passenger.firstName && passenger.lastName ? `: ${passenger.firstName} ${passenger.lastName}` : '';
            const accordionTitle = `${t(`passengerDetails.${type.slice(0, -1)}` as any, (index + 1).toString())}${passengerName}`;

             return <Accordion
                key={`${type}-${index}`}
                title={accordionTitle}
                isOpen={openAccordion === `${type}-${index}`}
                onToggle={() => setOpenAccordion(openAccordion === `${type}-${index}` ? null : `${type}-${index}`)}
                isComplete={isPassengerComplete(passengers[index])}
            >
                <PassengerInput
                    details={passengers[index]}
                    onChange={(field, value) => handlePassengerChange(type, index, field, value)}
                    onSelectFromSaved={() => handleOpenSavedModal(type, index)}
                />
            </Accordion>
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            <div className="container mx-auto px-4 py-8">
                {isSavedModalOpen && (
                     <SavedPassengersModal
                        isOpen={isSavedModalOpen}
                        onClose={() => setIsSavedModalOpen(false)}
                        passengers={user.savedPassengers || []}
                        onSelect={handleSelectSavedPassenger}
                    />
                )}
                <form onSubmit={handleFormSubmit}>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                         <div className="lg:col-span-2 space-y-8">
                             {/* Header Section */}
                             <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                                        <UserIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                                        {t('passengerDetails.title')}
                                    </h2>
                                    <p className="text-slate-600 text-lg font-medium">{t('passengerDetails.subtitle')}</p>
                                </div>
                                
                                {/* Progress Indicator */}
                                <div className="bg-slate-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                                        <span>اطلاعات مسافران</span>
                                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">مرحله 2 از 3</span>
                                    </div>
                                    <div className="mt-3 w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{width: '66%'}}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Passenger Forms */}
                            <div className="space-y-6">
                                {renderPassengerForms('adults', query.passengers.adults, adults)}
                                {renderPassengerForms('children', query.passengers.children, children)}
                                {renderPassengerForms('infants', query.passengers.infants, infants)}
                            </div>

                            {/* Contact Information */}
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800">{t('passengerDetails.contactInfo')}</h3>
                                        <p className="text-slate-500 font-medium">{t('passengerDetails.contactInfoSubtitle')}</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <MailIcon className="w-4 h-4 text-blue-500" />
                                            {t('signup.email')}
                                        </label>
                                        <input 
                                            type="email" 
                                            id="email" 
                                            value={contactEmail} 
                                            onChange={e => setContactEmail(e.target.value)} 
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg" 
                                            required 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                         <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <PhoneIcon className="w-4 h-4 text-blue-500" />
                                            {t('passengerDetails.phoneNumber')}
                                        </label>
                                        <input 
                                            type="tel" 
                                            id="phone" 
                                            value={contactPhone} 
                                            onChange={e => setContactPhone(e.target.value)} 
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 text-lg" 
                                            required 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Sidebar */}
                        <aside className="lg:col-span-1 lg:sticky top-8 space-y-6">
                            <FlightSummaryCard flight={flight} />
                            <PriceSummary flight={flight} passengers={query.passengers} user={user} currencies={currencies} onBack={onBack} />
                        </aside>
                    </div>
                </form>
            </div>
        </div>
    );
};
