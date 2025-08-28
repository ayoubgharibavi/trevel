





import React, { useState } from 'react';
import type { Flight, SearchQuery, PassengerDetails, User, SavedPassenger, CurrencyInfo } from '../types';
import { Gender, Nationality } from '../types';
import { UserIcon } from './icons/UserIcon';
import { PriceSummary } from './PriceSummary';
import { useLocalization } from '../hooks/useLocalization';
import { AddressBookIcon } from './icons/AddressBookIcon';
import { SavedPassengersModal } from './SavedPassengersModal';
import { Accordion } from './Accordion';
import { MailIcon } from './icons/MailIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { FlightSummaryCard } from './FlightSummaryCard';


interface PassengerDetailsFormProps {
    flight: Flight;
    query: SearchQuery;
    user: User;
    currencies: CurrencyInfo[];
    onBack: () => void;
    onSubmit: (data: PassengerData) => void;
}

export type PassengerData = {
    adults: PassengerDetails[];
    children: PassengerDetails[];
    infants: PassengerDetails[];
    contactEmail: string;
    contactPhone: string;
};

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
        <div className="space-y-4">
             <div className="flex items-center justify-between pb-4 border-b">
                 <div className="p-1 bg-slate-100 rounded-lg flex items-center">
                    <button type="button" onClick={() => onChange('nationality', Nationality.Iranian)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${details.nationality === Nationality.Iranian ? 'bg-white shadow-sm text-primary' : 'text-slate-600'}`}>{t('passengerDetails.iranian')}</button>
                    <button type="button" onClick={() => onChange('nationality', Nationality.Foreign)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${details.nationality === Nationality.Foreign ? 'bg-white shadow-sm text-primary' : 'text-slate-600'}`}>{t('passengerDetails.foreign')}</button>
                 </div>
                 <button type="button" onClick={onSelectFromSaved} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    <AddressBookIcon className="w-4 h-4" />
                    <span>{t('passengerDetails.selectFromList')}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('passengerDetails.firstName')}</label>
                    <input type="text" value={details.firstName || ''} onChange={(e) => onChange('firstName', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder={t('passengerDetails.firstNameEngHint')} required pattern="[A-Za-z\s]+" title={t('passengerDetails.englishCharsOnly')} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">{t('passengerDetails.lastName')}</label>
                    <input type="text" value={details.lastName || ''} onChange={(e) => onChange('lastName', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder={t('passengerDetails.lastNameEngHint')} required pattern="[A-Za-z\s]+" title={t('passengerDetails.englishCharsOnly')} />
                </div>
                
                {details.nationality === Nationality.Iranian ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('passengerDetails.nationalId')}</label>
                            <input type="text" value={details.nationalId || ''} onChange={(e) => onChange('nationalId', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder={t('passengerDetails.nationalIdHint')} required maxLength={10} pattern="\d{10}" title={t('passengerDetails.nationalIdError')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('passengerDetails.gender')}</label>
                            <select value={details.gender || ''} onChange={(e) => onChange('gender', e.target.value as Gender)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" required>
                                <option value="" disabled>{t('passengerDetails.select')}</option>
                                <option value={Gender.Male}>{t('passengerDetails.male')}</option>
                                <option value={Gender.Female}>{t('passengerDetails.female')}</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('passengerDetails.passportNumber')}</label>
                            <input type="text" value={details.passportNumber || ''} onChange={(e) => onChange('passportNumber', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder={t('passengerDetails.passportHint')} required pattern="[A-Za-z0-9]+" title={t('passengerDetails.engAndNumbersOnly')} />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">{t('passengerDetails.issuingCountry')}</label>
                            <select value={details.passportIssuingCountry || ''} onChange={(e) => onChange('passportIssuingCountry', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white" required>
                                <option value="" disabled>{t('passengerDetails.select')}</option>
                                {countries.map(country => (<option key={country} value={country}>{country}</option>))}
                            </select>
                         </div>
                    </>
                )}
            </div>
            <div className="pt-4 border-t">
                <label className="flex items-center text-sm">
                    <input type="checkbox" checked={!!details.saveForLater} onChange={(e) => onChange('saveForLater', e.target.checked)} className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-accent ml-2" />
                    <span>{t('passengerDetails.saveForLater')}</span>
                </label>
            </div>
        </div>
    );
};
// FIX: Implement the missing PassengerDetailsForm component
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
                         <div>
                            <h2 className="text-3xl font-bold mb-2 text-slate-800">{t('passengerDetails.title')}</h2>
                            <p className="text-slate-500">{t('passengerDetails.subtitle')}</p>
                         </div>
                         <div className="space-y-4">
                            {renderPassengerForms('adults', query.passengers.adults, adults)}
                            {renderPassengerForms('children', query.passengers.children, children)}
                            {renderPassengerForms('infants', query.passengers.infants, infants)}
                        </div>

                         <div className="bg-white p-6 rounded-lg shadow-sm border">
                             <h3 className="text-xl font-bold text-slate-800 mb-4">{t('passengerDetails.contactInfo')}</h3>
                             <p className="text-sm text-slate-500 mb-4">{t('passengerDetails.contactInfoSubtitle')}</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-2"><MailIcon className="w-4 h-4" />{t('signup.email')}</label>
                                    <input type="email" id="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                                </div>
                                <div>
                                     <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1 flex items-center gap-2"><PhoneIcon className="w-4 h-4" />{t('passengerDetails.phoneNumber')}</label>
                                    <input type="tel" id="phone" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg" required />
                                </div>
                             </div>
                         </div>
                     </div>
                     <aside className="lg:col-span-1 lg:sticky top-8 space-y-6">
                         <FlightSummaryCard flight={flight} />
                         <PriceSummary flight={flight} passengers={query.passengers} user={user} currencies={currencies} onBack={onBack} />
                     </aside>
                 </div>
            </form>
        </div>
    );
};